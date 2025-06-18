import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface MarkedDate {
  marked: boolean;
  customStyles: any;
  mood: string;
}

export default function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState<Record<string, MarkedDate>>({});
  const [selectedDayEntries, setSelectedDayEntries] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const isFocused = useIsFocused();

  // Helper to get current user email
  const getCurrentUserEmail = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user.email;
  };

  useEffect(() => {
    const fetchEntries = async () => {
      const email = await getCurrentUserEmail();
      if (!email) return;
      const key = `moodEntries_${email}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const entries = JSON.parse(data);
        console.log('Loaded entries from AsyncStorage:', entries);
        setEntries(entries);
        const marks: Record<string, MarkedDate> = {};
        // Only show the latest mood for each date
        const latestEntryMap: Record<string, any> = {};
        entries.forEach((entry: any) => {
          latestEntryMap[entry.date] = entry; // overwrite to keep the latest
        });
        Object.entries(latestEntryMap).forEach(([date, entry]) => {
          marks[date] = {
            marked: true,
            customStyles: {
              container: { backgroundColor: '#ffd700' },
              text: { fontSize: 20 },
            },
            mood: entry.mood.emoji,
          };
        });
        setMarkedDates(marks);
      } else {
        setEntries([]);
        setMarkedDates({});
      }
    };
    fetchEntries();
  }, [isFocused]);

  const handleDayPress = (day: any) => {
    // Ensure both are strings and trimmed
    const pressedDate = String(day.dateString).trim();
    const dayEntries = entries.filter((e) => String(e.date).trim() === pressedDate);
    console.log('Pressed date:', pressedDate, 'Entries for this day:', dayEntries);
    setSelectedDayEntries(dayEntries);
    setSelectedDate(pressedDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Calendar</Text>
      <Calendar
        style={{
          width: 360,
          alignSelf: 'center',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 20,
          elevation: 2,
        }}
        theme={{
          calendarBackground: '#fff',
          textSectionTitleColor: '#222',
          dayTextColor: '#222',
          todayTextColor: '#007aff',
          selectedDayBackgroundColor: '#ffd700',
          selectedDayTextColor: '#222',
          monthTextColor: '#222',
          arrowColor: '#007aff',
        }}
        markingType={'custom'}
        markedDates={Object.fromEntries(
          Object.entries(markedDates).map(([date, mark]) => [
            date,
            {
              ...mark,
              customStyles: {
                container: { backgroundColor: '#ffd700' },
                text: { fontSize: 20 },
              },
            },
          ])
        )}
        onDayPress={handleDayPress}
        dayComponent={({ date }) => {
          if (!date) return null;
          const mark = markedDates[date.dateString];
          return (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 18 }}>
                {date.day}
                {mark ? ` ${mark.mood}` : ''}
              </Text>
            </View>
          );
        }}
      />
      {selectedDate && (
        <View style={styles.selectedDayContainer}>
          <Text style={styles.modalTitle}>Mood Entries for {selectedDate}</Text>
          {/* Debug: Show raw entries for this day */}
          <Text style={{fontSize:12, color:'#888', marginBottom:8}}>
            Debug: {JSON.stringify(selectedDayEntries)}
          </Text>
          {selectedDayEntries.length > 0 ? (
            selectedDayEntries.map((entry, idx) => (
              <View key={idx} style={{marginBottom: 18, alignItems: 'center', width: 220}}>
                <Text style={styles.modalMood}>{entry.mood.emoji} {entry.mood.label}</Text>
                {entry.photo && (
                  <Image source={{ uri: entry.photo }} style={styles.modalImage} />
                )}
                {entry.note ? (
                  <Text style={styles.modalNote}>{entry.note}</Text>
                ) : (
                  <Text style={styles.modalNote}>(No note)</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.modalNote}>No entries for this day.</Text>
          )}
        </View>
      )}
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
  selectedDayContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 300,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalMood: {
    fontSize: 32,
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
  },
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalNote: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 8,
    padding: 8,
  },
});
