import { Pressable } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

// Pastilla seleccionable (colecciones del catálogo, filtros rápidos, etc.).
export function Chip({ label, selected = false, onPress, style }) {
  const { colors, radii, spacing } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected
            ? colors.primary
            : pressed
              ? colors.surfaceAlt
              : colors.surface,
        },
        style,
      ]}
    >
      <Text
        variant="small"
        weight={selected ? "bold" : "medium"}
        color={selected ? colors.textOnBrand : "textMuted"}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default Chip;
