import { useEffect, useState } from 'react';
import FormModal from '../FormModal';
import Field from '../Field';
import SelectField from '../SelectField';
import SwitchField from '../SwitchField';
import type { Bill, CreateBillRequest, UpdateBillRequest } from '../../api/bills';
import type { Category } from '../../api/categories';
import type { ApiError } from '../../api/client';

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

  const [name, setName] = useState('');
  const [amountText, setAmountText] = useState('');
  const [amount, setAmount] = useState(0);
  const [dueDayText, setDueDayText] = useState('1');
  const [categoryId, setCategoryId] = useState(0);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  useEffect(() => {
    if (!open) return;
    if (bill) {
      setName(bill.name);
      setAmount(bill.amount);
      setAmountText(String(bill.amount));
      setDueDayText(String(bill.dueDay));
      setCategoryId(bill.categoryId ?? 0);
      setActive(bill.active);
    } else {
      setName('');
      setAmount(0);
      setAmountText('');
      setDueDayText('1');
      setCategoryId(0);
      setActive(true);
    }
    setError('');
  }, [open, bill]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Please enter a bill name.');
      return;
    }
    const dueDay = Number(dueDayText) || 1;
    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        await onUpdate({ name, amount, dueDay, active });
      } else {
        await onCreate({ name, amount, dueDay, categoryId: categoryId || undefined });
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
      title={isEditing ? 'Edit Bill' : 'New Bill Reminder'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Save Changes' : 'Create'}
      loading={loading}
      error={error}
    >
      <Field label="Bill Name" value={name} onChangeText={setName} placeholder="e.g. Rent" />

      <Field
        label="Amount ($)"
        value={amountText}
        onChangeText={(text) => {
          setAmountText(text);
          setAmount(parseFloat(text) || 0);
        }}
        keyboardType="decimal-pad"
        placeholder="0.00"
      />

      <Field
        label="Due Day of Month"
        value={dueDayText}
        onChangeText={setDueDayText}
        keyboardType="number-pad"
        placeholder="1-31"
      />

      {!isEditing && (
        <SelectField
          label="Category (optional)"
          value={categoryId || null}
          options={expenseCategories.map((c) => ({ value: c.id, label: c.name }))}
          onChange={(v) => setCategoryId(Number(v))}
        />
      )}

      {isEditing && <SwitchField label="Active" value={active} onChange={setActive} />}
    </FormModal>
  );
}
