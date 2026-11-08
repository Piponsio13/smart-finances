import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import Banner from '../components/Banner';
import Fab from '../components/Fab';
import CategoryModal from '../components/modals/CategoryModal';
import { concrete, moss, oxide } from '../theme/palette';
import { mono, monoBold } from '../theme/typography';
import { categoriesApi, type Category } from '../api/categories';
import type { ApiError } from '../api/client';

function CategorySection({
  title,
  isIncome,
  items,
  onDelete,
}: {
  title: string;
  isIncome: boolean;
  items: Category[];
  onDelete: (cat: Category) => void;
}) {
  const accent = isIncome ? moss : oxide;
  return (
    <Card>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: accent.light }]}>
          <Ionicons name={isIncome ? 'trending-up-outline' : 'trending-down-outline'} size={18} color={accent.main} />
        </View>
        <View>
          <Text style={[styles.sectionTitle, { color: accent.main }]}>{title}</Text>
          <Text style={styles.sectionCount}>
            {items.length} {items.length === 1 ? 'CATEGORY' : 'CATEGORIES'}
          </Text>
        </View>
      </View>

      <View style={styles.chipRow}>
        {items.length === 0 ? (
          <Text style={styles.muted}>No categories yet.</Text>
        ) : (
          items.map((cat) => (
            <View key={cat.id} style={styles.chip}>
              <Text style={styles.chipLabel}>{cat.name}</Text>
              <Ionicons
                name="close"
                size={14}
                color={concrete.aggregate}
                onPress={() => onDelete(cat)}
                style={styles.chipDelete}
                suppressHighlighting
              />
            </View>
          ))
        )}
      </View>
    </Card>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
      setError('');
    } catch {
      setCategories([]);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleCreate(data: Parameters<typeof categoriesApi.create>[0]) {
    await categoriesApi.create(data);
    await load();
  }

  function confirmDelete(cat: Category) {
    Alert.alert('Delete Category', `Delete "${cat.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await categoriesApi.delete(cat.id);
            await load();
          } catch (err) {
            const apiErr = err as ApiError;
            setError(
              apiErr.status === 409
                ? 'This category has transactions and cannot be deleted.'
                : apiErr.message ?? 'Delete failed'
            );
          }
        },
      },
    ]);
  }

  const incomeCategories = categories.filter((c) => c.type === 'INCOME');
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  return (
    <View style={styles.flex}>
      <Screen>
        <ScreenHeader title="Categories" subtitle="Organize your transactions" />
        {error ? <Banner message={error} /> : null}
        {!loading && (
          <>
            <CategorySection title="Income Categories" isIncome items={incomeCategories} onDelete={confirmDelete} />
            <CategorySection title="Expense Categories" isIncome={false} items={expenseCategories} onDelete={confirmDelete} />
          </>
        )}
      </Screen>
      <Fab onPress={() => setModalOpen(true)} />
      <CategoryModal open={modalOpen} onSave={handleCreate} onClose={() => setModalOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sectionIcon: {
    width: 36,
    height: 36,
    borderWidth: 2,
    borderColor: concrete.void,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontFamily: monoBold, fontSize: 13 },
  sectionCount: { fontFamily: mono, fontSize: 9, color: concrete.aggregate, letterSpacing: 1, marginTop: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: concrete.stone,
    backgroundColor: concrete.bg,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  chipLabel: { fontFamily: mono, fontSize: 12, color: concrete.void },
  chipDelete: { padding: 2 },
  muted: { fontFamily: mono, fontSize: 12, color: concrete.aggregate },
});
