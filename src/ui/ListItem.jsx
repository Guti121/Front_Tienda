import { Pressable, View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";
import { Icon } from "./Icon";

// Fila pulsable: icono + título (+ subtítulo) + chevron/acción a la derecha.
export function ListItem({
  icon,
  iconColor,
  title,
  subtitle,
  right,
  onPress,
  danger = false,
  style,
}) {
  const { colors, spacing, radii } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          borderRadius: radii.md,
          backgroundColor: pressed ? colors.surfaceAlt : "transparent",
        },
        style,
      ]}
    >
      {icon ? (
        <Icon
          name={icon}
          size={22}
          color={danger ? colors.danger : iconColor || colors.textMuted}
        />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text weight="medium" color={danger ? "danger" : "text"}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" muted>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ??
        (onPress ? (
          <Icon name="chevron-right" size={20} color={colors.textFaint} />
        ) : null)}
    </Pressable>
  );
}

export default ListItem;
