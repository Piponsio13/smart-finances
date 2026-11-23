import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export default function SocialSignIn({ disabled, onBusy, onError }: {
  disabled: boolean; onBusy: (busy: boolean) => void; onError: (message: string) => void;
}) {
  const { login } = useAuth();
  const busy = useRef(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const googleId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  useEffect(() => {
    let active = true;
    AppleAuthentication.isAvailableAsync().then(value => { if (active) setAppleAvailable(value); }).catch(() => {});
    return () => { active = false; };
  }, []);

  async function signIn(provider: 'google' | 'apple') {
    if (busy.current || disabled) return;
    busy.current = true;
    onBusy(true);
    onError('');
    try {
      let idToken: string | null;
      let name: string | undefined;
      let nonce: string | undefined;
      if (provider === 'apple') {
        nonce = Crypto.randomUUID();
        const state = Crypto.randomUUID();
        const result = await AppleAuthentication.signInAsync({
          nonce, state,
          requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
        });
        if (result.state !== state) throw new Error('Unable to verify Apple sign-in');
        idToken = result.identityToken;
        name = [result.fullName?.givenName, result.fullName?.familyName].filter(Boolean).join(' ');
      } else {
        // Load only on native platforms; this module requires a development build.
        const { GoogleSignin, isSuccessResponse } = await import('@react-native-google-signin/google-signin');
        GoogleSignin.configure({ webClientId: googleId, iosClientId: iosId });
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        await GoogleSignin.signOut();
        const result = await GoogleSignin.signIn();
        if (!isSuccessResponse(result)) return;
        idToken = result.data.idToken;
      }
      if (!idToken) throw new Error('The provider did not return a sign-in token');
      const { token } = await authApi.socialLogin(provider, { idToken, nonce, name });
      login(token);
    } catch (error) {
      const reason = error as { code?: string; message?: string };
      if (reason.code !== 'ERR_REQUEST_CANCELED' && reason.code !== 'SIGN_IN_CANCELLED') {
        onError(reason.message || 'Unable to sign in. Please try again.');
      }
    } finally { busy.current = false; onBusy(false); }
  }

  const googleAvailable = Platform.OS !== 'web' && !!googleId && (Platform.OS !== 'ios' || !!iosId);
  if (!googleAvailable && !appleAvailable) return null;
  return <View style={{ gap: 12, marginVertical: 12 }}>
    {googleAvailable && <Button label="Continue with Google" variant="outline" disabled={disabled} onPress={() => signIn('google')} />}
    {appleAvailable && <View pointerEvents={disabled ? 'none' : 'auto'} style={{ opacity: disabled ? 0.5 : 1 }}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={0} style={{ height: 48, width: '100%' }} onPress={() => signIn('apple')}
      />
    </View>}
  </View>;
}
