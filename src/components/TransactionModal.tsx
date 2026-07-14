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
} from '@mui/material';
import type { Transaction, CreateTransactionRequest } from '../api/transactions';
import type { Category } from '../api/categories';
import type { ApiError } from '../api/client';

interface TransactionModalProps {
  open: boolean;
  transaction?: Transaction | null;
  categories: Category[];
  onSave: (data: CreateTransactionRequest) => Promise<void>;
  onClose: () => void;
}

const DEFAULT_FORM: CreateTransactionRequest = {
  amount: 0,
  description: '',
  type: 'EXPENSE',
  categoryId: 0,
  date: new Date().toISOString().slice(0, 16),
  currency: 'USD',
};

export default function TransactionModal({
  open,
  transaction,
  categories,
  onSave,
  onClose,
}: TransactionModalProps) {
  const [form, setForm] = useState<CreateTransactionRequest>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!transaction;
  const filteredCategories = categories.filter((c) => c.type === form.type);

  useEffect(() => {
    if (!open) return;

    if (transaction) {
      const matchedCat = categories.find((c) => c.name === transaction.categoryName);
      setForm({
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        categoryId: matchedCat?.id ?? 0,
        date: transaction.date.slice(0, 16),
        currency: transaction.currency ?? 'USD',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setError('');
  }, [open, transaction, categories]);

  function handleTypeChange(newType: 'INCOME' | 'EXPENSE') {
    setForm((f) => ({ ...f, type: newType, categoryId: 0 }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId) {
      setError('Please select a category.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSave(form);
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
        {isEditing ? 'Edit Transaction' : 'New Transaction'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <ToggleButtonGroup
            value={form.type}
            exclusive
            size="small"
            onChange={(_, v) => v && handleTypeChange(v)}
            sx={{ alignSelf: 'flex-start' }}
          >
            <ToggleButton
              value="EXPENSE"
              sx={{
                px: 2.5,
                '&.Mui-selected': {
                  bgcolor: 'error.light',
                  color: 'error.main',
                  '&:hover': { bgcolor: 'error.light' },
                },
              }}
            >
              Expense
            </ToggleButton>
            <ToggleButton
              value="INCOME"
              sx={{
                px: 2.5,
                '&.Mui-selected': {
                  bgcolor: 'success.light',
                  color: 'success.main',
                  '&:hover': { bgcolor: 'success.light' },
                },
              }}
            >
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
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              label="Date & Time"
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Currency"
              value={form.currency ?? 'USD'}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase().slice(0, 3) }))}
              sx={{ width: 100 }}
              inputProps={{ maxLength: 3 }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
