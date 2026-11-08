import { StyleSheet, Text, View } from 'react-native';
import { concrete } from '../theme/palette';
import { mono, monoBold } from '../theme/typography';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

export default function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle.toUpperCase()}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: monoBold,
    color: concrete.void,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: mono,
    color: concrete.aggregate,
    letterSpacing: 1,
  },
});
