import { View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";

export function Divider({ spacing: sp, style }) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: colors.border,
          marginVertical: sp ?? spacing.md,
        },
        style,
      ]}
    />
  );
}

export default Divider;
