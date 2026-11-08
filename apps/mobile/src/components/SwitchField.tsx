import { StyleSheet, Switch, Text, View } from 'react-native';
import { concrete, moss } from '../theme/palette';
import { monoBold } from '../theme/typography';

interface SwitchFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function SwitchField({ label, value, onChange }: SwitchFieldProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
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
    fontFamily: monoBold,
    fontSize: 11,
    letterSpacing: 1,
    color: concrete.void,
  },
});
