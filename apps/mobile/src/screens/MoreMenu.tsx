import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MoreStackParamList } from '../navigation/MoreStack';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { concrete, oxide } from '../theme/palette';
import { monoBold } from '../theme/typography';

type Props = NativeStackScreenProps<MoreStackParamList, 'MoreMenu'>;

const ITEMS: { label: string; screen: keyof MoreStackParamList; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Categories', screen: 'Categories', icon: 'pricetag-outline' },
  { label: 'Recurring', screen: 'Recurring', icon: 'sync-outline' },
  { label: 'Savings', screen: 'Savings', icon: 'wallet-outline' },
  { label: 'Bills', screen: 'Bills', icon: 'notifications-outline' },
];

export default function MoreMenu({ navigation }: Props) {
  const { logout } = useAuth();

  return (
    <Screen scroll={false}>
      <ScreenHeader title="More" />
      <View style={styles.list}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.screen}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.rowLeft}>
              <Ionicons name={item.icon} size={18} color={concrete.void} />
              <Text style={styles.rowLabel}>{item.label.toUpperCase()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={concrete.aggregate} />
          </Pressable>
        ))}

        <Pressable style={({ pressed }) => [styles.row, styles.logoutRow, pressed && styles.rowPressed]} onPress={logout}>
          <View style={styles.rowLeft}>
            <Ionicons name="log-out-outline" size={18} color={oxide.main} />
            <Text style={[styles.rowLabel, { color: oxide.main }]}>LOGOUT</Text>
          </View>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { borderWidth: 2, borderColor: concrete.void },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: concrete.stone,
    backgroundColor: concrete.paper,
  },
  rowPressed: { backgroundColor: concrete.bg },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontFamily: monoBold, fontSize: 12, letterSpacing: 1, color: concrete.void },
  logoutRow: { borderBottomWidth: 0 },
});
