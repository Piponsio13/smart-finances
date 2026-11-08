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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import type { CreateCategoryRequest } from '../api/categories';
import type { ApiError } from '../api/client';

interface CategoryModalProps {
  open: boolean;
  onSave: (data: CreateCategoryRequest) => Promise<void>;
  onClose: () => void;
}

export default function CategoryModal({ open, onSave, onClose }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setType('EXPENSE');
      setError('');
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave({ categoryName: name.trim(), type });
      onClose();
    } catch (err) {
      setError((err as ApiError).message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>New Category</DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <ToggleButtonGroup
            value={type}
            exclusive
            size="small"
            onChange={(_, v) => v && setType(v)}
            sx={{ alignSelf: 'flex-start' }}
          >
            <ToggleButton
              value="EXPENSE"
              sx={{
                px: 2.5,
                '&.Mui-selected': { bgcolor: 'error.light', color: 'error.main' },
              }}
            >
              Expense
            </ToggleButton>
            <ToggleButton
              value="INCOME"
              sx={{
                px: 2.5,
                '&.Mui-selected': { bgcolor: 'success.light', color: 'success.main' },
              }}
            >
              Income
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoFocus
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Creating...' : 'Create Category'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
