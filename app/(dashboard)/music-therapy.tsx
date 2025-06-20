import React, { useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function MusicTherapyScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResults([]);
    try {
      // Use YouTube search via a public API proxy (for demo, no API key needed)
      const res = await fetch(`https://yt.lemnoslife.com/noKey/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10`);
      const data = await res.json();
      setResults(data.items || []);
    } catch (e) {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Music Therapy (Online Search)</Text>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search for any music..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Search</Text>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator size="large" color="#007aff" style={{ marginTop: 20 }} />}
      {results.length > 0 && (
        <View style={{ width: '100%', marginTop: 16 }}>
          {results.map((item, idx) => (
            <TouchableOpacity
              key={item.id.videoId}
              style={styles.result}
              onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${item.id.videoId}`)}
            >
              <Image source={{ uri: item.snippet.thumbnails.default.url }} style={styles.thumbnail} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.songTitle}>{item.snippet.title}</Text>
                <Text style={styles.songChannel}>{item.snippet.channelTitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {!loading && results.length === 0 && (
        <Text style={{ color: '#888', marginTop: 32, textAlign: 'center' }}>
          Search for any music you want and tap a result to listen on YouTube!
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f6fa',
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    backgroundColor: '#007aff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    elevation: 1,
    width: '100%',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  songChannel: {
    fontSize: 13,
    color: '#888',
  },
});
