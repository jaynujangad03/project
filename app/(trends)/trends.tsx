import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

const moodColors: Record<string, string> = {
  '😊': '#FFD700',
  '😭': '#87CEEB',
  '😰': '#A9A9A9',
  '😡': '#FF6347',
  '😍': '#FF69B4',
};

const screenWidth = Dimensions.get('window').width;

export default function TrendsScreen() {
  const [moodCounts, setMoodCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);

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
        const counts: Record<string, number> = {};
        entries.forEach((entry: any) => {
          const emoji = entry.mood.emoji;
          counts[emoji] = (counts[emoji] || 0) + 1;
        });
        setMoodCounts(counts);
        setTotal(entries.length);
      }
    };
    fetchEntries();
  }, []);

  const pieData = Object.entries(moodCounts).map(([emoji, count]) => ({
    name: emoji,
    population: count,
    color: moodColors[emoji] || '#ccc',
    legendFontColor: '#222',
    legendFontSize: 16,
  }));

  const barLabels = Object.keys(moodCounts);
  const barData = {
    labels: barLabels,
    datasets: [
      {
        data: barLabels.map((emoji) => moodCounts[emoji]),
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mood Trends</Text>
      {total > 0 ? (
        <>
          <Text style={styles.subtitle}>Mood Distribution</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
              labelColor: () => '#222',
            }}
            accessor={'population'}
            backgroundColor={'transparent'}
            paddingLeft={'15'}
            absolute
          />
          <Text style={styles.subtitle}>Mood Frequency</Text>
          <BarChart
            data={barData}
            width={screenWidth - 32}
            height={220}
            yAxisLabel={''}
            yAxisSuffix={''}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
              labelColor: () => '#222',
              style: { borderRadius: 16 },
            }}
            style={{ marginVertical: 8, borderRadius: 16 }}
            fromZero
            showValuesOnTopOfBars
          />
          <Text style={styles.summary}>
            {Object.entries(moodCounts).map(([emoji, count]) =>
              `You were ${emoji} ${Math.round((count / total) * 100)}% of the time. `
            ).join(' ')}
          </Text>
        </>
      ) : (
        <Text style={styles.placeholder}>No mood data yet. Submit an entry!</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },
  summary: {
    fontSize: 16,
    color: '#555',
    marginTop: 20,
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 16,
    color: '#aaa',
  },
});
