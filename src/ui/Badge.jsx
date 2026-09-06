import { View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

// tone: neutral | success | warning | danger | info | brand
export function Badge({ label, tone = "neutral", style }) {
  const { colors, radii, spacing } = useTheme();

  const map = {
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
    success: { bg: colors.successSoft, fg: colors.success },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
    info: { bg: colors.infoSoft, fg: colors.info },
    brand: { bg: colors.primarySoft, fg: colors.primary },
  };
  const c = map[tone] || map.neutral;

  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          backgroundColor: c.bg,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xxs,
          borderRadius: radii.pill,
        },
        style,
      ]}
    >
      <Text variant="caption" weight="bold" color={c.fg}>
        {label}
      </Text>
    </View>
  );
}

export default Badge;
