import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { concrete } from '../theme/palette';
import { mono, monoBold } from '../theme/typography';

interface DateFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'datetime';
}

export default function DateField({ label, value, onChange, mode = 'date' }: DateFieldProps) {
  const [open, setOpen] = useState(false);

  const displayText =
    mode === 'datetime'
      ? value.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
      : value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.value}>{displayText}</Text>
      </Pressable>

      {open && (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selected) => {
            setOpen(Platform.OS === 'ios');
            if (event.type === 'dismissed') {
              setOpen(false);
              return;
            }
            if (selected) onChange(selected);
            if (Platform.OS === 'android') setOpen(false);
          }}
        />
      )}
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
});
