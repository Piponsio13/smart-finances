import { useEffect, useState } from 'react';
import FormModal from '../FormModal';
import Field from '../Field';
import SegmentedControl from '../SegmentedControl';
import type { CreateCategoryRequest } from '../../api/categories';
import type { ApiError } from '../../api/client';

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

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Please enter a category name.');
      return;
    }
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
    <FormModal
      visible={open}
      title="New Category"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={loading ? 'Creating…' : 'Create Category'}
      loading={loading}
      error={error}
    >
      <SegmentedControl
        options={[
          { value: 'EXPENSE', label: 'Expense' },
          { value: 'INCOME', label: 'Income' },
        ]}
        value={type}
        onChange={setType}
      />
      <Field label="Category Name" value={name} onChangeText={setName} placeholder="e.g. Groceries" />
    </FormModal>
  );
}
