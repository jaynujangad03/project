import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = React.useState('');
  const [lastMood, setLastMood] = React.useState('');
  const today = new Date().toLocaleDateString();

  React.useEffect(() => {
    // Get current user's first name from registration
    const getCurrentUserFirstName = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return 'User';
      const user = JSON.parse(userStr);
      return user.firstName || 'User';
    };
    // Get last mood for current user
    const getLastMood = async (email: string) => {
      const key = `moodEntries_${email}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const entries = JSON.parse(data);
        if (entries.length > 0) {
          const last = entries[entries.length - 1];
          return `${last.mood.emoji} ${last.mood.label}`;
        }
      }
      return 'No entry yet';
    };
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      setUserName(user.firstName || 'User');
      setLastMood(await getLastMood(user.email));
    })();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/'); // Go back to welcome/login screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {userName}! 😊</Text>
      <Text style={styles.date}>{today}</Text>
      <Text style={styles.lastMood}>Your last mood: {lastMood}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('../(entry)/entry')}>
          <Text style={styles.cardText}>📸 Take Mood Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => router.push('../(calendar)/calendar')}>
          <Text style={styles.cardText}>📅 Calendar View</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('../(trends)/trends')}>
          <Text style={styles.cardText}>📈 Mood Trends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => router.push('../(settings)/settings')}>
          <Text style={styles.cardText}>⚙️ Settings/Profile</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.button, { marginTop: 30, backgroundColor: '#ff4d4d' }]} onPress={handleLogout}>
        <Text style={[styles.cardText, { color: '#fff' }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  lastMood: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
