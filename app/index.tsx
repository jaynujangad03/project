import { useRouter } from "expo-router";
import React from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const emojis = ["😊", "😭", "😰", "😡", "😍", "🥺", "😎", "🤔","😴","🤔","😢"];

export default function WelcomeScreen() {
  const router = useRouter();
  const [emojiIndex, setEmojiIndex] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setEmojiIndex((prev) => (prev + 1) % emojis.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/icon.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>MoodCam</Text>
      <Animated.Text style={styles.emoji}>{emojis[emojiIndex]}</Animated.Text>
      <Text style={styles.welcome}>Welcome! Track your mood with a selfie.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push({ pathname: "/(auth)/register" })}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.link}
        onPress={() => router.push({ pathname: "/(auth)/login" })}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.skip}
        onPress={() => router.push({ pathname: "/(dashboard)/home" })}
      >
        <Text style={styles.skipText}>Skip login (Guest Mode)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f6fa",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  welcome: {
    fontSize: 18,
    color: "#555",
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#ffd700",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 18,
    color: "#222",
    fontWeight: "bold",
  },
  link: {
    marginBottom: 10,
  },
  linkText: {
    color: "#007aff",
    fontSize: 16,
  },
  skip: {
    marginTop: 20,
  },
  skipText: {
    color: "#aaa",
    fontSize: 15,
  },
});
