import { Platform } from 'react-native';

// Web fallback: use AsyncStorage for web, SQLite for native
let initDB: () => void;
let registerUser: (firstName: string, email: string, password: string) => Promise<string | null>;
let loginUser: (email: string, password: string) => Promise<{id: number, firstName: string, email: string} | null>;

if (Platform.OS === 'web') {
  // Use AsyncStorage for web fallback
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  initDB = () => {};
  registerUser = async (firstName, email, password) => {
    await AsyncStorage.setItem('user', JSON.stringify({ firstName, email, password }));
    return null;
  };
  loginUser = async (email, password) => {
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    if (user.email === email && user.password === password) {
      return { id: 1, firstName: user.firstName, email: user.email };
    }
    return null;
  };
} else {
  // All SQLite code and require inside this block
  const SQLite = require('expo-sqlite');
  const db = SQLite.openDatabaseSync('moodcam.db');
  initDB = () => {
    db.execSync(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );`);
  };
  registerUser = async (firstName, email, password) => {
    try {
      db.runSync('INSERT INTO users (firstName, email, password) VALUES (?, ?, ?);', [firstName, email, password]);
      return null;
    } catch (error: any) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        return 'Email already exists.';
      }
      return 'Registration failed.';
    }
  };
  loginUser = async (email, password) => {
    try {
      const user = db.getFirstSync('SELECT * FROM users WHERE email = ?;', [email]);
      if (user && user.password === password) {
        return user;
      }
      return null;
    } catch {
      return null;
    }
  };
}

export { initDB, loginUser, registerUser };

