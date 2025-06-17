import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const [name, setName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  // Helper to get current user email
  const getCurrentUserEmail = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user.email;
  };

  // Save profile name for current user
  const handleSaveName = async () => {
    const email = await getCurrentUserEmail();
    if (!email) {
      Alert.alert('No user logged in.');
      return;
    }
    await AsyncStorage.setItem(`profileName_${email}`, name);
    Alert.alert('Profile name saved!');
  };

  // Load profile name for current user on mount
  useEffect(() => {
    (async () => {
      const email = await getCurrentUserEmail();
      if (!email) return;
      const savedName = await AsyncStorage.getItem(`profileName_${email}`);
      if (savedName) setName(savedName);
    })();
    Notifications.requestPermissionsAsync();
  }, []);

  const scheduleReminder = async (enabled: boolean) => {
    setReminderEnabled(enabled);
    if (enabled) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'MoodCam Reminder',
          body: 'Don’t forget to log your mood and selfie today!',
        },
        trigger: {
          hour: 21,
          minute: 0,
          repeats: true,
        } as unknown as Notifications.NotificationTriggerInput,
      });
      Alert.alert('Daily reminder set for 9:00 PM!');
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert('Daily reminder disabled.');
    }
  };

  const handleClearData = async () => {
    const email = await getCurrentUserEmail();
    if (!email) {
      Alert.alert('No user logged in.');
      return;
    }
    const key = `moodEntries_${email}`;
    Alert.alert('Clear All Data', 'Are you sure you want to clear all mood entries?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        await AsyncStorage.removeItem(key);
        Alert.alert('Data cleared!');
      }},
    ]);
  };

  const handleExport = async () => {
    const email = await getCurrentUserEmail();
    if (!email) {
      Alert.alert('No user logged in.');
      return;
    }
    const key = `moodEntries_${email}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      try {
        const fileUri = FileSystem.cacheDirectory + 'moodcam-export.json';
        await FileSystem.writeAsStringAsync(fileUri, data, { encoding: FileSystem.EncodingType.UTF8 });
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export MoodCam Data',
        });
      } catch (e) {
        Alert.alert('Export Failed', 'Could not export data.');
      }
    } else {
      Alert.alert('No data to export.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings & Profile</Text>
      <Text style={styles.label}>Profile Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleSaveName}>
        <Text style={styles.buttonText}>Save Name</Text>
      </TouchableOpacity>
      <View style={styles.row}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Daily Reminder (9:00 PM)</Text>
        <Switch value={reminderEnabled} onValueChange={scheduleReminder} />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleExport}>
        <Text style={styles.buttonText}>Export Data (JSON)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#ff4d4d' }]} onPress={handleClearData}>
        <Text style={[styles.buttonText, { color: '#fff' }]}>Clear All Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    width: 220,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: 220,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#ffd700',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 12,
  },
  buttonText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
});
