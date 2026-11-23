import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { concrete, designTokens } from '../theme/palette';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: concrete.paper,
    borderWidth: 1,
    borderColor: concrete.stone,
    borderRadius: designTokens.radii.card,
    padding: 16,
  },
});
