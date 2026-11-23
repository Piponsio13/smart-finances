import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brand, concrete } from '../theme/palette';

interface FabProps {
  onPress: () => void;
}

export default function Fab({ onPress }: FabProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Add new item" onPress={onPress} style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
      <Ionicons name="add" size={26} color={concrete.paper} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: brand.main,
    borderWidth: 1,
    borderColor: concrete.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
});
