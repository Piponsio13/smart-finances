import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import { concrete, designTokens } from '../theme/palette';
import { headingFont } from '../theme/typography';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
  bgColor: string;
}

export default function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.text}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.value, { color }]}>{value}</Text>
        </View>
        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>{icon}</View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: '46%' },
  row: { gap: 8, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  text: { flex: 1, gap: 6 },
  title: {
    fontFamily: headingFont, fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0,
    color: concrete.aggregate,
  },
  value: {
    fontFamily: headingFont, fontWeight: '600',
    fontSize: 18,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: designTokens.radii.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
