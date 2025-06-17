import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { registerUser } from './db';

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState({
    firstName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({
    firstName: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  });

  const validate = () => {
    let valid = true;
    let newErrors = { firstName: '', email: '', password: '', confirmPassword: '', general: '' };
    if (!firstName) {
      newErrors.firstName = 'First name is required.';
      valid = false;
    }
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
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
      valid = false;
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    setSuccess('');
    setErrors({ ...errors, general: '' });
    setTouched({ firstName: true, email: true, password: true, confirmPassword: true });
    setLoading(true);
    const isValid = validate();
    if (!isValid) {
      setLoading(false);
      return;
    }
    const errorMsg = await registerUser(firstName, email, password);
    setLoading(false);
    if (!errorMsg) {
      setSuccess('Successfully registered! Redirecting...');
      setTimeout(() => router.replace('/'), 1200);
    } else {
      setErrors({ ...errors, email: errorMsg });
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
    validate();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={[styles.input, touched.firstName && errors.firstName ? styles.inputError : null]}
        placeholder="First Name"
        value={firstName}
        onChangeText={text => { setFirstName(text); if (touched.firstName) validate(); }}
        onBlur={() => handleBlur('firstName')}
      />
      {touched.firstName && errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
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
      <TextInput
        style={[styles.input, touched.confirmPassword && errors.confirmPassword ? styles.inputError : null]}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={text => { setConfirmPassword(text); if (touched.confirmPassword) validate(); }}
        secureTextEntry
        onBlur={() => handleBlur('confirmPassword')}
      />
      {touched.confirmPassword && errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
      {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}
      {success ? <Text style={styles.successText}>{success}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#222" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('../login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
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
