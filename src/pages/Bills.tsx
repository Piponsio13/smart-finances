import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Grid,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { billsApi, type Bill, type BillStatus } from '../api/bills';
import { categoriesApi, type Category } from '../api/categories';
import BillModal from '../components/BillModal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { ApiError } from '../api/client';
import { concrete, moss, oxide, ochre } from '../theme/palette';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

const STATUS_CONFIG: Record<BillStatus, { label: string; bg: string; color: string }> = {
  UPCOMING:  { label: 'UPCOMING',  bg: concrete.stone, color: concrete.aggregate },
  DUE_SOON:  { label: 'DUE SOON',  bg: ochre.light,    color: ochre.main },
  DUE_TODAY: { label: 'DUE TODAY', bg: oxide.light,    color: oxide.main },
  OVERDUE:   { label: 'OVERDUE',   bg: oxide.main,     color: '#FFFFFF' },
};

function BillCard({
  bill,
  onEdit,
  onDelete,
}: {
  bill: Bill;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = STATUS_CONFIG[bill.status];

  return (
    <Card sx={{ opacity: bill.active ? 1 : 0.55 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{bill.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Due on day {bill.dueDay} of each month
              {bill.categoryName && ` · ${bill.categoryName}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={onEdit} sx={{ color: 'text.secondary' }}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={onDelete} sx={{ color: 'text.secondary' }}>
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 18, color: oxide.main }}>
            {formatCurrency(bill.amount)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!bill.active && (
              <Chip label="INACTIVE" size="small" sx={{ bgcolor: concrete.stone, color: concrete.aggregate, fontSize: 10, fontWeight: 700 }} />
            )}
            <Chip
              label={status.label}
              size="small"
              sx={{ bgcolor: status.bg, color: status.color, fontFamily: '"Space Mono", monospace', fontSize: 10, fontWeight: 700 }}
            />
          </Box>
        </Box>
      </CardContent>
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
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function fetchBills() {
    try {
      const data = await billsApi.getAll();
      setBills(data);
    } catch {
      setBills([]);
    }
  }

  useEffect(() => {
    async function init() {
      const [billResult, catResult] = await Promise.allSettled([
        billsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setBills(billResult.status === 'fulfilled' ? billResult.value : []);
      setCategories(catResult.status === 'fulfilled' ? catResult.value : []);
      setLoading(false);
    }
    init();
  }, []);

  async function handleDelete() {
    if (deletingId === null) return;
    setDeleteLoading(true);
    try {
      await billsApi.delete(deletingId);
      setDeletingId(null);
      await fetchBills();
    } catch (err) {
      setError((err as ApiError).message ?? 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  }

  const urgentCount = bills.filter((b) => b.active && (b.status === 'DUE_TODAY' || b.status === 'OVERDUE')).length;
  const dueSoonCount = bills.filter((b) => b.active && b.status === 'DUE_SOON').length;
  const totalMonthly = bills.filter((b) => b.active).reduce((s, b) => s + b.amount, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: 24 }}>Bill Reminders</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 12, fontFamily: '"Space Mono", monospace', color: concrete.aggregate, textTransform: 'uppercase', letterSpacing: 1 }}>
            Track recurring bills and due dates
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => { setEditing(null); setModalOpen(true); }}>
          Add Bill
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      {urgentCount > 0 && (
        <Alert severity="error">
          {urgentCount} bill{urgentCount > 1 ? 's are' : ' is'} due today or overdue.
        </Alert>
      )}
      {dueSoonCount > 0 && urgentCount === 0 && (
        <Alert severity="warning">
          {dueSoonCount} bill{dueSoonCount > 1 ? 's are' : ' is'} due within 3 days.
        </Alert>
      )}

      {!loading && bills.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ p: 2, border: `2px solid ${concrete.void}` }}>
            <Typography sx={{ fontSize: 10, fontFamily: '"Space Mono", monospace', color: concrete.aggregate, textTransform: 'uppercase', letterSpacing: 1 }}>
              Monthly Total
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: oxide.main, fontFamily: '"Space Mono", monospace' }}>
              {formatCurrency(totalMonthly)}
            </Typography>
          </Box>
          <Box sx={{ p: 2, border: `2px solid ${concrete.void}` }}>
            <Typography sx={{ fontSize: 10, fontFamily: '"Space Mono", monospace', color: concrete.aggregate, textTransform: 'uppercase', letterSpacing: 1 }}>
              Active Bills
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: concrete.void, fontFamily: '"Space Mono", monospace' }}>
              {bills.filter((b) => b.active).length}
            </Typography>
          </Box>
        </Box>
      )}

      {loading ? (
        <Grid container spacing={2.5}>
          {[...Array(4)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
      ) : bills.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No bill reminders yet. Add one to track your recurring payments.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {bills
            .sort((a, b) => {
              const order: BillStatus[] = ['OVERDUE', 'DUE_TODAY', 'DUE_SOON', 'UPCOMING'];
              return order.indexOf(a.status) - order.indexOf(b.status);
            })
            .map((bill) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={bill.id}>
                <BillCard
                  bill={bill}
                  onEdit={() => setEditing(bill)}
                  onDelete={() => setDeletingId(bill.id)}
                />
              </Grid>
            ))}
        </Grid>
      )}

      <BillModal
        open={modalOpen || editing !== null}
        bill={editing}
        categories={categories}
        onCreate={async (data) => { await billsApi.create(data); await fetchBills(); }}
        onUpdate={async (data) => { if (editing) { await billsApi.update(editing.id, data); await fetchBills(); } }}
        onClose={() => { setModalOpen(false); setEditing(null); }}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Bill Reminder"
        message="This bill reminder will be permanently deleted."
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </Box>
  );
}
