import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function MoodHistoryScreen() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const key = `moodEntries_${user.email}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        // Sort by date descending
        setEntries(parsed.sort((a: any, b: any) => b.date.localeCompare(a.date)));
      }
    })();
  }, []);

  return (
    <View style={styles.outer}>
      <Text style={styles.title}>Mood History Timeline</Text>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {entries.length === 0 ? (
          <Text style={styles.empty}>No entries yet.</Text>
        ) : (
          entries.map((entry, idx) => (
            <View key={idx} style={styles.entry}>
              <Image source={{ uri: entry.photo }} style={styles.photo} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.date}>{entry.date}</Text>
                <Text style={styles.mood}>{entry.mood.emoji} {entry.mood.label}</Text>
                {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f5f6fa',
    paddingTop: 40,
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 60, // Add margin to push the title down
  },
  scrollContent: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 40,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 1,
    width: 320,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eee',
  },
  date: {
    fontSize: 14,
    color: '#555',
  },
  mood: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  note: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
});
