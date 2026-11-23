import { StyleSheet, Text, View } from 'react-native';
import { headingFont } from '../theme/typography';

interface StatusBadgeProps {
  label: string;
  color: string;
  bgColor: string;
}

export default function StatusBadge({ label, color, bgColor }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor, borderColor: color }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 0, borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: headingFont, fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0,
  },
});
