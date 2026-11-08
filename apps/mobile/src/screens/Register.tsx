import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import type { ApiError } from '../api/client';
import { concrete } from '../theme/palette';
import { mono, monoBold } from '../theme/typography';
import Field from '../components/Field';
import Button from '../components/Button';
import Banner from '../components/Banner';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function Register({ navigation }: Props) {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.register({ name, email, password });
      const { token } = await authApi.login({ email, password });
      login(token);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.fields ? Object.values(apiErr.fields).join('. ') : apiErr.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Text style={styles.brandText}>SMART{'\n'}FINANCES</Text>
          <View style={styles.brandUnderline} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>CREATE ACCOUNT</Text>
          <Text style={styles.subtitle}>Start managing your finances today</Text>

          {error ? <Banner message={error} /> : null}

          <View style={styles.form}>
            <Field label="Full Name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Jane Doe" />

            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="you@example.com"
            />

            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="••••••••"
              helperText="Minimum 8 characters"
            />

            <Field
              label="Confirm Password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="••••••••"
            />

            <Button label={loading ? 'Creating…' : 'Create Account'} onPress={handleSubmit} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              HAVE AN ACCOUNT?{' '}
              <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
                SIGN IN
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: concrete.bg },
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  brand: { width: '100%', maxWidth: 380, marginBottom: 24 },
  brandText: {
    fontFamily: monoBold,
    fontSize: 26,
    letterSpacing: 3,
    lineHeight: 30,
    color: concrete.void,
  },
  brandUnderline: {
    width: 60,
    height: 4,
    backgroundColor: concrete.stone,
    borderWidth: 1,
    borderColor: concrete.void,
    marginTop: 12,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 3,
    borderColor: concrete.void,
    backgroundColor: concrete.paper,
    padding: 24,
    gap: 12,
  },
  title: { fontFamily: monoBold, fontSize: 17, letterSpacing: 2, color: concrete.void },
  subtitle: { fontFamily: mono, fontSize: 12, color: concrete.aggregate, marginBottom: 4 },
  form: { gap: 18, marginTop: 4 },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: concrete.void,
    alignItems: 'center',
  },
  footerText: { fontFamily: mono, fontSize: 11, color: concrete.aggregate, letterSpacing: 0.5 },
  footerLink: { fontFamily: monoBold, color: concrete.void },
});
