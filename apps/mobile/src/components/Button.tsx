import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { brand, concrete, oxide, designTokens } from '../theme/palette';
import { headingFont } from '../theme/typography';

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
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
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
        <Text style={[styles.label, labelColorStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1, borderRadius: designTokens.radii.control,
    minHeight: 48,
    borderColor: concrete.stone,
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
    fontFamily: headingFont, fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: brand.main },
  outline: { backgroundColor: 'transparent' },
  danger: { backgroundColor: oxide.light, borderColor: oxide.main },
};

const labelColorStyles: Record<Variant, { color: string }> = {
  primary: { color: concrete.paper },
  outline: { color: concrete.void },
  danger: { color: oxide.main },
};
