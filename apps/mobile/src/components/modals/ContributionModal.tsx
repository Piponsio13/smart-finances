import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import FormModal from '../FormModal';
import Field from '../Field';
import DateField from '../DateField';
import { concrete } from '../../theme/palette';
import { mono } from '../../theme/typography';
import type { SavingsGoal, AddContributionRequest } from '../../api/savings';
import type { ApiError } from '../../api/client';

interface ContributionModalProps {
  open: boolean;
  goal: SavingsGoal | null;
  onAdd: (data: AddContributionRequest) => Promise<void>;
  onClose: () => void;
}

export default function ContributionModal({ open, goal, onAdd, onClose }: ContributionModalProps) {
  const [amountText, setAmountText] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAmountText('');
      setAmount(0);
      setDate(new Date());
      setNote('');
      setError('');
    }
  }, [open]);

  async function handleSubmit() {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onAdd({ amount, date: date.toISOString().slice(0, 10), note: note || undefined });
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
      title="Add Contribution"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Add Contribution"
      loading={loading}
      error={error}
    >
      {goal ? <Text style={styles.goalName}>{goal.name}</Text> : null}

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

      <DateField label="Date" value={date} onChange={setDate} />

      <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="e.g. Bonus" />
    </FormModal>
  );
}

const styles = StyleSheet.create({
  goalName: {
    fontFamily: mono,
    fontSize: 12,
    color: concrete.aggregate,
    marginTop: -8,
  },
});
