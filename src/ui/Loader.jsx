import { ActivityIndicator, View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

export function Loader({ label, fill = true, style }) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={[
        {
          flex: fill ? 1 : undefined,
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sm,
          padding: spacing.xl,
        },
        style,
      ]}
    >
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? (
        <Text variant="small" muted>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

export default Loader;
