import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😭', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😍', label: 'Loved' },
];

export default function EntryScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = React.useRef<null | any>(null);
  const [permission, requestPermission] = useCameraPermissions();

  React.useEffect(() => {
    if (permission && permission.status !== 'granted') {
      requestPermission();
    }
    setHasPermission(permission?.status === 'granted');
  }, [permission]);

  const takePhoto = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync();
      setPhoto(result.uri);
      setCameraVisible(false);
    }
  };

  // Helper to get current user email
  const getCurrentUserEmail = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user.email;
  };

  const saveEntry = async () => {
    if (selectedMood === null || !photo) {
      alert('Please take a selfie and select your mood.');
      return;
    }
    const entry = {
      date: new Date().toISOString().split('T')[0],
      mood: moods[selectedMood],
      note,
      photo,
    };
    try {
      const email = await getCurrentUserEmail();
      if (!email) {
        alert('No user logged in.');
        return;
      }
      const key = `moodEntries_${email}`;
      const existing = await AsyncStorage.getItem(key);
      const entries = existing ? JSON.parse(existing) : [];
      entries.push(entry);
      await AsyncStorage.setItem(key, JSON.stringify(entries));
      alert('Mood entry saved!');
      setSelectedMood(null);
      setNote('');
      setPhoto(null);
    } catch (e) {
      alert('Failed to save entry.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling today?</Text>
      <TouchableOpacity onPress={() => setCameraVisible(true)}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.selfiePlaceholder} />
        ) : (
          <View style={styles.selfiePlaceholder}>
            <Text style={{ fontSize: 32 }}>📸</Text>
            <Text style={{ color: '#aaa' }}>Take a Selfie</Text>
          </View>
        )}
      </TouchableOpacity>
      <Modal visible={cameraVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          {hasPermission === false ? (
            <Text style={{ color: 'white', marginTop: 50, textAlign: 'center' }}>No access to camera</Text>
          ) : (
            <CameraView style={{ flex: 1 }} facing="front" ref={cameraRef}>
              <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 40 }}>
                <TouchableOpacity style={styles.captureButton} onPress={takePhoto} />
                <TouchableOpacity style={styles.closeButton} onPress={() => setCameraVisible(false)}>
                  <Text style={{ color: 'white', fontSize: 18 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          )}
        </View>
      </Modal>
      <Text style={styles.subtitle}>Select your mood:</Text>
      <View style={styles.moodRow}>
        {moods.map((mood, idx) => (
          <TouchableOpacity
            key={mood.emoji}
            style={[styles.moodButton, selectedMood === idx && styles.moodSelected]}
            onPress={() => setSelectedMood(idx)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.noteInput}
        placeholder="Add a note (optional, max 280 chars)"
        value={note}
        onChangeText={setNote}
        maxLength={280}
        multiline
      />
      <TouchableOpacity style={styles.submitButton} onPress={saveEntry}>
        <Text style={styles.submitText}>Submit</Text>
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
  selfiePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  moodRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  moodButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f5f6fa',
  },
  moodSelected: {
    backgroundColor: '#ffd700',
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  noteInput: {
    width: '100%',
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#ffd700',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  submitText: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#ffd700',
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
});
