import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
import type { Budget, CreateBudgetRequest, UpdateBudgetRequest } from '../api/budgets';
import type { Category } from '../api/categories';
import type { ApiError } from '../api/client';

interface BudgetModalProps {
  open: boolean;
  categories: Category[];
  budget?: Budget | null;
  onSave: (data: CreateBudgetRequest) => Promise<void>;
  onUpdate?: (data: UpdateBudgetRequest) => Promise<void>;
  onClose: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentDate = new Date();

export default function BudgetModal({ open, categories, budget, onSave, onUpdate, onClose }: BudgetModalProps) {
  const isEditing = !!budget;

  const [form, setForm] = useState({
    categoryId: 0,
    monthlyLimit: 0,
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  useEffect(() => {
    if (open) {
      setForm(
        isEditing
          ? { categoryId: 0, monthlyLimit: budget.monthlyLimit, month: budget.month, year: budget.year }
          : { categoryId: 0, monthlyLimit: 0, month: currentDate.getMonth() + 1, year: currentDate.getFullYear() }
      );
      setError('');
    }
  }, [open, isEditing, budget]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEditing && !form.categoryId) {
      setError('Please select a category.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEditing && onUpdate) {
        await onUpdate({ monthlyLimit: form.monthlyLimit });
      } else {
        await onSave(form);
      }
      onClose();
    } catch (err) {
      setError((err as ApiError).message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{isEditing ? 'Edit Budget' : 'New Budget'}</DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {!isEditing && (
            <TextField
              select
              label="Category"
              value={form.categoryId || ''}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))}
              required
              fullWidth
            >
              {expenseCategories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Monthly Limit ($)"
            type="number"
            inputProps={{ min: 1, step: 0.01 }}
            value={form.monthlyLimit || ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, monthlyLimit: parseFloat(e.target.value) || 0 }))
            }
            required
            fullWidth
          />

          {!isEditing && (
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                select
                label="Month"
                value={form.month}
                onChange={(e) => setForm((f) => ({ ...f, month: Number(e.target.value) }))}
                fullWidth
              >
                {MONTHS.map((m, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {m}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Year"
                type="number"
                inputProps={{ min: 2020, max: 2100 }}
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save Changes' : 'Create Budget'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
