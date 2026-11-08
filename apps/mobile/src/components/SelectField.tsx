import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { concrete } from '../theme/palette';
import { mono, monoBold } from '../theme/typography';

export interface SelectOption {
  value: number | string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: number | string | null;
  options: SelectOption[];
  onChange: (value: number | string) => void;
  placeholder?: string;
}

export default function SelectField({ label, value, options, onChange, placeholder = 'Select…' }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.value : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>{label.toUpperCase()}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              style={styles.list}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={<Text style={styles.empty}>No options available</Text>}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionLabel, item.value === value && styles.optionLabelSelected]}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
            <Pressable style={styles.cancel} onPress={() => setOpen(false)}>
              <Text style={styles.cancelLabel}>CANCEL</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontFamily: monoBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: concrete.aggregate,
  },
  trigger: {
    borderWidth: 2,
    borderColor: concrete.void,
    backgroundColor: concrete.paper,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  value: { fontFamily: mono, fontSize: 15, color: concrete.void },
  placeholder: { fontFamily: mono, fontSize: 15, color: concrete.aggregate },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,25,24,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: concrete.paper,
    borderTopWidth: 3,
    borderColor: concrete.void,
    maxHeight: '70%',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sheetTitle: {
    fontFamily: monoBold,
    fontSize: 12,
    letterSpacing: 1.5,
    color: concrete.aggregate,
    marginBottom: 8,
  },
  list: { flexGrow: 0 },
  separator: { height: 1, backgroundColor: concrete.stone },
  option: { paddingVertical: 14 },
  optionLabel: { fontFamily: mono, fontSize: 15, color: concrete.void },
  optionLabelSelected: { fontFamily: monoBold },
  empty: { fontFamily: mono, fontSize: 13, color: concrete.aggregate, paddingVertical: 20 },
  cancel: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: concrete.void,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelLabel: { fontFamily: monoBold, fontSize: 12, letterSpacing: 1.5, color: concrete.void },
});
