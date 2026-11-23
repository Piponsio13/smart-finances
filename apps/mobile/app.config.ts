import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const iosUrlScheme = iosId?.endsWith('.apps.googleusercontent.com')
    ? `com.googleusercontent.apps.${iosId.replace('.apps.googleusercontent.com', '')}` : undefined;
  return {
    ...config,
    name: config.name!,
    slug: config.slug!,
    plugins: [
      ...(config.plugins ?? []),
      ...(iosUrlScheme ? [['@react-native-google-signin/google-signin', { iosUrlScheme }] as [string, object]] : []),
    ],
  };
};
