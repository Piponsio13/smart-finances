import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { concrete, oxide } from '../theme/palette';
import { monoBold } from '../theme/typography';

type Variant = 'primary' | 'outline' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function Button({ label, onPress, variant = 'primary', disabled, loading, style }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? concrete.paper : concrete.void} size="small" />
      ) : (
        <Text style={[styles.label, labelColorStyles[variant]]}>{label.toUpperCase()}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    borderColor: concrete.void,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: monoBold,
    fontSize: 12,
    letterSpacing: 1.5,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: concrete.void },
  outline: { backgroundColor: 'transparent' },
  danger: { backgroundColor: oxide.light, borderColor: oxide.main },
};

const labelColorStyles: Record<Variant, { color: string }> = {
  primary: { color: concrete.paper },
  outline: { color: concrete.void },
  danger: { color: oxide.main },
};
