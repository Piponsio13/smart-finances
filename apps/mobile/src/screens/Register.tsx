import SocialSignIn from '../components/SocialSignIn';
import AuthLayout from '../components/AuthLayout';
import { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import type { ApiError } from '../api/client';
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
    <AuthLayout mode="register" onSwitch={() => navigation.navigate('Login')}>
          {error ? <Banner message={error} /> : null}

          <SocialSignIn disabled={loading} onBusy={setLoading} onError={setError} />

          <View style={{ gap: 18 }}>
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

    </AuthLayout>
  );
}
