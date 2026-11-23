import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { brand, concrete, designTokens } from '../theme/palette';
import { bodyFont, headingFont } from '../theme/typography';
import Brand from './Brand';

export default function AuthLayout({ mode, onSwitch, children }: { mode: 'login' | 'register'; onSwitch: () => void; children: ReactNode }) {
  const login = mode === 'login';
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Brand />
          <Text style={styles.switchText}>{login ? 'New here? ' : 'Already have an account? '}<Text accessibilityRole="link" onPress={onSwitch} style={styles.link}>{login ? 'Create an account ↗' : 'Sign in ↗'}</Text></Text>
          <View style={styles.heading}><Text style={styles.eyebrow}>{login ? 'A little clarity goes a long way' : 'A fresh start for your finances'}</Text><Text style={styles.title}>{login ? 'Welcome back.' : 'Make yourself at home.'}</Text><Text style={styles.subtitle}>{login ? 'Sign in and take a moment for your money.' : 'Create your account. Start seeing the bigger picture.'}</Text></View>
          <View style={styles.form}>{children}</View>
          <Text style={styles.footnote}>One place for your spending, budgets, and savings.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: designTokens.colors.canvas }, flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, paddingVertical: 28, alignItems: 'center' },
  content: { width: '100%', maxWidth: 420 },
  switchText: { marginTop: 24, fontFamily: bodyFont, fontSize: 13, color: concrete.aggregate },
  link: { color: brand.main, fontWeight: '600' },
  heading: { marginTop: 44, marginBottom: 26, gap: 12 },
  eyebrow: { fontFamily: headingFont, fontSize: 10, letterSpacing: 1, color: '#748164', textTransform: 'uppercase' },
  title: { fontFamily: headingFont, fontWeight: '600', fontSize: 33, letterSpacing: -1.2, color: concrete.void },
  subtitle: { fontFamily: bodyFont, fontSize: 14, lineHeight: 22, color: concrete.aggregate },
  form: { gap: 18 },
  footnote: { marginTop: 28, fontFamily: bodyFont, fontSize: 12, lineHeight: 20, color: concrete.aggregate, textAlign: 'center' },
});
