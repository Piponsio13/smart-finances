import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { concrete } from '../theme/palette';
import { monoBold } from '../theme/typography';
import Button from './Button';
import Banner from './Banner';

interface FormModalProps {
  visible: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  loading?: boolean;
  error?: string;
}

export default function FormModal({
  visible,
  title,
  children,
  onClose,
  onSubmit,
  submitLabel,
  loading,
  error,
}: FormModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <View style={styles.sheet}>
            <Text style={styles.title}>{title.toUpperCase()}</Text>
            <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
              {error ? <Banner message={error} /> : null}
              {children}
            </ScrollView>
            <View style={styles.footer}>
              <Button label="Cancel" variant="outline" onPress={onClose} disabled={loading} style={styles.footerBtn} />
              <Button label={submitLabel} onPress={onSubmit} loading={loading} style={styles.footerBtn} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,25,24,0.5)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    maxHeight: '90%',
  },
  sheet: {
    backgroundColor: concrete.paper,
    borderTopWidth: 3,
    borderColor: concrete.void,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontFamily: monoBold,
    fontSize: 14,
    letterSpacing: 1.5,
    color: concrete.void,
    marginBottom: 16,
  },
  body: {
    gap: 16,
    paddingBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  footerBtn: { flex: 1 },
});
