import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { concrete, designTokens } from '../theme/palette';
import { bodyFont, headingFont } from '../theme/typography';

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
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.value : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>{label}</Text>
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
              <Text style={styles.cancelLabel}>Cancel</Text>
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
    fontFamily: headingFont, fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0,
    color: concrete.aggregate,
  },
  trigger: {
    borderWidth: 1, borderRadius: designTokens.radii.control,
    borderColor: concrete.stone,
    backgroundColor: concrete.paper,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  value: { fontFamily: bodyFont, fontSize: 15, color: concrete.void },
  placeholder: { fontFamily: bodyFont, fontSize: 15, color: concrete.aggregate },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,25,24,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: concrete.paper,
    borderTopWidth: 1, borderTopLeftRadius: designTokens.radii.dialog, borderTopRightRadius: designTokens.radii.dialog,
    borderColor: concrete.stone,
    maxHeight: '70%',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sheetTitle: {
    fontFamily: headingFont, fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0,
    color: concrete.aggregate,
    marginBottom: 8,
  },
  list: { flexGrow: 0 },
  separator: { height: 1, backgroundColor: concrete.stone },
  option: { paddingVertical: 14 },
  optionLabel: { fontFamily: bodyFont, fontSize: 15, color: concrete.void },
  optionLabelSelected: { fontFamily: headingFont, fontWeight: '600' },
  empty: { fontFamily: bodyFont, fontSize: 13, color: concrete.aggregate, paddingVertical: 20 },
  cancel: {
    marginTop: 12,
    borderWidth: 1, borderRadius: designTokens.radii.control,
    borderColor: concrete.stone,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelLabel: { fontFamily: headingFont, fontWeight: '600', fontSize: 12, letterSpacing: 0, color: concrete.void },
});
