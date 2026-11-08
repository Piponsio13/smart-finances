import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';
import type { SavingsGoal, CreateSavingsGoalRequest, UpdateSavingsGoalRequest } from '../api/savings';
import type { ApiError } from '../api/client';

interface SavingsModalProps {
  open: boolean;
  goal?: SavingsGoal | null;
  onCreate: (data: CreateSavingsGoalRequest) => Promise<void>;
  onUpdate: (data: UpdateSavingsGoalRequest) => Promise<void>;
  onClose: () => void;
}

export default function SavingsModal({ open, goal, onCreate, onUpdate, onClose }: SavingsModalProps) {
  const isEditing = !!goal;

  const [form, setForm] = useState({ name: '', targetAmount: 0, targetDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (goal) {
      setForm({ name: goal.name, targetAmount: goal.targetAmount, targetDate: goal.targetDate ?? '' });
    } else {
      setForm({ name: '', targetAmount: 0, targetDate: '' });
    }
    setError('');
  }, [open, goal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = {
      name: form.name,
      targetAmount: form.targetAmount,
      targetDate: form.targetDate || undefined,
    };
    try {
      if (isEditing) {
        await onUpdate(payload);
      } else {
        await onCreate(payload);
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
      <DialogTitle sx={{ fontWeight: 600 }}>{isEditing ? 'Edit Goal' : 'New Savings Goal'}</DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Goal Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            fullWidth
          />

          <TextField
            label="Target Amount ($)"
            type="number"
            inputProps={{ min: 0.01, step: 0.01 }}
            value={form.targetAmount || ''}
            onChange={(e) => setForm((f) => ({ ...f, targetAmount: parseFloat(e.target.value) || 0 }))}
            required
            fullWidth
          />

          <TextField
            label="Target Date (optional)"
            type="date"
            value={form.targetDate}
            onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Goal'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
