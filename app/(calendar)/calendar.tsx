import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface MarkedDate {
  marked: boolean;
  customStyles: any;
  mood: string;
}

export default function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState<Record<string, MarkedDate>>({});
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);

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
        setEntries(entries);
        const marks: Record<string, MarkedDate> = {};
        entries.forEach((entry: any) => {
          marks[entry.date] = {
            marked: true,
            customStyles: {
              container: { backgroundColor: '#ffd700' },
              text: { fontSize: 20 },
            },
            mood: entry.mood.emoji,
          };
        });
        setMarkedDates(marks);
      }
    };
    fetchEntries();
  }, []);

  const handleDayPress = (day: any) => {
    const entry = entries.find((e) => e.date === day.dateString);
    if (entry) {
      setSelectedEntry(entry);
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Calendar</Text>
      <Calendar
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
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedEntry && (
              <>
                <Text style={styles.modalTitle}>Mood Entry</Text>
                <Text style={styles.modalMood}>{selectedEntry.mood.emoji} {selectedEntry.mood.label}</Text>
                <Text style={styles.modalDate}>{selectedEntry.date}</Text>
                {selectedEntry.photo && (
                  <Image source={{ uri: selectedEntry.photo }} style={styles.modalImage} />
                )}
                {selectedEntry.note ? (
                  <Text style={styles.modalNote}>{selectedEntry.note}</Text>
                ) : (
                  <Text style={styles.modalNote}>(No note)</Text>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: '#007aff', fontSize: 16 }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 300,
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
