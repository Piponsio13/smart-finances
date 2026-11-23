import { StyleSheet, View } from 'react-native';
import { brand, concrete, designTokens } from '../theme/palette';

interface ProgressBarProps {
  percent: number;
  color?: string;
}

export default function ProgressBar({ percent, color = brand.main }: ProgressBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: concrete.stone,
    borderRadius: designTokens.radii.control,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
