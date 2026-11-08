import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Alert,
  Skeleton,
  Tooltip,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { transactionsApi, type Transaction, type TransactionFilters } from '../api/transactions';
import { categoriesApi, type Category } from '../api/categories';
import TransactionModal from '../components/TransactionModal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { ApiError } from '../api/client';
import { concrete, moss, oxide } from '../theme/palette';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState<TransactionFilters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await transactionsApi.getAll(filters);
      setTransactions(data);
      setError('');
    } catch {
      // Nothing to load yet — not an error, just no transactions.
      setTransactions([]);
    }
  }, [filters]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [txResult, catResult] = await Promise.allSettled([
        transactionsApi.getAll(filters),
        categoriesApi.getAll(),
      ]);
      // Settled independently — one failing shouldn't wipe out the other.
      setTransactions(txResult.status === 'fulfilled' ? txResult.value : []);
      setCategories(catResult.status === 'fulfilled' ? catResult.value : []);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!loading) fetchTransactions();
  }, [filters, fetchTransactions, loading]);

  async function handleSave(data: Parameters<typeof transactionsApi.create>[0]) {
    if (editingTx) {
      await transactionsApi.update(editingTx.id, data);
    } else {
      await transactionsApi.create(data);
    }
    await fetchTransactions();
  }

  async function handleDelete() {
    if (deletingId === null) return;
    setDeleteLoading(true);
    try {
      await transactionsApi.delete(deletingId);
      setDeletingId(null);
      await fetchTransactions();
    } catch (err) {
      setError((err as ApiError).message ?? 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleExportCsv() {
    try {
      const res = await transactionsApi.exportCsv(filters);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export CSV.');
    }
  }

  async function handleExportPdf() {
    try {
      const res = await transactionsApi.exportPdf(filters);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export PDF.');
    }
  }

  function openAdd() {
    setEditingTx(null);
    setModalOpen(true);
  }

  function openEdit(tx: Transaction) {
    setEditingTx(tx);
    setModalOpen(true);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: 24 }}>Transactions</Typography>
          <Typography
            sx={{ mt: 0.5, fontSize: 12, fontFamily: '"Space Mono", monospace', color: concrete.aggregate, textTransform: 'uppercase', letterSpacing: 1 }}
          >
            Manage your income and expenses
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={handleExportCsv}
            size="small"
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfOutlinedIcon />}
            onClick={handleExportPdf}
            size="small"
          >
            PDF
          </Button>
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openAdd}>
            Add Transaction
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            select
            label="Type"
            value={filters.type ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                type: (e.target.value as 'INCOME' | 'EXPENSE') || undefined,
              }))
            }
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="INCOME">Income</MenuItem>
            <MenuItem value="EXPENSE">Expense</MenuItem>
          </TextField>

          <TextField
            select
            label="Category"
            value={filters.categoryId ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, categoryId: Number(e.target.value) || undefined }))
            }
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="From"
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value || undefined }))}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="To"
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value || undefined }))}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Search"
            value={filters.description ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, description: e.target.value || undefined }))
            }
            placeholder="Description..."
            sx={{ minWidth: 180 }}
          />

          {Object.values(filters).some(Boolean) && (
            <Button variant="text" color="inherit" onClick={() => setFilters({})}>
              Clear
            </Button>
          )}
        </Box>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={52} />
          ))}
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}
                    >
                      <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                        {formatDate(tx.date)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{tx.description}</TableCell>
                      <TableCell>
                        <Chip label={tx.categoryName} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.type === 'INCOME' ? 'INCOME' : 'EXPENSE'}
                          size="small"
                          sx={{
                            bgcolor: tx.type === 'INCOME' ? moss.light : oxide.light,
                            color: tx.type === 'INCOME' ? moss.main : oxide.main,
                            borderColor: tx.type === 'INCOME' ? moss.main : oxide.main,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontFamily: '"Space Mono", monospace',
                            fontWeight: 700,
                            fontSize: 13,
                            color: tx.type === 'INCOME' ? moss.main : oxide.main,
                          }}
                        >
                          {tx.type === 'INCOME' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(tx)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => setDeletingId(tx.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <TransactionModal
        open={modalOpen}
        transaction={editingTx}
        categories={categories}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Transaction"
        message="This transaction will be permanently deleted. This cannot be undone."
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </Box>
  );
}
