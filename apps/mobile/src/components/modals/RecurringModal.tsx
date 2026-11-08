import { useEffect, useState } from 'react';
import FormModal from '../FormModal';
import Field from '../Field';
import SelectField from '../SelectField';
import SegmentedControl from '../SegmentedControl';
import SwitchField from '../SwitchField';
import DateField from '../DateField';
import type {
  RecurringTransaction,
  CreateRecurringRequest,
  UpdateRecurringRequest,
  Frequency,
} from '../../api/recurring';
import type { Category } from '../../api/categories';
import type { ApiError } from '../../api/client';

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

function defaultForm() {
  return {
    amount: 0,
    description: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    categoryId: 0,
    frequency: 'MONTHLY' as Frequency,
    startDate: new Date().toISOString(),
    active: true,
  };
}

export default function RecurringModal({ open, recurring, categories, onCreate, onUpdate, onClose }: RecurringModalProps) {
  const isEditing = !!recurring;

  const [form, setForm] = useState(defaultForm());
  const [amountText, setAmountText] = useState('');
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
        startDate: recurring.startDate,
        active: recurring.active,
      });
      setAmountText(String(recurring.amount));
    } else {
      setForm(defaultForm());
      setAmountText('');
    }
    setError('');
  }, [open, recurring, categories]);

  async function handleSubmit() {
    if (!form.categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!form.description.trim()) {
      setError('Please enter a description.');
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
    <FormModal
      visible={open}
      title={isEditing ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Save Changes' : 'Create'}
      loading={loading}
      error={error}
    >
      <SegmentedControl
        options={[
          { value: 'EXPENSE', label: 'Expense' },
          { value: 'INCOME', label: 'Income' },
        ]}
        value={form.type}
        onChange={(v) => setForm((f) => ({ ...f, type: v, categoryId: 0 }))}
      />

      <Field
        label="Amount"
        value={amountText}
        onChangeText={(text) => {
          setAmountText(text);
          setForm((f) => ({ ...f, amount: parseFloat(text) || 0 }));
        }}
        keyboardType="decimal-pad"
        placeholder="0.00"
      />

      <Field
        label="Description"
        value={form.description}
        onChangeText={(text) => setForm((f) => ({ ...f, description: text }))}
      />

      <SelectField
        label="Category"
        value={form.categoryId || null}
        options={filteredCategories.map((c) => ({ value: c.id, label: c.name }))}
        onChange={(v) => setForm((f) => ({ ...f, categoryId: Number(v) }))}
      />

      <SelectField
        label="Frequency"
        value={form.frequency}
        options={FREQUENCIES}
        onChange={(v) => setForm((f) => ({ ...f, frequency: v as Frequency }))}
      />

      {!isEditing && (
        <DateField
          label="Start Date"
          value={new Date(form.startDate)}
          onChange={(date) => setForm((f) => ({ ...f, startDate: date.toISOString() }))}
        />
      )}

      {isEditing && (
        <SwitchField label="Active" value={form.active} onChange={(v) => setForm((f) => ({ ...f, active: v }))} />
      )}
    </FormModal>
  );
}
