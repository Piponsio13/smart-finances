import { StyleSheet, Text, View } from 'react-native';
import { concrete } from '../theme/palette';
import { monoBold } from '../theme/typography';

interface StatusBadgeProps {
  label: string;
  color: string;
  bgColor: string;
}

export default function StatusBadge({ label, color, bgColor }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor, borderColor: color }]}>
      <Text style={[styles.label, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: monoBold,
    fontSize: 9,
    letterSpacing: 1,
  },
});
