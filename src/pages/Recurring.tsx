import { useEffect, useState } from 'react';
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
  Tooltip,
  Alert,
  Skeleton,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { recurringApi, type RecurringTransaction } from '../api/recurring';
import { categoriesApi, type Category } from '../api/categories';
import RecurringModal from '../components/RecurringModal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { ApiError } from '../api/client';
import { concrete, moss, oxide, ochre } from '../theme/palette';

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

export default function Recurring() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function fetchItems() {
    try {
      const data = await recurringApi.getAll();
      setItems(data);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    async function init() {
      const [recResult, catResult] = await Promise.allSettled([
        recurringApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setItems(recResult.status === 'fulfilled' ? recResult.value : []);
      setCategories(catResult.status === 'fulfilled' ? catResult.value : []);
      setLoading(false);
    }
    init();
  }, []);

  async function handleDelete() {
    if (deletingId === null) return;
    setDeleteLoading(true);
    try {
      await recurringApi.delete(deletingId);
      setDeletingId(null);
      await fetchItems();
    } catch (err) {
      setError((err as ApiError).message ?? 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: 24 }}>Recurring Transactions</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 12, fontFamily: '"Space Mono", monospace', color: concrete.aggregate, textTransform: 'uppercase', letterSpacing: 1 }}>
            Auto-generated daily, weekly, monthly, or yearly
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => { setEditing(null); setModalOpen(true); }}>
          Add Recurring
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[...Array(4)].map((_, i) => <Skeleton key={i} variant="rounded" height={52} />)}
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Next Due</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No recurring transactions yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                      <TableCell sx={{ fontWeight: 500 }}>{item.description}</TableCell>
                      <TableCell>
                        <Chip label={item.categoryName} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.type}
                          size="small"
                          sx={{
                            bgcolor: item.type === 'INCOME' ? moss.light : oxide.light,
                            color: item.type === 'INCOME' ? moss.main : oxide.main,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontFamily: '"Space Mono", monospace',
                            fontWeight: 700,
                            color: ochre.main,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          {FREQ_LABELS[item.frequency]}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                        {item.nextDueDate ? formatDate(item.nextDueDate) : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 13, color: item.type === 'INCOME' ? moss.main : oxide.main }}>
                          {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.active ? 'ACTIVE' : 'PAUSED'}
                          size="small"
                          sx={{
                            bgcolor: item.active ? moss.light : concrete.stone,
                            color: item.active ? moss.main : concrete.aggregate,
                            fontFamily: '"Space Mono", monospace',
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => { setEditing(item); setModalOpen(true); }}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeletingId(item.id)} sx={{ color: 'error.main' }}>
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

      <RecurringModal
        open={modalOpen}
        recurring={editing}
        categories={categories}
        onCreate={async (data) => { await recurringApi.create(data); await fetchItems(); }}
        onUpdate={async (data) => { if (editing) { await recurringApi.update(editing.id, data); await fetchItems(); } }}
        onClose={() => { setModalOpen(false); setEditing(null); }}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Recurring Transaction"
        message="This recurring transaction will be permanently deleted. Future auto-generated transactions from this template will stop."
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </Box>
  );
}
