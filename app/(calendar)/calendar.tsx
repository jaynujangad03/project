import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface MoodEntry {
  date: string;
  mood: {
    emoji: string;
    label: string;
  };
  note: string;
  photo: string;
  timestamp: number;
}

interface MarkedDate {
  marked: boolean;
  dotColor: string;
}

export default function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState<Record<string, MarkedDate>>({});
  const [selectedDayEntries, setSelectedDayEntries] = useState<MoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
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
        const loadedEntries: MoodEntry[] = JSON.parse(data);
        setEntries(loadedEntries);
        const marks: Record<string, MarkedDate> = {};
        loadedEntries.forEach((entry: MoodEntry) => {
          marks[entry.date] = {
            marked: true,
            dotColor: '#007aff',
          };
        });
        setMarkedDates(marks);
      } else {
        setEntries([]);
        setMarkedDates({});
      }
    };
    if (isFocused) {
      fetchEntries();
    }
  }, [isFocused]);

  const handleDayPress = (day: DateData) => {
    const pressedDate = day.dateString;
    const dayEntries = entries.filter((e) => e.date === pressedDate);
    setSelectedDayEntries(dayEntries);
    setSelectedDate(pressedDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Calendar</Text>
      <Calendar
        style={styles.calendar}
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
        markingType={'dot'}
        markedDates={markedDates}
        onDayPress={handleDayPress}
      />
      <Modal
        visible={selectedDate !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDate(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Entries for {selectedDate}</Text>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {selectedDayEntries.length > 0 ? (
                selectedDayEntries.map((entry, idx) => (
                  <View key={idx} style={styles.entryBox}>
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
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedDate(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
    backgroundColor: '#f5f6fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  calendar: {
    width: 360,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  entryBox: {
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  modalMood: {
    fontSize: 28,
    marginBottom: 8,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalNote: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#ffd700',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
