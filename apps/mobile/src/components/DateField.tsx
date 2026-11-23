import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { concrete, designTokens } from '../theme/palette';
import { bodyFont, headingFont } from '../theme/typography';

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
      <Text style={styles.label}>{label}</Text>
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
});
