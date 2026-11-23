import { StyleSheet, Text, View } from 'react-native';
import { oxide, designTokens } from '../theme/palette';
import { bodyFont } from '../theme/typography';

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
    borderWidth: 1, borderRadius: designTokens.radii.control,
    borderColor: oxide.main,
    padding: 12,
  },
  text: { fontFamily: bodyFont, fontSize: 12, color: oxide.main },
});
