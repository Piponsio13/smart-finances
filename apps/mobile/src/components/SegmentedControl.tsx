import { Pressable, StyleSheet, Text, View } from 'react-native';
import { concrete, moss, oxide, designTokens } from '../theme/palette';
import { headingFont } from '../theme/typography';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

const ACCENT: Record<string, { main: string; light: string }> = {
  EXPENSE: oxide,
  INCOME: moss,
};

export default function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const selected = opt.value === value;
        const accent = ACCENT[opt.value];
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segment,
              selected && {
                backgroundColor: accent ? accent.light : concrete.stone,
                borderColor: concrete.stone,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                selected && { color: accent ? accent.main : concrete.void },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1, borderRadius: designTokens.radii.control,
    borderColor: concrete.stone,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  label: {
    fontFamily: headingFont, fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0,
    color: concrete.aggregate,
  },
});
