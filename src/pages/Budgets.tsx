import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Grid,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { budgetsApi, type Budget } from '../api/budgets';
import { categoriesApi, type Category } from '../api/categories';
import BudgetModal from '../components/BudgetModal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { ApiError } from '../api/client';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function BudgetCard({
  budget,
  onDelete,
}: {
  budget: Budget;
  onDelete: () => void;
}) {
  const progress = budget.monthlyLimit > 0
    ? Math.min((budget.actualSpending / budget.monthlyLimit) * 100, 100)
    : 0;

  const progressColor = budget.exceeded
    ? '#CC0000'
    : progress > 80
    ? '#B85C00'
    : '#000000';

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {budget.categoryName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {MONTH_NAMES[budget.month - 1]} {budget.year}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {budget.exceeded && (
              <Chip
                icon={<WarningAmberOutlinedIcon />}
                label="OVER BUDGET"
                size="small"
                sx={{ bgcolor: '#FFE0E0', color: '#CC0000', borderColor: '#CC0000' }}
              />
            )}
            <Tooltip title="Delete budget">
              <IconButton size="small" onClick={onDelete} sx={{ color: 'text.secondary' }}>
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Spent: <strong style={{ color: '#111827' }}>{formatCurrency(budget.actualSpending)}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Limit: <strong style={{ color: '#111827' }}>{formatCurrency(budget.monthlyLimit)}</strong>
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mb: 1,
            '& .MuiLinearProgress-bar': { bgcolor: progressColor },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ fontWeight: 500, color: progressColor }}>
            {progress.toFixed(0)}% used
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 500,
              color: budget.exceeded ? 'error.main' : 'text.secondary',
            }}
          >
            {budget.exceeded
              ? `${formatCurrency(Math.abs(budget.remaining))} over`
              : `${formatCurrency(budget.remaining)} remaining`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function fetchBudgets() {
    try {
      const data = await budgetsApi.getAll();
      setBudgets(data);
      setError('');
    } catch {
      setError('Failed to load budgets.');
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const [budgetData, catData] = await Promise.all([
          budgetsApi.getAll(),
          categoriesApi.getAll(),
        ]);
        setBudgets(budgetData);
        setCategories(catData);
      } catch {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function handleCreate(data: Parameters<typeof budgetsApi.create>[0]) {
    await budgetsApi.create(data);
    await fetchBudgets();
  }

  async function handleDelete() {
    if (deletingId === null) return;
    setDeleteLoading(true);
    try {
      await budgetsApi.delete(deletingId);
      setDeletingId(null);
      await fetchBudgets();
    } catch (err) {
      setError((err as ApiError).message ?? 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  }

  const exceededCount = budgets.filter((b) => b.exceeded).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: 24 }}>Budgets</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 12, fontFamily: '"Space Mono", monospace', color: '#666666', textTransform: 'uppercase', letterSpacing: 1 }}>
            Track your spending limits per category
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setModalOpen(true)}>
          Add Budget
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      {exceededCount > 0 && (
        <Alert severity="warning">
          {exceededCount} budget{exceededCount > 1 ? 's are' : ' is'} over the monthly limit.
        </Alert>
      )}

      {loading ? (
        <Grid container spacing={2.5}>
          {[...Array(4)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      ) : budgets.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No budgets set yet. Add one to start tracking your spending limits.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {budgets.map((budget) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={budget.id}>
              <BudgetCard budget={budget} onDelete={() => setDeletingId(budget.id)} />
            </Grid>
          ))}
        </Grid>
      )}

      <BudgetModal
        open={modalOpen}
        categories={categories}
        onSave={handleCreate}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Budget"
        message="This budget will be permanently deleted."
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </Box>
  );
}
