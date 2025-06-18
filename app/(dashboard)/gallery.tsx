import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MoodGalleryScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

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

  return (
    <View style={styles.container}>
      <View style={{width: '100%', maxWidth: 400, alignItems: 'center'}}>
        <Text style={styles.title}>Mood Gallery</Text>
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {entries.length === 0 ? (
            <Text style={styles.empty}>No entries yet.</Text>
          ) : (
            entries.map((entry, idx) => (
              <TouchableOpacity key={idx} style={styles.thumbWrap} onPress={() => setSelected(entry)}>
                <Image source={{ uri: entry.photo }} style={styles.thumb} />
                <Text style={styles.emoji}>{entry.mood.emoji}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            {selected && (
              <>
                <Image source={{ uri: selected.photo }} style={styles.fullPhoto} />
                <Text style={styles.modalMood}>{selected.mood.emoji} {selected.mood.label}</Text>
                <Text style={styles.modalDate}>{selected.date}</Text>
                {selected.note ? <Text style={styles.modalNote}>{selected.note}</Text> : null}
                <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
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
    backgroundColor: '#f5f6fa',
    padding: 20,
    width: '100%',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 40,
    maxWidth: 400,
    alignSelf: 'center',
  },
  thumbWrap: {
    alignItems: 'center',
    margin: 8,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  emoji: {
    fontSize: 24,
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: 320,
    maxWidth: '90%',
  },
  fullPhoto: {
    width: 200,
    height: 200,
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: '#eee',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  closeBtn: {
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});
