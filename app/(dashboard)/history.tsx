import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MoodHistoryScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const filteredEntries = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });
  }, [entries, currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  return (
    <View style={styles.outer}>
      <Text style={styles.title}>Mood History Timeline</Text>
      <View style={styles.pickerContainer}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.pickerText}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton}>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredEntries.length === 0 ? (
          <Text style={styles.empty}>No entries for this month.</Text>
        ) : (
          filteredEntries.map((entry, idx) => (
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
    marginBottom: 12,
    textAlign: 'center',
    marginTop: 60, // Add margin to push the title down
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  arrowButton: {
    paddingHorizontal: 20,
  },
  arrowText: {
    fontSize: 24,
    color: '#007aff',
  },
  pickerText: {
    fontSize: 18,
    fontWeight: 'bold',
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
    fontSize: 16,
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
