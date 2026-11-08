import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import Banner from '../components/Banner';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';
import IconButton from '../components/IconButton';
import Fab from '../components/Fab';
import StatusBadge from '../components/StatusBadge';
import BudgetModal from '../components/modals/BudgetModal';
import { concrete, oxide, ochre } from '../theme/palette';
import { mono, monoBold } from '../theme/typography';
import { budgetsApi, type Budget } from '../api/budgets';
import { categoriesApi, type Category } from '../api/categories';
import type { ApiError } from '../api/client';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function BudgetCard({ budget, onEdit, onDelete }: { budget: Budget; onEdit: () => void; onDelete: () => void }) {
  const progress = budget.monthlyLimit > 0 ? Math.min((budget.actualSpending / budget.monthlyLimit) * 100, 100) : 0;
  const progressColor = budget.exceeded ? oxide.main : progress > 80 ? ochre.main : concrete.void;

  return (
    <Card>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.categoryName}>{budget.categoryName}</Text>
          <Text style={styles.muted}>{MONTH_NAMES[budget.month - 1]} {budget.year}</Text>
        </View>
        <View style={styles.actions}>
          {budget.exceeded ? <StatusBadge label="Over Budget" color={oxide.main} bgColor={oxide.light} /> : null}
          <IconButton name="create-outline" onPress={onEdit} />
          <IconButton name="trash-outline" onPress={onDelete} />
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.muted}>
          Spent: <Text style={styles.amountStrong}>{formatCurrency(budget.actualSpending)}</Text>
        </Text>
        <Text style={styles.muted}>
          Limit: <Text style={styles.amountStrong}>{formatCurrency(budget.monthlyLimit)}</Text>
        </Text>
      </View>

      <ProgressBar percent={progress} color={progressColor} />

      <View style={[styles.amountRow, { marginTop: 8 }]}>
        <Text style={[styles.progressLabel, { color: progressColor }]}>{progress.toFixed(0)}% used</Text>
        <Text style={[styles.progressLabel, { color: budget.exceeded ? oxide.main : concrete.aggregate }]}>
          {budget.exceeded ? `${formatCurrency(Math.abs(budget.remaining))} over` : `${formatCurrency(budget.remaining)} remaining`}
        </Text>
      </View>
    </Card>
  );
}

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const fetchBudgets = useCallback(async () => {
    try {
      const data = await budgetsApi.getAll();
      setBudgets(data);
      setError('');
    } catch {
      setBudgets([]);
    }
  }, []);

  const load = useCallback(async () => {
    const [budgetResult, catResult] = await Promise.allSettled([budgetsApi.getAll(), categoriesApi.getAll()]);
    setBudgets(budgetResult.status === 'fulfilled' ? budgetResult.value : []);
    setCategories(catResult.status === 'fulfilled' ? catResult.value : []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleCreate(data: Parameters<typeof budgetsApi.create>[0]) {
    await budgetsApi.create(data);
    await fetchBudgets();
  }

  async function handleUpdate(data: Parameters<typeof budgetsApi.update>[1]) {
    if (!editingBudget) return;
    await budgetsApi.update(editingBudget.id, data);
    await fetchBudgets();
  }

  function confirmDelete(budget: Budget) {
    Alert.alert('Delete Budget', 'This budget will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await budgetsApi.delete(budget.id);
            await fetchBudgets();
          } catch (err) {
            setError((err as ApiError).message ?? 'Delete failed');
          }
        },
      },
    ]);
  }

  const exceededCount = budgets.filter((b) => b.exceeded).length;

  return (
    <View style={styles.flex}>
      <Screen>
        <ScreenHeader title="Budgets" subtitle="Track your spending limits" />
        {error ? <Banner message={error} /> : null}
        {exceededCount > 0 ? (
          <Banner message={`${exceededCount} budget${exceededCount > 1 ? 's are' : ' is'} over the monthly limit.`} />
        ) : null}
        {!loading && budgets.length === 0 ? (
          <EmptyState message="No budgets set yet. Add one to start tracking your spending limits." />
        ) : (
          budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={() => setEditingBudget(budget)}
              onDelete={() => confirmDelete(budget)}
            />
          ))
        )}
      </Screen>
      <Fab onPress={() => setModalOpen(true)} />
      <BudgetModal
        open={modalOpen || editingBudget !== null}
        categories={categories}
        budget={editingBudget}
        onSave={handleCreate}
        onUpdate={handleUpdate}
        onClose={() => {
          setModalOpen(false);
          setEditingBudget(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  categoryName: { fontFamily: monoBold, fontSize: 14, color: concrete.void },
  muted: { fontFamily: mono, fontSize: 11, color: concrete.aggregate, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  amountStrong: { fontFamily: monoBold, color: concrete.void },
  progressLabel: { fontFamily: mono, fontSize: 10 },
});
