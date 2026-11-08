import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import Banner from '../components/Banner';
import EmptyState from '../components/EmptyState';
import IconButton from '../components/IconButton';
import Fab from '../components/Fab';
import StatusBadge from '../components/StatusBadge';
import BillModal from '../components/modals/BillModal';
import { concrete, oxide, ochre } from '../theme/palette';
import { mono, monoBold } from '../theme/typography';
import { billsApi, type Bill, type BillStatus } from '../api/bills';
import { categoriesApi, type Category } from '../api/categories';
import type { ApiError } from '../api/client';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

const STATUS_CONFIG: Record<BillStatus, { label: string; bg: string; color: string }> = {
  UPCOMING: { label: 'Upcoming', bg: concrete.stone, color: concrete.aggregate },
  DUE_SOON: { label: 'Due Soon', bg: ochre.light, color: ochre.main },
  DUE_TODAY: { label: 'Due Today', bg: oxide.light, color: oxide.main },
  OVERDUE: { label: 'Overdue', bg: oxide.main, color: '#FFFFFF' },
};

const STATUS_ORDER: BillStatus[] = ['OVERDUE', 'DUE_TODAY', 'DUE_SOON', 'UPCOMING'];

function BillCard({ bill, onEdit, onDelete }: { bill: Bill; onEdit: () => void; onDelete: () => void }) {
  const status = STATUS_CONFIG[bill.status];
  return (
    <Card style={!bill.active ? styles.inactive : undefined}>
      <View style={styles.headerRow}>
        <View style={styles.flexShrink}>
          <Text style={styles.billName}>{bill.name}</Text>
          <Text style={styles.muted}>
            Due on day {bill.dueDay}{bill.categoryName ? ` · ${bill.categoryName}` : ''}
          </Text>
        </View>
        <View style={styles.actions}>
          <IconButton name="create-outline" onPress={onEdit} />
          <IconButton name="trash-outline" onPress={onDelete} />
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.amount}>{formatCurrency(bill.amount)}</Text>
        <View style={styles.badges}>
          {!bill.active ? <StatusBadge label="Inactive" color={concrete.aggregate} bgColor={concrete.stone} /> : null}
          <StatusBadge label={status.label} color={status.color} bgColor={status.bg} />
        </View>
      </View>
    </Card>
  );
}

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);

  const fetchBills = useCallback(async () => {
    try {
      const data = await billsApi.getAll();
      setBills(data);
    } catch {
      setBills([]);
    }
  }, []);

  const load = useCallback(async () => {
    const [billResult, catResult] = await Promise.allSettled([billsApi.getAll(), categoriesApi.getAll()]);
    setBills(billResult.status === 'fulfilled' ? billResult.value : []);
    setCategories(catResult.status === 'fulfilled' ? catResult.value : []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function confirmDelete(bill: Bill) {
    Alert.alert('Delete Bill Reminder', 'This bill reminder will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await billsApi.delete(bill.id);
            await fetchBills();
          } catch (err) {
            setError((err as ApiError).message ?? 'Delete failed');
          }
        },
      },
    ]);
  }

  const urgentCount = bills.filter((b) => b.active && (b.status === 'DUE_TODAY' || b.status === 'OVERDUE')).length;
  const dueSoonCount = bills.filter((b) => b.active && b.status === 'DUE_SOON').length;
  const totalMonthly = bills.filter((b) => b.active).reduce((s, b) => s + b.amount, 0);
  const sorted = [...bills].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));

  return (
    <View style={styles.flex}>
      <Screen>
        <ScreenHeader title="Bill Reminders" subtitle="Track recurring bills and due dates" />
        {error ? <Banner message={error} /> : null}
        {urgentCount > 0 ? (
          <Banner message={`${urgentCount} bill${urgentCount > 1 ? 's are' : ' is'} due today or overdue.`} />
        ) : dueSoonCount > 0 ? (
          <Banner message={`${dueSoonCount} bill${dueSoonCount > 1 ? 's are' : ' is'} due within 3 days.`} />
        ) : null}

        {!loading && bills.length > 0 ? (
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>MONTHLY TOTAL</Text>
              <Text style={[styles.statValue, { color: oxide.main }]}>{formatCurrency(totalMonthly)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>ACTIVE BILLS</Text>
              <Text style={styles.statValue}>{bills.filter((b) => b.active).length}</Text>
            </View>
          </View>
        ) : null}

        {!loading && bills.length === 0 ? (
          <EmptyState message="No bill reminders yet. Add one to track your recurring payments." />
        ) : (
          sorted.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onEdit={() => setEditing(bill)}
              onDelete={() => confirmDelete(bill)}
            />
          ))
        )}
      </Screen>
      <Fab
        onPress={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />
      <BillModal
        open={modalOpen || editing !== null}
        bill={editing}
        categories={categories}
        onCreate={async (data) => {
          await billsApi.create(data);
          await fetchBills();
        }}
        onUpdate={async (data) => {
          if (editing) {
            await billsApi.update(editing.id, data);
            await fetchBills();
          }
        }}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  inactive: { opacity: 0.55 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  flexShrink: { flex: 1, marginRight: 8 },
  billName: { fontFamily: monoBold, fontSize: 14, color: concrete.void },
  muted: { fontFamily: mono, fontSize: 11, color: concrete.aggregate, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontFamily: monoBold, fontSize: 18, color: oxide.main },
  badges: { flexDirection: 'row', gap: 6 },
  statRow: { flexDirection: 'row', gap: 12 },
  statBox: { borderWidth: 2, borderColor: concrete.void, padding: 12, flex: 1 },
  statLabel: { fontFamily: monoBold, fontSize: 9, color: concrete.aggregate, letterSpacing: 1 },
  statValue: { fontFamily: monoBold, fontSize: 18, color: concrete.void, marginTop: 4 },
});
