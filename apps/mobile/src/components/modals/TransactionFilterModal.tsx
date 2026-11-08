import { useEffect, useState } from 'react';
import FormModal from '../FormModal';
import Field from '../Field';
import SelectField from '../SelectField';
import SegmentedControl from '../SegmentedControl';
import DateField from '../DateField';
import Button from '../Button';
import type { TransactionFilters } from '../../api/transactions';
import type { Category } from '../../api/categories';

interface TransactionFilterModalProps {
  open: boolean;
  filters: TransactionFilters;
  categories: Category[];
  onApply: (filters: TransactionFilters) => void;
  onClose: () => void;
}

export default function TransactionFilterModal({ open, filters, categories, onApply, onClose }: TransactionFilterModalProps) {
  const [local, setLocal] = useState<TransactionFilters>(filters);

  useEffect(() => {
    if (open) setLocal(filters);
  }, [open, filters]);

  function apply() {
    onApply(local);
    onClose();
  }

  function clear() {
    setLocal({});
    onApply({});
    onClose();
  }

  return (
    <FormModal
      visible={open}
      title="Filter Transactions"
      onClose={onClose}
      onSubmit={apply}
      submitLabel="Apply Filters"
    >
      <SegmentedControl
        options={[
          { value: '', label: 'All' },
          { value: 'EXPENSE', label: 'Expense' },
          { value: 'INCOME', label: 'Income' },
        ]}
        value={local.type ?? ''}
        onChange={(v) => setLocal((f) => ({ ...f, type: (v || undefined) as TransactionFilters['type'] }))}
      />

      <SelectField
        label="Category"
        value={local.categoryId ?? null}
        options={[{ value: 0, label: 'All Categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
        onChange={(v) => setLocal((f) => ({ ...f, categoryId: Number(v) || undefined }))}
        placeholder="All Categories"
      />

      <DateField
        label="From"
        value={local.dateFrom ? new Date(local.dateFrom) : new Date()}
        onChange={(date) => setLocal((f) => ({ ...f, dateFrom: date.toISOString().slice(0, 10) }))}
      />

      <DateField
        label="To"
        value={local.dateTo ? new Date(local.dateTo) : new Date()}
        onChange={(date) => setLocal((f) => ({ ...f, dateTo: date.toISOString().slice(0, 10) }))}
      />

      <Field
        label="Search"
        value={local.description ?? ''}
        onChangeText={(text) => setLocal((f) => ({ ...f, description: text || undefined }))}
        placeholder="Description…"
      />

      <Button label="Clear All Filters" variant="outline" onPress={clear} />
    </FormModal>
  );
}
