import { Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../theme/ThemeProvider";

// Wrapper sobre @expo/vector-icons (viene con Expo). Set: MaterialCommunityIcons.
// Nombres: https://icons.expo.fyi/Index/MaterialCommunityIcons
export function Icon({
  name = "circle-outline",
  size = 22,
  color,
  onPress,
  style,
  hitSlop = 8,
}) {
  const { colors } = useTheme();
  const glyph = (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color || colors.text}
      style={onPress ? undefined : style}
    />
  );
  if (!onPress) return glyph;
  return (
    <Pressable onPress={onPress} hitSlop={hitSlop} style={style}>
      {glyph}
    </Pressable>
  );
}

export default Icon;
