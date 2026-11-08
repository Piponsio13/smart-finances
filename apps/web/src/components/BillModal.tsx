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
  FormControlLabel,
  Switch,
} from '@mui/material';
import type { Bill, CreateBillRequest, UpdateBillRequest } from '../api/bills';
import type { Category } from '../api/categories';
import type { ApiError } from '../api/client';

interface BillModalProps {
  open: boolean;
  bill?: Bill | null;
  categories: Category[];
  onCreate: (data: CreateBillRequest) => Promise<void>;
  onUpdate: (data: UpdateBillRequest) => Promise<void>;
  onClose: () => void;
}

export default function BillModal({ open, bill, categories, onCreate, onUpdate, onClose }: BillModalProps) {
  const isEditing = !!bill;

  const [form, setForm] = useState({ name: '', amount: 0, dueDay: 1, categoryId: 0, active: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  useEffect(() => {
    if (!open) return;
    if (bill) {
      setForm({ name: bill.name, amount: bill.amount, dueDay: bill.dueDay, categoryId: bill.categoryId ?? 0, active: bill.active });
    } else {
      setForm({ name: '', amount: 0, dueDay: 1, categoryId: 0, active: true });
    }
    setError('');
  }, [open, bill]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        await onUpdate({ name: form.name, amount: form.amount, dueDay: form.dueDay, active: form.active });
      } else {
        await onCreate({ name: form.name, amount: form.amount, dueDay: form.dueDay, categoryId: form.categoryId || undefined });
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
      <DialogTitle sx={{ fontWeight: 600 }}>{isEditing ? 'Edit Bill' : 'New Bill Reminder'}</DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Bill Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            fullWidth
          />

          <TextField
            label="Amount ($)"
            type="number"
            inputProps={{ min: 0.01, step: 0.01 }}
            value={form.amount || ''}
            onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
            required
            fullWidth
          />

          <TextField
            label="Due Day of Month"
            type="number"
            inputProps={{ min: 1, max: 31 }}
            value={form.dueDay}
            onChange={(e) => setForm((f) => ({ ...f, dueDay: Number(e.target.value) }))}
            required
            fullWidth
          />

          {!isEditing && (
            <TextField
              select
              label="Category (optional)"
              value={form.categoryId || ''}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))}
              fullWidth
            >
              <MenuItem value="">None</MenuItem>
              {expenseCategories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
          )}

          {isEditing && (
            <FormControlLabel
              control={<Switch checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />}
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
