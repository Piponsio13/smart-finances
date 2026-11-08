import { StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import { concrete } from '../theme/palette';
import { mono } from '../theme/typography';

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.text}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 32, alignItems: 'center' },
  text: { fontFamily: mono, fontSize: 13, color: concrete.aggregate, textAlign: 'center' },
});
