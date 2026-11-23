import SocialSignIn from '../components/SocialSignIn';
import AuthLayout from '../components/AuthLayout';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import type { ApiError } from '../api/client';
import { concrete } from '../theme/palette';
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
    <AuthLayout mode="login" onSwitch={() => navigation.navigate('Register')}>
          {error ? <Banner message={error} /> : null}

          <SocialSignIn disabled={loading} onBusy={setLoading} onError={setError} />

          <View style={{ gap: 18 }}>
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

    </AuthLayout>
  );
}
