import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😍', label: 'Loved' },
  { emoji: '😎', label: 'Cool' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '😴', label: 'Sleepy' },
  { emoji: '😅', label: 'Relieved' },
  { emoji: '😱', label: 'Shocked' },
  { emoji: '😇', label: 'Blessed' },
  { emoji: '🤗', label: 'Hug' },
  { emoji: '😤', label: 'Determined' },
  { emoji: '😜', label: 'Playful' },
  { emoji: '🥳', label: 'Celebrating' },
  { emoji: '😔', label: 'Disappointed' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😬', label: 'Awkward' },
  { emoji: '😭', label: 'Crying' },
  { emoji: '😋', label: 'Satisfied'},
];

const motivationalQuotes = [
  "Believe in yourself and all that you are.",
  "Every day is a new beginning.",
  "You are stronger than you think.",
  "Difficult roads often lead to beautiful destinations.",
  "Your only limit is your mind.",
  "Stay positive, work hard, make it happen.",
  "You are capable of amazing things.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success is not for the lazy.",
  "Don't watch the clock; do what it does. Keep going.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Little by little, day by day, what is meant for you will find its way.",
  "Doubt kills more dreams than failure ever will.",
  "You don't have to be perfect to be amazing.",
  "Start where you are. Use what you have. Do what you can.",
  "Difficulties in life are intended to make us better, not bitter.",
  "You are enough just as you are.",
  "Keep going. Everything you need will come to you.",
  "You are the author of your own story.",
  "Progress, not perfection.",
  "You are braver than you believe, stronger than you seem, and smarter than you think.",
  "Mistakes are proof that you are trying.",
  "The best way to get started is to quit talking and begin doing.",
  "Difficult doesn't mean impossible.",
  "You've got this!",
  "Be the reason someone smiles today.",
  "Your vibe attracts your tribe.",
  "The only time you fail is when you fall down and stay down.",
  "You are worthy of all the good things in life.",
  "Don't be afraid to give up the good to go for the great.",
  "If you get tired, learn to rest, not to quit.",
  "You are making a difference every day.",
  "The comeback is always stronger than the setback.",
  "You are not alone."
];

const moodColors: Record<string, string> = {
  Happy: '#fffbe6', // light yellow
  Sad: '#e3f0ff',   // muted blue
  Anxious: '#edeaff', // soft purple
  Angry: '#ffeaea',  // soft red
  Loved: '#fff0e6',  // peach
};

export default function EntryScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const cameraRef = React.useRef<null | any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const todayStr = new Date().toISOString().split('T')[0];
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteToShow, setQuoteToShow] = useState('');

  React.useEffect(() => {
    if (permission && permission.status !== 'granted') {
      requestPermission();
    }
    setHasPermission(permission?.status === 'granted');
  }, [permission]);

  React.useEffect(() => {
    // Check if today's entry already exists
    (async () => {
      const email = await getCurrentUserEmail();
      if (!email) return;
      const key = `moodEntries_${email}`;
      const existing = await AsyncStorage.getItem(key);
      if (existing) {
        const entries = JSON.parse(existing);
        if (entries.some((e: any) => e.date === todayStr)) {
          setTodayMood(entries.find((e: any) => e.date === todayStr).mood.label);
        }
      }
    })();
  }, []);

  React.useEffect(() => {
    // Schedule daily reminder notification
    (async () => {
      const email = await getCurrentUserEmail();
      if (!email) return;
      const key = `moodEntries_${email}`;
      const existing = await AsyncStorage.getItem(key);
      let submittedToday = false;
      if (existing) {
        const entries = JSON.parse(existing);
        if (entries.some((e: any) => e.date === todayStr)) {
          submittedToday = true;
        }
      }
      // Cancel previous reminders
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (!submittedToday) {
        // Schedule a new reminder for 8:30 PM today
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(20, 30, 0, 0); // 8:30 PM
        if (reminderTime > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'MoodCam Reminder',
              body: "How are you feeling today? Don't forget to check in 💬",
              sound: true,
            },
            trigger: reminderTime as any, // Type workaround for Expo SDK 53+
          });
        }
      }
    })();
  }, []);

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
      date: todayStr,
      mood: moods[selectedMood],
      note,
      photo,
      timestamp: Date.now(),
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
      entries.push(entry); // Allow multiple per day
      await AsyncStorage.setItem(key, JSON.stringify(entries));
      // Show random motivational quote
      const randomIdx = Math.floor(Math.random() * motivationalQuotes.length);
      setQuoteToShow(motivationalQuotes[randomIdx]);
      setShowQuoteModal(true);
      setSelectedMood(null);
      setNote('');
      setPhoto(null);
      setTimeout(() => {
        setShowQuoteModal(false);
        router.replace('/(dashboard)/home');
      }, 2500);
    } catch (e) {
      alert('Failed to save entry.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: todayMood && moodColors[todayMood] ? moodColors[todayMood] : '#fff' }]}> 
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
      <View style={{ width: '100%', alignItems: 'center' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8, alignItems: 'center' }}>
          {moods.map((mood, idx) => (
            <TouchableOpacity
              key={mood.emoji + mood.label}
              style={[styles.moodButton, selectedMood === idx && styles.moodSelected]}
              onPress={() => setSelectedMood(idx)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={styles.moodLabel}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <TextInput
        style={styles.noteInput}
        placeholder="Why are you feeling this way? (1–3 lines, optional)"
        value={note}
        onChangeText={setNote}
        maxLength={280}
        multiline
        numberOfLines={3}
      />
      <TouchableOpacity style={styles.submitButton} onPress={saveEntry}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
      <Modal visible={showQuoteModal} transparent animationType="fade">
        <View style={styles.quoteModalOverlay}>
          <View style={styles.quoteModalBox}>
            <Text style={styles.quoteTitle}>Motivational Quote</Text>
            <Text style={styles.quoteText}>{quoteToShow}</Text>
          </View>
        </View>
      </Modal>
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
  quoteModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  quoteModalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 28, alignItems: 'center', maxWidth: 320, marginHorizontal: 24 },
  quoteTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#007aff' },
  quoteText: { fontSize: 18, color: '#333', textAlign: 'center' },
});
