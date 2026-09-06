import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../theme/ThemeProvider";

// Wrapper sobre @expo/vector-icons (viene con Expo, sin instalar nada).
// El set por defecto es MaterialCommunityIcons; ver nombres en:
// https://icons.expo.fyi/Index/MaterialCommunityIcons
export function Icon({ name = "circle-outline", size = 22, color, style }) {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color || colors.text}
      style={style}
    />
  );
}

export default Icon;
