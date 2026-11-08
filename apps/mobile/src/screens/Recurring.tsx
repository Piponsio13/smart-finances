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
import RecurringModal from '../components/modals/RecurringModal';
import { concrete, moss, oxide, ochre } from '../theme/palette';
import { mono, monoBold } from '../theme/typography';
import { recurringApi, type RecurringTransaction } from '../api/recurring';
import { categoriesApi, type Category } from '../api/categories';
import type { ApiError } from '../api/client';

const FREQ_LABELS: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function RecurringCard({
  item,
  onEdit,
  onDelete,
}: {
  item: RecurringTransaction;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <View style={styles.headerRow}>
        <View style={styles.flexShrink}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.muted}>{item.categoryName}</Text>
        </View>
        <View style={styles.actions}>
          <IconButton name="create-outline" onPress={onEdit} />
          <IconButton name="trash-outline" onPress={onDelete} />
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.freqLabel}>{FREQ_LABELS[item.frequency]}</Text>
        <Text style={styles.muted}>{item.nextDueDate ? `Next: ${formatDate(item.nextDueDate)}` : 'No upcoming date'}</Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={[styles.amount, { color: item.type === 'INCOME' ? moss.main : oxide.main }]}>
          {item.type === 'INCOME' ? '+' : '-'}
          {formatCurrency(item.amount)}
        </Text>
        <StatusBadge
          label={item.active ? 'Active' : 'Paused'}
          color={item.active ? moss.main : concrete.aggregate}
          bgColor={item.active ? moss.light : concrete.stone}
        />
      </View>
    </Card>
  );
}

export default function Recurring() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const data = await recurringApi.getAll();
      setItems(data);
    } catch {
      setItems([]);
    }
  }, []);

  const load = useCallback(async () => {
    const [recResult, catResult] = await Promise.allSettled([recurringApi.getAll(), categoriesApi.getAll()]);
    setItems(recResult.status === 'fulfilled' ? recResult.value : []);
    setCategories(catResult.status === 'fulfilled' ? catResult.value : []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function confirmDelete(item: RecurringTransaction) {
    Alert.alert(
      'Delete Recurring Transaction',
      'This will be permanently deleted. Future auto-generated transactions from this template will stop.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await recurringApi.delete(item.id);
              await fetchItems();
            } catch (err) {
              setError((err as ApiError).message ?? 'Delete failed');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.flex}>
      <Screen>
        <ScreenHeader title="Recurring" subtitle="Auto-generated daily, weekly, monthly, or yearly" />
        {error ? <Banner message={error} /> : null}
        {!loading && items.length === 0 ? (
          <EmptyState message="No recurring transactions yet." />
        ) : (
          items.map((item) => (
            <RecurringCard
              key={item.id}
              item={item}
              onEdit={() => {
                setEditing(item);
                setModalOpen(true);
              }}
              onDelete={() => confirmDelete(item)}
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
      <RecurringModal
        open={modalOpen}
        recurring={editing}
        categories={categories}
        onCreate={async (data) => {
          await recurringApi.create(data);
          await fetchItems();
        }}
        onUpdate={async (data) => {
          if (editing) {
            await recurringApi.update(editing.id, data);
            await fetchItems();
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  flexShrink: { flex: 1, marginRight: 8 },
  description: { fontFamily: monoBold, fontSize: 14, color: concrete.void },
  muted: { fontFamily: mono, fontSize: 11, color: concrete.aggregate, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  freqLabel: { fontFamily: monoBold, fontSize: 10, color: ochre.main, letterSpacing: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontFamily: monoBold, fontSize: 16 },
});
