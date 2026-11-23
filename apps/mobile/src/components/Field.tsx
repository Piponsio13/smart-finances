import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable, type KeyboardTypeOptions, type ViewStyle } from 'react-native';
import { brand, concrete, designTokens } from '../theme/palette';
import { bodyFont, headingFont } from '../theme/typography';

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
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, focused && styles.focused]}>
        <TextInput
          accessibilityLabel={label}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, rightAccessory || secureTextEntry ? styles.inputWithAccessory : null]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={concrete.aggregate}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !visible}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
        />
        {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : secureTextEntry ? <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Hide password' : 'Show password'} hitSlop={8} onPress={() => setVisible(!visible)} style={styles.accessory}><Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={concrete.aggregate} /></Pressable> : null}
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
    fontFamily: headingFont, fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0,
    color: concrete.aggregate,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, borderRadius: designTokens.radii.control,
    borderColor: concrete.stone,
    backgroundColor: concrete.paper,
  },
  focused: { borderColor: brand.main },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 13,
    fontSize: 16,
    color: concrete.void,
    fontFamily: bodyFont,
  },
  inputWithAccessory: {
    paddingRight: 4,
  },
  accessory: {
    paddingHorizontal: 10,
  },
  helper: {
    fontFamily: bodyFont,
    fontSize: 12,
    color: concrete.aggregate,
  },
});
