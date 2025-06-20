import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const moodQuotes: { [key: string]: string[] } = {
  'Happy': [
    "Happiness is not out there, it's in you.",
    "Joy is the simplest form of gratitude.",
    "Your smile is contagious, keep spreading it!",
    "Happiness is a choice, and you're choosing it well.",
    "Every moment of joy is a victory worth celebrating.",
    "Your positive energy lights up the world around you.",
    "Happiness is the art of never holding in your mind the memory of any unpleasant thing.",
    "The more you praise and celebrate your life, the more there is in life to celebrate.",
    "Your happiness is a gift to everyone around you.",
    "Today is a good day to have a good day.",
    "Happiness is not something ready-made. It comes from your own actions.",
    "You are worthy of all the happiness life has to offer.",
    "Your joy is your strength.",
    "Happiness is the natural state of mind when you're being true to yourself.",
    "Every day brings new opportunities for happiness."
  ],
  'Sad': [
    "It's okay to not be okay. Healing takes time.",
    "Your feelings are valid, even the difficult ones.",
    "This too shall pass. You are stronger than you know.",
    "It's okay to cry. Tears are how your heart speaks.",
    "You don't have to be strong all the time.",
    "Sadness is just a visitor, not a permanent resident.",
    "Your pain is real, and so is your strength.",
    "It's okay to take time to heal.",
    "You are not alone in your sadness.",
    "Every storm runs out of rain.",
    "Your feelings matter, even when they're heavy.",
    "It's okay to ask for help when you're hurting.",
    "You are allowed to feel sad without feeling guilty.",
    "Healing is not linear, and that's perfectly normal.",
    "Your heart is resilient, even when it's broken."
  ],
  'Anxious': [
    "Breathe. You are safe in this moment.",
    "Anxiety is just your mind being overprotective.",
    "You've survived 100% of your worst days.",
    "This feeling is temporary. You will get through this.",
    "Take it one breath at a time.",
    "You are stronger than your anxiety.",
    "It's okay to feel anxious. It's not okay to let it control you.",
    "Your mind is playing tricks on you. You are safe.",
    "Anxiety is a liar. Don't believe everything you think.",
    "You have the power to calm your mind.",
    "This moment is all that matters right now.",
    "You are not your thoughts. You are the observer of your thoughts.",
    "Anxiety is temporary. Your strength is permanent.",
    "You've handled difficult situations before. You can handle this too.",
    "Focus on what you can control. Let go of what you can't."
  ],
  'Angry': [
    "Your anger is valid, but it doesn't define you.",
    "It's okay to be angry. It's not okay to let anger control you.",
    "Anger is often a mask for other emotions.",
    "You have the right to feel angry, but you also have the right to peace.",
    "Your anger is a signal that something needs to change.",
    "It's okay to take time to cool down.",
    "Anger is energy. Channel it into something positive.",
    "You are not your anger. You are so much more.",
    "It's okay to be upset. It's not okay to stay upset.",
    "Your feelings are real, but they don't have to rule you.",
    "Anger is temporary. Your peace is worth more.",
    "You have the power to choose how you respond.",
    "It's okay to feel angry. It's not okay to hurt others.",
    "Your anger is a teacher. What is it trying to tell you?",
    "You deserve to feel calm and at peace."
  ],
  'Loved': [
    "You are surrounded by love, even when you can't feel it.",
    "Love is not something you find, it's something you become.",
    "You are worthy of love, exactly as you are.",
    "Your heart is a beautiful thing. Protect it.",
    "Love yourself first, and everything else falls into place.",
    "You are loved more than you could ever imagine.",
    "Your capacity to love is infinite.",
    "Love is the answer to everything.",
    "You are deserving of all the love in the world.",
    "Your love makes the world a better place.",
    "You are a magnet for love and positivity.",
    "Love yourself, and the world will love you back.",
    "Your heart is full of beautiful things.",
    "You are loved beyond measure.",
    "Love is your superpower."
  ],
  'default': [
    "Your feelings are valid.",
    "You are not alone.",
    "It's okay not to be okay.",
    "You are stronger than you think.",
    "Every day is a new beginning.",
    "You are capable of amazing things.",
    "Be kind to yourself.",
    "Your presence is a gift to the world.",
    "You are deserving of happiness.",
    "Small steps lead to big progress.",
    "You are enough, exactly as you are.",
    "Your journey is unique and beautiful.",
    "You have the power to create change.",
    "Trust the process of your own growth.",
    "You are becoming the person you're meant to be."
  ]
};

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [lastMood, setLastMood] = useState('');
  const [lastMoodLabel, setLastMoodLabel] = useState('');
  const [streak, setStreak] = useState(0);
  const [streakMood, setStreakMood] = useState('');
  const [quote, setQuote] = useState('');
  const today = new Date().toLocaleDateString();

  useEffect(() => {
    // Set initial quote and start rotating
    const intervalId = setInterval(() => {
      setQuote(currentQuote => {
        const moodLabel = lastMoodLabel || 'default';
        const quotes = moodQuotes[moodLabel] || moodQuotes['default'];
        let nextQuote;
        do {
          nextQuote = quotes[Math.floor(Math.random() * quotes.length)];
        } while (nextQuote === currentQuote && quotes.length > 1);
        return nextQuote;
      });
    }, 3000); // Rotate every 3 seconds

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
          setLastMoodLabel(last.mood.label);
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
      const lastMoodText = await getLastMood(user.email);
      setLastMood(lastMoodText);
      const streakInfo = await getStreak(user.email);
      setStreak(streakInfo.streak);
      setStreakMood(streakInfo.mood);
      
      // Set initial quote based on mood
      const moodLabel = lastMoodText !== 'No entry yet' ? lastMoodText.split(' ').slice(1).join(' ') : 'default';
      const quotes = moodQuotes[moodLabel] || moodQuotes['default'];
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    })();

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [lastMoodLabel]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/'); // Go back to welcome/login screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {userName}!</Text>
      <Text style={styles.date}>{today}</Text>

      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>"{quote}"</Text>
        {lastMood !== 'No entry yet' && (
          <Text style={styles.moodIndicator}>{lastMood}</Text>
        )}
      </View>

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
  quoteContainer: {
    backgroundColor: '#e6f3ff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 18,
    alignItems: 'center',
    width: '100%',
  },
  quoteText: {
    fontSize: 15,
    color: '#005a9e',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  moodIndicator: {
    fontSize: 12,
    color: '#005a9e',
    fontWeight: 'bold',
    opacity: 0.8,
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
