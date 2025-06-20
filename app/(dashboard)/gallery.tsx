import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const { width: screenWidth } = Dimensions.get('window');
const thumbnailSize = (screenWidth - 60) / 3; // 3 columns with padding

export default function MoodGalleryScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
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
      <Text style={styles.title}>Mood Gallery</Text>
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
          <View style={styles.gridContainer}>
            {filteredEntries.map((entry, idx) => (
              <TouchableOpacity key={idx} style={styles.thumbnailContainer} onPress={() => setSelected(entry)}>
                <Image source={{ uri: entry.photo }} style={styles.thumbnail} />
                <View style={styles.thumbnailOverlay}>
                  <Text style={styles.thumbnailMood}>{entry.mood.emoji}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <Modal visible={!!selected} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            {selected && (
              <>
                <Image source={{ uri: selected.photo }} style={styles.fullPhoto} resizeMode="contain" />
                <View style={styles.modalInfo}>
                  <Text style={styles.modalMood}>{selected.mood.emoji} {selected.mood.label}</Text>
                  <Text style={styles.modalDate}>{selected.date}</Text>
                  {selected.note ? <Text style={styles.modalNote}>{selected.note}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>Close</Text>
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
    marginTop: 60,
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
    width: '100%',
    paddingBottom: 40,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  thumbnailContainer: {
    width: thumbnailSize,
    height: thumbnailSize,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 4,
    margin: 4,
  },
  thumbnailMood: {
    fontSize: 16,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: screenWidth - 40,
    maxWidth: 400,
  },
  fullPhoto: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  modalInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalMood: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  modalNote: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  closeBtn: {
    backgroundColor: '#222',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
