import { StyleSheet, View } from 'react-native';
import { concrete } from '../theme/palette';

interface ProgressBarProps {
  percent: number;
  color?: string;
}

export default function ProgressBar({ percent, color = concrete.void }: ProgressBarProps) {
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
    borderWidth: 1,
    borderColor: concrete.void,
  },
  fill: {
    height: '100%',
  },
});
