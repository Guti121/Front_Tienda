import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

// Control de cantidad: [-] n [+]. `min` por defecto 1, `max` opcional.
export function Stepper({ value, onChange, min = 1, max, size = "md" }) {
  const { colors, radii, spacing } = useTheme();
  const dim = size === "sm" ? 32 : 40;

  const Box = ({ name, onPress, disabled }) => (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        width: dim,
        height: dim,
        borderRadius: radii.sm,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: pressed ? colors.surfaceAlt : "transparent",
        opacity: disabled ? 0.4 : 1,
      })}
    >
      <MaterialCommunityIcons name={name} size={20} color={colors.primary} />
    </Pressable>
  );

  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}
    >
      <Box
        name="minus"
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      />
      <Text
        variant="subtitle"
        weight="bold"
        style={{ minWidth: 28, textAlign: "center" }}
      >
        {value}
      </Text>
      <Box
        name="plus"
        onPress={() => onChange(max ? Math.min(max, value + 1) : value + 1)}
        disabled={max ? value >= max : false}
      />
    </View>
  );
}

export default Stepper;
