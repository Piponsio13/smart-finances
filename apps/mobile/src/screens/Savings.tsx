import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import Banner from '../components/Banner';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';
import IconButton from '../components/IconButton';
import Fab from '../components/Fab';
import StatusBadge from '../components/StatusBadge';
import SavingsModal from '../components/modals/SavingsModal';
import ContributionModal from '../components/modals/ContributionModal';
import { concrete, moss, ochre } from '../theme/palette';
import { mono, monoBold } from '../theme/typography';
import { savingsApi, type SavingsGoal } from '../api/savings';
import type { ApiError } from '../api/client';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function GoalCard({
  goal,
  onEdit,
  onDelete,
  onContribute,
}: {
  goal: SavingsGoal;
  onEdit: () => void;
  onDelete: () => void;
  onContribute: () => void;
}) {
  const progress = Math.min(goal.progressPercent, 100);
  const progressColor = goal.completed ? moss.main : progress > 75 ? ochre.main : concrete.void;

  return (
    <Card>
      <View style={styles.headerRow}>
        <View style={styles.flexShrink}>
          <View style={styles.titleRow}>
            <Text style={styles.goalName}>{goal.name}</Text>
            {goal.completed ? <Ionicons name="checkmark-circle-outline" size={16} color={moss.main} /> : null}
          </View>
          {goal.targetDate ? (
            <Text style={styles.muted}>
              Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {goal.daysRemaining !== undefined && !goal.completed ? ` · ${goal.daysRemaining} days left` : ''}
            </Text>
          ) : null}
        </View>
        <View style={styles.actions}>
          <IconButton name="add-circle-outline" onPress={onContribute} color={moss.main} />
          <IconButton name="create-outline" onPress={onEdit} />
          <IconButton name="trash-outline" onPress={onDelete} />
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.muted}>
          Saved: <Text style={styles.amountStrong}>{formatCurrency(goal.savedAmount)}</Text>
        </Text>
        <Text style={styles.muted}>
          Target: <Text style={styles.amountStrong}>{formatCurrency(goal.targetAmount)}</Text>
        </Text>
      </View>

      <ProgressBar percent={progress} color={progressColor} />

      <View style={[styles.amountRow, { marginTop: 8 }]}>
        <Text style={[styles.progressLabel, { color: progressColor }]}>{progress.toFixed(0)}% saved</Text>
        <Text style={styles.progressLabelMuted}>{goal.completed ? 'Goal reached!' : `${formatCurrency(goal.remaining)} to go`}</Text>
      </View>

      {goal.completed ? (
        <View style={styles.completeBadge}>
          <StatusBadge label="Complete" color={moss.main} bgColor={moss.light} />
        </View>
      ) : null}
    </Card>
  );
}

export default function Savings() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [contributing, setContributing] = useState<SavingsGoal | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      const data = await savingsApi.getAll();
      setGoals(data);
    } catch {
      setGoals([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGoals().finally(() => setLoading(false));
    }, [fetchGoals])
  );

  function confirmDelete(goal: SavingsGoal) {
    Alert.alert('Delete Savings Goal', 'This savings goal and all its contributions will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await savingsApi.delete(goal.id);
            await fetchGoals();
          } catch (err) {
            setError((err as ApiError).message ?? 'Delete failed');
          }
        },
      },
    ]);
  }

  const completedCount = goals.filter((g) => g.completed).length;
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);

  return (
    <View style={styles.flex}>
      <Screen>
        <ScreenHeader title="Savings Goals" subtitle="Track your savings progress" />
        {error ? <Banner message={error} /> : null}

        {!loading && goals.length > 0 ? (
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TOTAL SAVED</Text>
              <Text style={[styles.statValue, { color: moss.main }]}>{formatCurrency(totalSaved)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>COMPLETED</Text>
              <Text style={styles.statValue}>
                {completedCount} / {goals.length}
              </Text>
            </View>
          </View>
        ) : null}

        {!loading && goals.length === 0 ? (
          <EmptyState message="No savings goals yet. Create one to start tracking your progress." />
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => {
                setEditing(goal);
                setModalOpen(true);
              }}
              onDelete={() => confirmDelete(goal)}
              onContribute={() => setContributing(goal)}
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
      <SavingsModal
        open={modalOpen}
        goal={editing}
        onCreate={async (data) => {
          await savingsApi.create(data);
          await fetchGoals();
        }}
        onUpdate={async (data) => {
          if (editing) {
            await savingsApi.update(editing.id, data);
            await fetchGoals();
          }
        }}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      />
      <ContributionModal
        open={contributing !== null}
        goal={contributing}
        onAdd={async (data) => {
          if (contributing) {
            await savingsApi.addContribution(contributing.id, data);
            await fetchGoals();
          }
        }}
        onClose={() => setContributing(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  flexShrink: { flex: 1, marginRight: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  goalName: { fontFamily: monoBold, fontSize: 14, color: concrete.void },
  muted: { fontFamily: mono, fontSize: 11, color: concrete.aggregate, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  amountStrong: { fontFamily: monoBold, color: concrete.void },
  progressLabel: { fontFamily: mono, fontSize: 10 },
  progressLabelMuted: { fontFamily: mono, fontSize: 10, color: concrete.aggregate },
  completeBadge: { marginTop: 10, alignSelf: 'flex-start' },
  statRow: { flexDirection: 'row', gap: 12 },
  statBox: { borderWidth: 2, borderColor: concrete.void, padding: 12, flex: 1 },
  statLabel: { fontFamily: monoBold, fontSize: 9, color: concrete.aggregate, letterSpacing: 1 },
  statValue: { fontFamily: monoBold, fontSize: 18, color: concrete.void, marginTop: 4 },
});
