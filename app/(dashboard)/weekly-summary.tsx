import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const moods = [
  { emoji: '😊', label: 'Happy', color: '#ffe066' },
  { emoji: '😭', label: 'Sad', color: '#74b9ff' },
  { emoji: '😰', label: 'Anxious', color: '#a29bfe' },
  { emoji: '😡', label: 'Angry', color: '#ff7675' },
  { emoji: '😍', label: 'Loved', color: '#fab1a0' },
  // Add other moods from your entry screen to ensure they are counted
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthlySummaryScreen() {
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
        setEntries(JSON.parse(data));
      }
    })();
  }, []);

  const summary = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthlyEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });

    const moodCounts: Record<string, number> = {};
    monthlyEntries.forEach(entry => {
      moodCounts[entry.mood.label] = (moodCounts[entry.mood.label] || 0) + 1;
    });

    let mostFrequent = 'None';
    let max = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > max) {
        max = count;
        mostFrequent = mood;
      }
    });

    return { mostFrequent, moodCounts, totalEntries: monthlyEntries.length };
  }, [entries, currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const pieData = useMemo(() => {
    return moods.map(mood => ({
      name: mood.label,
      count: summary.moodCounts[mood.label] || 0,
      color: mood.color,
      legendFontColor: '#222',
      legendFontSize: 14,
    })).filter(d => d.count > 0);
  }, [summary.moodCounts]);

  return (
    <View style={styles.outer}>
      <Text style={styles.title}>Monthly Mood Summary</Text>
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
        <Text style={styles.info}>Total entries this month: {summary.totalEntries}</Text>
        <Text style={styles.info}>Most frequent mood: <Text style={{fontWeight:'bold'}}>{summary.mostFrequent}</Text></Text>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData.map(d => ({
              name: d.name,
              population: d.count,
              color: d.color,
              legendFontColor: d.legendFontColor,
              legendFontSize: d.legendFontSize,
            }))}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              color: () => '#222',
              labelColor: () => '#222',
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
          />
        ) : (
          <Text style={styles.empty}>No entries for this month.</Text>
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
    alignItems: 'center',
    width: '100%',
    paddingBottom: 40,
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
});
