import { StyleSheet, Text, View } from 'react-native';
import { concrete } from '../theme/palette';
import { bodyFont, headingFont } from '../theme/typography';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

export default function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontFamily: headingFont, fontWeight: '600',
    color: concrete.void,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: bodyFont,
    color: concrete.aggregate,
    letterSpacing: 0,
  },
});
