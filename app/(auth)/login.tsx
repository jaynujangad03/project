import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loginUser } from './db';

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [success, setSuccess] = useState('');

  const validate = () => {
    let valid = true;
    let newErrors = { email: '', password: '', general: '' };
    if (!email) {
      newErrors.email = 'Email is required.';
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
      valid = false;
    }
    if (!password) {
      newErrors.password = 'Password is required.';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    setSuccess('');
    setErrors({ ...errors, general: '' });
    setTouched({ email: true, password: true });
    setLoading(true);
    const isValid = validate();
    if (!isValid) {
      setLoading(false);
      return;
    }
    const user = await loginUser(email, password);
    setLoading(false);
    if (user) {
      // Save user info to AsyncStorage for dashboard greeting
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setSuccess('Login Success! Redirecting...');
      setTimeout(() => router.replace('../../(dashboard)/home'), 1200);
    } else {
      setErrors({ ...errors, general: 'Invalid email or password.' });
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
    validate();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={[styles.input, touched.email && errors.email ? styles.inputError : null]}
        placeholder="Email"
        value={email}
        onChangeText={text => { setEmail(text); if (touched.email) validate(); }}
        keyboardType="email-address"
        autoCapitalize="none"
        onBlur={() => handleBlur('email')}
      />
      {touched.email && errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
      <TextInput
        style={[styles.input, touched.password && errors.password ? styles.inputError : null]}
        placeholder="Password"
        value={password}
        onChangeText={text => { setPassword(text); if (touched.password) validate(); }}
        secureTextEntry
        onBlur={() => handleBlur('password')}
      />
      {touched.password && errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
      {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}
      {success ? <Text style={styles.successText}>{success}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#222" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('../register')}>
        <Text style={styles.linkText}>Don’t have an account? Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('../../(dashboard)/home')}>
        <Text style={styles.skipText}>Skip login (Guest Mode)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ffd700',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007aff',
    fontSize: 16,
    marginTop: 10,
  },
  skipText: {
    color: '#aaa',
    fontSize: 15,
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
    fontSize: 14,
  },
  successText: {
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputError: {
    borderColor: 'red',
  },
});
