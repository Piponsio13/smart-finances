import { useEffect, useState } from 'react';
import FormModal from '../FormModal';
import Field from '../Field';
import DateField from '../DateField';
import SwitchField from '../SwitchField';
import type { SavingsGoal, CreateSavingsGoalRequest, UpdateSavingsGoalRequest } from '../../api/savings';
import type { ApiError } from '../../api/client';

interface SavingsModalProps {
  open: boolean;
  goal?: SavingsGoal | null;
  onCreate: (data: CreateSavingsGoalRequest) => Promise<void>;
  onUpdate: (data: UpdateSavingsGoalRequest) => Promise<void>;
  onClose: () => void;
}

export default function SavingsModal({ open, goal, onCreate, onUpdate, onClose }: SavingsModalProps) {
  const isEditing = !!goal;

  const [name, setName] = useState('');
  const [targetAmountText, setTargetAmountText] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [hasTargetDate, setHasTargetDate] = useState(false);
  const [targetDate, setTargetDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount);
      setTargetAmountText(String(goal.targetAmount));
      setHasTargetDate(!!goal.targetDate);
      setTargetDate(goal.targetDate ? new Date(goal.targetDate) : new Date());
    } else {
      setName('');
      setTargetAmount(0);
      setTargetAmountText('');
      setHasTargetDate(false);
      setTargetDate(new Date());
    }
    setError('');
  }, [open, goal]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Please enter a goal name.');
      return;
    }
    if (!targetAmount || targetAmount <= 0) {
      setError('Please enter a valid target amount.');
      return;
    }
    setLoading(true);
    setError('');
    const payload = {
      name,
      targetAmount,
      targetDate: hasTargetDate ? targetDate.toISOString().slice(0, 10) : undefined,
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
    <FormModal
      visible={open}
      title={isEditing ? 'Edit Goal' : 'New Savings Goal'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Save Changes' : 'Create Goal'}
      loading={loading}
      error={error}
    >
      <Field label="Goal Name" value={name} onChangeText={setName} placeholder="e.g. Emergency Fund" />

      <Field
        label="Target Amount ($)"
        value={targetAmountText}
        onChangeText={(text) => {
          setTargetAmountText(text);
          setTargetAmount(parseFloat(text) || 0);
        }}
        keyboardType="decimal-pad"
        placeholder="0.00"
      />

      <SwitchField label="Set target date (optional)" value={hasTargetDate} onChange={setHasTargetDate} />
      {hasTargetDate ? (
        <DateField label="Target Date" value={targetDate} onChange={setTargetDate} />
      ) : null}
    </FormModal>
  );
}
