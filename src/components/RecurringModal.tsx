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
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
import type { RecurringTransaction, CreateRecurringRequest, UpdateRecurringRequest, Frequency } from '../api/recurring';
import type { Category } from '../api/categories';
import type { ApiError } from '../api/client';

interface RecurringModalProps {
  open: boolean;
  recurring?: RecurringTransaction | null;
  categories: Category[];
  onCreate: (data: CreateRecurringRequest) => Promise<void>;
  onUpdate: (data: UpdateRecurringRequest) => Promise<void>;
  onClose: () => void;
}

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
];

export default function RecurringModal({ open, recurring, categories, onCreate, onUpdate, onClose }: RecurringModalProps) {
  const isEditing = !!recurring;

  const [form, setForm] = useState({
    amount: 0,
    description: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    categoryId: 0,
    frequency: 'MONTHLY' as Frequency,
    startDate: new Date().toISOString().slice(0, 10),
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredCategories = categories.filter((c) => c.type === form.type);

  useEffect(() => {
    if (!open) return;
    if (recurring) {
      const matchedCat = categories.find((c) => c.name === recurring.categoryName);
      setForm({
        amount: recurring.amount,
        description: recurring.description,
        type: recurring.type,
        categoryId: matchedCat?.id ?? 0,
        frequency: recurring.frequency,
        startDate: recurring.startDate.slice(0, 10),
        active: recurring.active,
      });
    } else {
      setForm({
        amount: 0,
        description: '',
        type: 'EXPENSE',
        categoryId: 0,
        frequency: 'MONTHLY',
        startDate: new Date().toISOString().slice(0, 10),
        active: true,
      });
    }
    setError('');
  }, [open, recurring, categories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId) {
      setError('Please select a category.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        await onUpdate({
          amount: form.amount,
          description: form.description,
          type: form.type,
          categoryId: form.categoryId,
          frequency: form.frequency,
          active: form.active,
        });
      } else {
        await onCreate({
          amount: form.amount,
          description: form.description,
          type: form.type,
          categoryId: form.categoryId,
          frequency: form.frequency,
          startDate: form.startDate,
        });
      }
      onClose();
    } catch (err) {
      setError((err as ApiError).message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEditing ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <ToggleButtonGroup
            value={form.type}
            exclusive
            size="small"
            onChange={(_, v) => v && setForm((f) => ({ ...f, type: v, categoryId: 0 }))}
            sx={{ alignSelf: 'flex-start' }}
          >
            <ToggleButton value="EXPENSE" sx={{ px: 2.5, '&.Mui-selected': { bgcolor: 'error.light', color: 'error.main', '&:hover': { bgcolor: 'error.light' } } }}>
              Expense
            </ToggleButton>
            <ToggleButton value="INCOME" sx={{ px: 2.5, '&.Mui-selected': { bgcolor: 'success.light', color: 'success.main', '&:hover': { bgcolor: 'success.light' } } }}>
              Income
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Amount"
            type="number"
            inputProps={{ min: 0.01, step: 0.01 }}
            value={form.amount || ''}
            onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
            required
            fullWidth
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
            fullWidth
          />

          <TextField
            select
            label="Category"
            value={form.categoryId || ''}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))}
            required
            fullWidth
          >
            {filteredCategories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Frequency"
            value={form.frequency}
            onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as Frequency }))}
            fullWidth
          >
            {FREQUENCIES.map((f) => (
              <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
            ))}
          </TextField>

          {!isEditing && (
            <TextField
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}

          {isEditing && (
            <FormControlLabel
              control={
                <Switch
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
              }
              label="Active"
            />
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
