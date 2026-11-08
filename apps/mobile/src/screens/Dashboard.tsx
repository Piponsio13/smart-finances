import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import { concrete, moss, oxide } from '../theme/palette';
import { mono, monoBold } from '../theme/typography';
import { dashboardApi, type DashboardData } from '../api/dashboard';
import { transactionsApi, type Transaction } from '../api/transactions';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const [dashboardResult, txResult] = await Promise.allSettled([
      dashboardApi.get(),
      transactionsApi.getAll(),
    ]);
    setData(dashboardResult.status === 'fulfilled' ? dashboardResult.value : null);
    setRecent(txResult.status === 'fulfilled' ? txResult.value.slice(0, 5) : []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <Screen>
        <ScreenHeader title="Dashboard" />
        <EmptyState message="Loading…" />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen refreshing={refreshing} onRefresh={() => load(true)}>
        <ScreenHeader title="Dashboard" />
        <EmptyState message="No data to display yet. Add a transaction to see your dashboard." />
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => load(true)}>
      <ScreenHeader title="Dashboard" subtitle={`${MONTH_NAMES[data.month - 1]} ${data.year}`} />

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Income"
          value={formatCurrency(data.totalIncome)}
          icon={<Ionicons name="trending-up-outline" size={18} color={moss.main} />}
          color={moss.main}
          bgColor={moss.light}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(data.totalExpenses)}
          icon={<Ionicons name="trending-down-outline" size={18} color={oxide.main} />}
          color={oxide.main}
          bgColor={oxide.light}
        />
        <StatCard
          title="Balance"
          value={formatCurrency(data.balance)}
          icon={<Ionicons name="wallet-outline" size={18} color={data.balance >= 0 ? moss.main : oxide.main} />}
          color={data.balance >= 0 ? moss.main : oxide.main}
          bgColor={data.balance >= 0 ? moss.light : oxide.light}
        />
        <StatCard
          title="Transactions"
          value={String(data.transactionCount)}
          icon={<Ionicons name="receipt-outline" size={18} color={concrete.void} />}
          color={concrete.void}
          bgColor={concrete.stone}
        />
      </View>

      <Card>
        <Text style={styles.cardTitle}>Spending by Category</Text>
        {data.spendingByCategory.length === 0 ? (
          <Text style={styles.muted}>No spending recorded this month.</Text>
        ) : (
          <View style={styles.categoryList}>
            {data.spendingByCategory.map((cat) => (
              <View key={cat.categoryName} style={styles.categoryRow}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{cat.categoryName}</Text>
                  <View style={styles.categoryValues}>
                    <Text style={styles.muted}>{cat.percentage.toFixed(1)}%</Text>
                    <Text style={styles.categoryAmount}>{formatCurrency(cat.total)}</Text>
                  </View>
                </View>
                <ProgressBar percent={cat.percentage} />
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Recent Transactions</Text>
        {recent.length === 0 ? (
          <Text style={styles.muted}>No transactions yet.</Text>
        ) : (
          <View style={styles.txList}>
            {recent.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txInfo}>
                  <Text style={styles.txDescription}>{tx.description}</Text>
                  <Text style={styles.muted}>
                    {tx.categoryName} · {formatDate(tx.date)}
                  </Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'INCOME' ? moss.main : oxide.main }]}>
                  {tx.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cardTitle: { fontFamily: monoBold, fontSize: 14, color: concrete.void, marginBottom: 14 },
  muted: { fontFamily: mono, fontSize: 12, color: concrete.aggregate },
  categoryList: { gap: 14 },
  categoryRow: { gap: 6 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryName: { fontFamily: mono, fontSize: 13, color: concrete.void },
  categoryValues: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryAmount: { fontFamily: monoBold, fontSize: 13, color: concrete.void, minWidth: 68, textAlign: 'right' },
  txList: { gap: 12 },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: concrete.stone,
  },
  txInfo: { flex: 1, gap: 3 },
  txDescription: { fontFamily: mono, fontSize: 13, color: concrete.void },
  txAmount: { fontFamily: monoBold, fontSize: 13, marginLeft: 12 },
});
