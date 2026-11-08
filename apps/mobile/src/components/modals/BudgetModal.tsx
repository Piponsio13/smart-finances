import { useEffect, useState } from 'react';
import FormModal from '../FormModal';
import Field from '../Field';
import SelectField from '../SelectField';
import type { Budget, CreateBudgetRequest, UpdateBudgetRequest } from '../../api/budgets';
import type { Category } from '../../api/categories';
import type { ApiError } from '../../api/client';

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

  const [categoryId, setCategoryId] = useState(0);
  const [limitText, setLimitText] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(String(currentDate.getFullYear()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  useEffect(() => {
    if (!open) return;
    if (isEditing && budget) {
      setCategoryId(0);
      setMonthlyLimit(budget.monthlyLimit);
      setLimitText(String(budget.monthlyLimit));
      setMonth(budget.month);
      setYear(String(budget.year));
    } else {
      setCategoryId(0);
      setMonthlyLimit(0);
      setLimitText('');
      setMonth(currentDate.getMonth() + 1);
      setYear(String(currentDate.getFullYear()));
    }
    setError('');
  }, [open, isEditing, budget]);

  async function handleSubmit() {
    if (!isEditing && !categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!monthlyLimit || monthlyLimit <= 0) {
      setError('Please enter a valid monthly limit.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEditing && onUpdate) {
        await onUpdate({ monthlyLimit });
      } else {
        await onSave({ categoryId, monthlyLimit, month, year: Number(year) || currentDate.getFullYear() });
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
      title={isEditing ? 'Edit Budget' : 'New Budget'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Save Changes' : 'Create Budget'}
      loading={loading}
      error={error}
    >
      {!isEditing && (
        <SelectField
          label="Category"
          value={categoryId || null}
          options={expenseCategories.map((c) => ({ value: c.id, label: c.name }))}
          onChange={(v) => setCategoryId(Number(v))}
        />
      )}

      <Field
        label="Monthly Limit ($)"
        value={limitText}
        onChangeText={(text) => {
          setLimitText(text);
          setMonthlyLimit(parseFloat(text) || 0);
        }}
        keyboardType="decimal-pad"
        placeholder="0.00"
      />

      {!isEditing && (
        <>
          <SelectField
            label="Month"
            value={month}
            options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
            onChange={(v) => setMonth(Number(v))}
          />
          <Field label="Year" value={year} onChangeText={setYear} keyboardType="number-pad" />
        </>
      )}
    </FormModal>
  );
}
