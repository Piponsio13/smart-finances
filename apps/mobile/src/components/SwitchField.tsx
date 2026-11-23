import { StyleSheet, Switch, Text, View } from 'react-native';
import { concrete, moss } from '../theme/palette';
import { headingFont } from '../theme/typography';

interface SwitchFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function SwitchField({ label, value, onChange }: SwitchFieldProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: concrete.stone, true: moss.light }}
        thumbColor={value ? moss.main : concrete.aggregate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: headingFont, fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0,
    color: concrete.void,
  },
});
