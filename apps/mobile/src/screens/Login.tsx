import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const { token } = await authApi.login({ email, password });
      login(token);
    } catch (err) {
      setError((err as ApiError).message ?? 'Invalid credentials');
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
          <Text style={styles.title}>SIGN IN</Text>
          <Text style={styles.subtitle}>Enter your credentials to continue</Text>

          {error ? <Banner message={error} /> : null}

          <View style={styles.form}>
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
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="••••••••"
              rightAccessory={
                <Pressable onPress={() => setShowPassword((p) => !p)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={concrete.aggregate}
                  />
                </Pressable>
              }
            />

            <Button label={loading ? 'Signing In…' : 'Sign In'} onPress={handleSubmit} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              NO ACCOUNT?{' '}
              <Text style={styles.footerLink} onPress={() => navigation.navigate('Register')}>
                SIGN UP
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
