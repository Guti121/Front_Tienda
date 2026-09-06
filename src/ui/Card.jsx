import { View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";

// level: 0 (plano, solo borde) | 1 | 2 | 3 (elevación)
export function Card({ children, level = 1, padded = true, style }) {
  const { colors, radii, spacing, shadow } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: level === 0 ? 1 : 0,
          borderColor: colors.border,
          padding: padded ? spacing.lg : 0,
        },
        level > 0 && shadow(level),
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default Card;
