import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = React.useState('');
  const [lastMood, setLastMood] = React.useState('');
  const [streak, setStreak] = React.useState(0);
  const [streakMood, setStreakMood] = React.useState('');
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
    // Calculate streak for current user
    const getStreak = async (email: string) => {
      const key = `moodEntries_${email}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const entries = JSON.parse(data).sort((a: any, b: any) => b.date.localeCompare(a.date));
        if (entries.length === 0) return { streak: 0, mood: '' };
        let streak = 1;
        let lastMood = entries[0].mood.label;
        let lastDate = new Date(entries[0].date);
        for (let i = 1; i < entries.length; i++) {
          const entry = entries[i];
          const entryDate = new Date(entry.date);
          // Check if previous day
          const diff = (lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1 && entry.mood.label === lastMood) {
            streak++;
            lastDate = entryDate;
          } else {
            break;
          }
        }
        return { streak, mood: lastMood };
      }
      return { streak: 0, mood: '' };
    };
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      setUserName(user.firstName || 'User');
      setLastMood(await getLastMood(user.email));
      const streakInfo = await getStreak(user.email);
      setStreak(streakInfo.streak);
      setStreakMood(streakInfo.mood);
    })();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/'); // Go back to welcome/login screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {userName}!</Text>
      <Text style={styles.date}>{today}</Text>
      <View style={styles.moodCard}>
        <Text style={styles.moodLabel}>Your last mood</Text>
        <Text style={styles.moodEmoji}>{lastMood}</Text>
        {streak > 1 && (
          <Text style={styles.streak}>{streak} days {streakMood.toLowerCase()} in a row!</Text>
        )}
      </View>
      <View style={styles.gridRow}>
        <TouchableOpacity style={styles.gridButton} onPress={() => router.push('../(entry)/entry')}>
          <Text style={styles.gridIcon}>📸</Text>
          <Text style={styles.gridText}>Mood Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={() => router.push('../(calendar)/calendar')}>
          <Text style={styles.gridIcon}>📅</Text>
          <Text style={styles.gridText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={() => router.push('../(dashboard)/history')}>
          <Text style={styles.gridIcon}>🕰️</Text>
          <Text style={styles.gridText}>History</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.gridRow}>
        <TouchableOpacity style={styles.gridButton} onPress={() => router.push('../(dashboard)/weekly-summary')}>
          <Text style={styles.gridIcon}>📊</Text>
          <Text style={styles.gridText}>Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={() => router.push('../(dashboard)/gallery')}>
          <Text style={styles.gridIcon}>🖼️</Text>
          <Text style={styles.gridText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={() => router.push('../(trends)/trends')}>
          <Text style={styles.gridIcon}>📈</Text>
          <Text style={styles.gridText}>Trends</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('../(settings)/settings')}>
        <Text style={styles.settingsText}>⚙️ Settings & Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f5f6fa',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  date: {
    fontSize: 16,
    color: '#888',
    marginBottom: 18,
  },
  moodCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  moodLabel: {
    fontSize: 16,
    color: '#888',
    marginBottom: 6,
  },
  moodEmoji: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  streak: {
    fontSize: 15,
    color: '#4caf50',
    marginTop: 2,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  gridButton: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  gridIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  gridText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  settingsButton: {
    width: '100%',
    backgroundColor: '#e3e3e3',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  settingsText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#ff4d4d',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
