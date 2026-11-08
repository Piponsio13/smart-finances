import { useEffect, useState } from 'react';
import FormModal from '../FormModal';
import Field from '../Field';
import SelectField from '../SelectField';
import SegmentedControl from '../SegmentedControl';
import DateField from '../DateField';
import { transactionsApi, type Transaction, type CreateTransactionRequest } from '../../api/transactions';
import type { Category } from '../../api/categories';
import type { ApiError } from '../../api/client';

interface TransactionModalProps {
  open: boolean;
  transaction?: Transaction | null;
  categories: Category[];
  onSave: (data: CreateTransactionRequest) => Promise<void>;
  onClose: () => void;
}

function defaultForm(): CreateTransactionRequest {
  return {
    amount: 0,
    description: '',
    type: 'EXPENSE',
    categoryId: 0,
    date: new Date().toISOString(),
    currency: 'USD',
  };
}

export default function TransactionModal({ open, transaction, categories, onSave, onClose }: TransactionModalProps) {
  const [form, setForm] = useState<CreateTransactionRequest>(defaultForm());
  const [amountText, setAmountText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Once the user picks a category by hand we stop auto-filling it.
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

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
        date: transaction.date,
        currency: transaction.currency ?? 'USD',
      });
      setAmountText(String(transaction.amount));
      setCategoryTouched(true);
    } else {
      setForm(defaultForm());
      setAmountText('');
      setCategoryTouched(false);
    }
    setAutoFilled(false);
    setError('');
  }, [open, transaction, categories]);

  // Suggest a category from the description as the user types (unless they picked one).
  useEffect(() => {
    if (!open || categoryTouched) return;
    const description = form.description.trim();
    if (description.length < 3) return;

    const timer = setTimeout(async () => {
      try {
        const suggestion = await transactionsApi.suggestCategory(description, form.type);
        if (categoryTouched || suggestion.categoryId == null) return;
        const match = categories.find((c) => c.id === suggestion.categoryId && c.type === form.type);
        if (match) {
          setForm((f) => ({ ...f, categoryId: match.id }));
          setAutoFilled(true);
        }
      } catch {
        // Suggestion is best-effort; leave the field for the user on failure.
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [open, categoryTouched, form.description, form.type, categories]);

  function handleTypeChange(newType: 'INCOME' | 'EXPENSE') {
    setForm((f) => ({ ...f, type: newType, categoryId: 0 }));
    setCategoryTouched(false);
    setAutoFilled(false);
  }

  async function handleSubmit() {
    if (!form.categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!form.description.trim()) {
      setError('Please enter a description.');
      return;
    }
    if (!form.amount || form.amount <= 0) {
      setError('Please enter a valid amount.');
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
    <FormModal
      visible={open}
      title={isEditing ? 'Edit Transaction' : 'New Transaction'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Save Changes' : 'Add Transaction'}
      loading={loading}
      error={error}
    >
      <SegmentedControl
        options={[
          { value: 'EXPENSE', label: 'Expense' },
          { value: 'INCOME', label: 'Income' },
        ]}
        value={form.type}
        onChange={handleTypeChange}
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
        placeholder="e.g. Groceries"
      />

      <SelectField
        label={autoFilled ? 'Category · auto-filled' : 'Category'}
        value={form.categoryId || null}
        options={filteredCategories.map((c) => ({ value: c.id, label: c.name }))}
        onChange={(v) => {
          setCategoryTouched(true);
          setAutoFilled(false);
          setForm((f) => ({ ...f, categoryId: Number(v) }));
        }}
      />

      <DateField
        label="Date & Time"
        mode="datetime"
        value={new Date(form.date)}
        onChange={(date) => setForm((f) => ({ ...f, date: date.toISOString() }))}
      />

      <Field
        label="Currency"
        value={form.currency ?? 'USD'}
        onChangeText={(text) => setForm((f) => ({ ...f, currency: text.toUpperCase().slice(0, 3) }))}
        autoCapitalize="characters"
        maxLength={3}
      />
    </FormModal>
  );
}
