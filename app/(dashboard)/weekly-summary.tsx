import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const moods = [
  { emoji: '😊', label: 'Happy', color: '#ffe066' },
  { emoji: '😭', label: 'Sad', color: '#74b9ff' },
  { emoji: '😰', label: 'Anxious', color: '#a29bfe' },
  { emoji: '😡', label: 'Angry', color: '#ff7675' },
  { emoji: '😍', label: 'Loved', color: '#fab1a0' },
];

function getWeekDates() {
  const now = new Date();
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    week.push(d.toISOString().split('T')[0]);
  }
  return week;
}

export default function WeeklySummaryScreen() {
  const [summary, setSummary] = useState({
    mostFrequent: '',
    checkedIn: 0,
    missed: 0,
    moodCounts: {} as Record<string, number>,
  });

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const key = `moodEntries_${user.email}`;
      const data = await AsyncStorage.getItem(key);
      const weekDates = getWeekDates();
      let checkedIn = 0;
      let missed = 0;
      const moodCounts: Record<string, number> = {};
      if (data) {
        const entries = JSON.parse(data);
        weekDates.forEach(date => {
          const entry = entries.find((e: any) => e.date === date);
          if (entry) {
            checkedIn++;
            moodCounts[entry.mood.label] = (moodCounts[entry.mood.label] || 0) + 1;
          } else {
            missed++;
          }
        });
      } else {
        missed = 7;
      }
      let mostFrequent = '';
      let max = 0;
      Object.entries(moodCounts).forEach(([mood, count]) => {
        if (count > max) {
          max = count;
          mostFrequent = mood;
        }
      });
      setSummary({ mostFrequent, checkedIn, missed, moodCounts });
    })();
  }, []);

  const pieData = moods.map(mood => ({
    name: mood.label,
    count: summary.moodCounts[mood.label] || 0,
    color: mood.color,
    legendFontColor: '#222',
    legendFontSize: 14,
  })).filter(d => d.count > 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Weekly Mood Summary</Text>
      <Text style={styles.info}>Most frequent mood: <Text style={{fontWeight:'bold'}}>{summary.mostFrequent || 'None'}</Text></Text>
      <Text style={styles.info}>Days checked-in: {summary.checkedIn} / 7</Text>
      <Text style={styles.info}>Days missed: {summary.missed}</Text>
      {pieData.length > 0 && (
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
      )}
    </ScrollView>
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
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
  },
});
