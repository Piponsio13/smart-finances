import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Alert,
  Skeleton,
  Grid,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import { categoriesApi, type Category } from '../api/categories';
import CategoryModal from '../components/CategoryModal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { ApiError } from '../api/client';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function fetchCategories() {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
      setError('');
    } catch {
      setError('Failed to load categories.');
    }
  }

  useEffect(() => {
    fetchCategories().finally(() => setLoading(false));
  }, []);

  async function handleCreate(data: Parameters<typeof categoriesApi.create>[0]) {
    await categoriesApi.create(data);
    await fetchCategories();
  }

  async function handleDelete() {
    if (deletingId === null) return;
    setDeleteLoading(true);
    try {
      await categoriesApi.delete(deletingId);
      setDeletingId(null);
      await fetchCategories();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 409) {
        setError('This category has transactions and cannot be deleted.');
      } else {
        setError(apiErr.message ?? 'Delete failed');
      }
      setDeletingId(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  const incomeCategories = categories.filter((c) => c.type === 'INCOME');
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  function CategorySection({
    title,
    type,
    items,
  }: {
    title: string;
    type: 'INCOME' | 'EXPENSE';
    items: Category[];
  }) {
    const isIncome = type === 'INCOME';
    return (
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                border: '2px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isIncome ? '#D6F0E0' : '#FFE0E0',
                color: isIncome ? '#007A45' : '#CC0000',
              }}
            >
              {isIncome ? (
                <TrendingUpOutlinedIcon fontSize="small" />
              ) : (
                <TrendingDownOutlinedIcon fontSize="small" />
              )}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: isIncome ? '#007A45' : '#CC0000', fontSize: 14 }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: 10, fontFamily: '"Space Mono", monospace', color: '#666666', textTransform: 'uppercase', letterSpacing: 1 }}>
                {items.length} {items.length === 1 ? 'category' : 'categories'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {items.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name}
                onDelete={() => setDeletingId(cat.id)}
                deleteIcon={
                  <Tooltip title="Delete">
                    <DeleteOutlineOutlinedIcon />
                  </Tooltip>
                }
                sx={{
                  bgcolor: '#FFFFFF',
                  '& .MuiChip-deleteIcon': {
                    color: '#888888',
                    '&:hover': { color: '#CC0000' },
                  },
                }}
              />
            ))}
            {items.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No categories yet.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: 24 }}>Categories</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 12, fontFamily: '"Space Mono", monospace', color: '#666666', textTransform: 'uppercase', letterSpacing: 1 }}>
            Organize your transactions with custom categories
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setModalOpen(true)}>
          Add Category
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={200} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={200} />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CategorySection title="Income Categories" type="INCOME" items={incomeCategories} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CategorySection title="Expense Categories" type="EXPENSE" items={expenseCategories} />
          </Grid>
        </Grid>
      )}

      <CategoryModal
        open={modalOpen}
        onSave={handleCreate}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Category"
        message="Are you sure you want to delete this category? This cannot be undone."
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeletingId(null)}
      />
    </Box>
  );
}
