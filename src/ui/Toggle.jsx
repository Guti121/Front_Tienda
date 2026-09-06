import { Pressable, View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

// Interruptor on/off. Opcionalmente con etiqueta a la izquierda.
export function Toggle({ value, onValueChange, label, disabled = false }) {
  const { colors, spacing } = useTheme();

  const track = (
    <Pressable
      onPress={disabled ? undefined : () => onValueChange(!value)}
      style={{
        width: 46,
        height: 28,
        borderRadius: 999,
        padding: 3,
        backgroundColor: value ? colors.primary : colors.borderStrong,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          backgroundColor: colors.surface,
          alignSelf: value ? "flex-end" : "flex-start",
        }}
      />
    </Pressable>
  );

  if (!label) return track;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
      }}
    >
      <Text>{label}</Text>
      {track}
    </View>
  );
}

export default Toggle;
