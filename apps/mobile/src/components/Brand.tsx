import { StyleSheet, Text, View } from 'react-native';
import { brand } from '../theme/palette';
import { headingFont } from '../theme/typography';

export default function Brand() {
  return <View style={styles.brand} accessibilityLabel="Smart Finances">
    <View style={styles.mark} accessible={false}>{[12, 20, 28].map(height => <View key={height} style={[styles.bar, { height }]} />)}</View>
    <Text style={styles.name}>smart finances<Text style={styles.dot}>.</Text></Text>
  </View>;
}
const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, transform: [{ skewX: '-12deg' }] },
  bar: { width: 7, borderRadius: 2, backgroundColor: brand.main },
  name: { fontFamily: headingFont, fontWeight: '600', fontSize: 25, color: brand.main, letterSpacing: -.8 },
  dot: { color: '#658650' },
});
