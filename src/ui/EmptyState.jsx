import { View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";
import { Button } from "./Button";
import { Icon } from "./Icon";

export function EmptyState({
  icon = "inbox-outline",
  title,
  message,
  actionLabel,
  onAction,
  style,
}) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sm,
          padding: spacing.xl,
        },
        style,
      ]}
    >
      <Icon name={icon} size={44} color={colors.textFaint} />
      {title ? (
        <Text variant="subtitle" weight="bold" center>
          {title}
        </Text>
      ) : null}
      {message ? (
        <Text variant="small" muted center>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="sm"
          fullWidth={false}
          style={{ marginTop: spacing.sm }}
        />
      ) : null}
    </View>
  );
}

export default EmptyState;
