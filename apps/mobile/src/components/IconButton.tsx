import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { concrete } from '../theme/palette';

interface IconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  size?: number;
}

export default function IconButton({ name, onPress, color = concrete.aggregate, size = 18 }: IconButtonProps) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.button}>
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
