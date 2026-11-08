import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import Banner from '../components/Banner';
import EmptyState from '../components/EmptyState';
import IconButton from '../components/IconButton';
import Fab from '../components/Fab';
import StatusBadge from '../components/StatusBadge';
import TransactionModal from '../components/modals/TransactionModal';
import TransactionFilterModal from '../components/modals/TransactionFilterModal';
import { concrete, moss, oxide } from '../theme/palette';
import { mono, monoBold } from '../theme/typography';
import { transactionsApi, type Transaction, type TransactionFilters } from '../api/transactions';
import { categoriesApi, type Category } from '../api/categories';
import { getHeaders } from '../api/client';
import type { ApiError } from '../api/client';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function exportFile(url: string, filename: string) {
  const destination = new File(Paths.cache, filename);
  if (destination.exists) destination.delete();
  const downloaded = await File.downloadFileAsync(url, destination, { headers: getHeaders() });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(downloaded.uri);
  }
}

function TransactionRow({ tx, onEdit, onDelete }: { tx: Transaction; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card>
      <View style={styles.rowTop}>
        <View style={styles.flexShrink}>
          <Text style={styles.description}>{tx.description}</Text>
          <Text style={styles.muted}>{formatDate(tx.date)}</Text>
        </View>
        <View style={styles.actions}>
          <IconButton name="create-outline" onPress={onEdit} />
          <IconButton name="trash-outline" onPress={onDelete} />
        </View>
      </View>
      <View style={styles.rowBottom}>
        <StatusBadge
          label={tx.categoryName}
          color={tx.type === 'INCOME' ? moss.main : oxide.main}
          bgColor={tx.type === 'INCOME' ? moss.light : oxide.light}
        />
        <Text style={[styles.amount, { color: tx.type === 'INCOME' ? moss.main : oxide.main }]}>
          {tx.type === 'INCOME' ? '+' : '-'}
          {formatCurrency(tx.amount)}
        </Text>
      </View>
    </Card>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async (activeFilters: TransactionFilters) => {
    try {
      const data = await transactionsApi.getAll(activeFilters);
      setTransactions(data);
      setError('');
    } catch {
      setTransactions([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function init() {
        const [txResult, catResult] = await Promise.allSettled([
          transactionsApi.getAll(filters),
          categoriesApi.getAll(),
        ]);
        if (cancelled) return;
        setTransactions(txResult.status === 'fulfilled' ? txResult.value : []);
        setCategories(catResult.status === 'fulfilled' ? catResult.value : []);
        setLoading(false);
      }
      init();
      return () => {
        cancelled = true;
      };
    }, [filters])
  );

  async function handleSave(data: Parameters<typeof transactionsApi.create>[0]) {
    if (editingTx) {
      await transactionsApi.update(editingTx.id, data);
    } else {
      await transactionsApi.create(data);
    }
    await fetchTransactions(filters);
  }

  function confirmDelete(tx: Transaction) {
    Alert.alert('Delete Transaction', 'This transaction will be permanently deleted. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await transactionsApi.delete(tx.id);
            await fetchTransactions(filters);
          } catch (err) {
            setError((err as ApiError).message ?? 'Delete failed');
          }
        },
      },
    ]);
  }

  async function handleExport(kind: 'csv' | 'pdf') {
    try {
      const url = kind === 'csv' ? transactionsApi.exportCsvUrl(filters) : transactionsApi.exportPdfUrl(filters);
      await exportFile(url, `transactions.${kind}`);
    } catch {
      setError(`Failed to export ${kind.toUpperCase()}.`);
    }
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <View style={styles.flex}>
      <Screen>
        <ScreenHeader title="Transactions" subtitle="Manage your income and expenses" />

        <View style={styles.toolbar}>
          <IconButton name="filter-outline" onPress={() => setFilterOpen(true)} color={concrete.void} size={20} />
          {activeFilterCount > 0 ? <Text style={styles.filterCount}>{activeFilterCount} ACTIVE</Text> : null}
          <View style={styles.toolbarSpacer} />
          <IconButton name="download-outline" onPress={() => handleExport('csv')} color={concrete.void} size={20} />
          <IconButton name="document-text-outline" onPress={() => handleExport('pdf')} color={concrete.void} size={20} />
        </View>

        {error ? <Banner message={error} /> : null}

        {!loading && transactions.length === 0 ? (
          <EmptyState message="No transactions found." />
        ) : (
          transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              onEdit={() => {
                setEditingTx(tx);
                setModalOpen(true);
              }}
              onDelete={() => confirmDelete(tx)}
            />
          ))
        )}
      </Screen>

      <Fab
        onPress={() => {
          setEditingTx(null);
          setModalOpen(true);
        }}
      />

      <TransactionModal
        open={modalOpen}
        transaction={editingTx}
        categories={categories}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />

      <TransactionFilterModal
        open={filterOpen}
        filters={filters}
        categories={categories}
        onApply={setFilters}
        onClose={() => setFilterOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toolbarSpacer: { flex: 1 },
  filterCount: { fontFamily: monoBold, fontSize: 10, color: concrete.aggregate, letterSpacing: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  flexShrink: { flex: 1, marginRight: 8 },
  description: { fontFamily: monoBold, fontSize: 14, color: concrete.void },
  muted: { fontFamily: mono, fontSize: 11, color: concrete.aggregate, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontFamily: monoBold, fontSize: 15 },
});
