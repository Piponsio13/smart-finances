import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions, type ViewStyle } from 'react-native';
import { concrete } from '../theme/palette';
import { mono, monoBold } from '../theme/typography';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  helperText?: string;
  maxLength?: number;
  style?: ViewStyle;
  rightAccessory?: ReactNode;
}

export default function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  helperText,
  maxLength,
  style,
  rightAccessory,
}: FieldProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, rightAccessory ? styles.inputWithAccessory : null]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={concrete.aggregate}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
        />
        {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
      </View>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontFamily: monoBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: concrete.aggregate,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: concrete.void,
    backgroundColor: concrete.paper,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: concrete.void,
    fontFamily: mono,
  },
  inputWithAccessory: {
    paddingRight: 4,
  },
  accessory: {
    paddingHorizontal: 10,
  },
  helper: {
    fontFamily: mono,
    fontSize: 10,
    color: concrete.aggregate,
  },
});
