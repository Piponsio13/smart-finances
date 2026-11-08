import { StyleSheet, Text, View } from 'react-native';
import { oxide } from '../theme/palette';
import { mono } from '../theme/typography';

interface BannerProps {
  message: string;
}

export default function Banner({ message }: BannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: oxide.light,
    borderWidth: 2,
    borderColor: oxide.main,
    padding: 12,
  },
  text: { fontFamily: mono, fontSize: 12, color: oxide.main },
});
