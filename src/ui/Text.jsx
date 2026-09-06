import { Text as RNText } from "react-native";

import { useTheme } from "../theme/ThemeProvider";

// variant: display | title | subtitle | body | small | caption
// color: token de colors ("text" por defecto) o un hex
// weight: regular | medium | bold
export function Text({
  variant = "body",
  color = "text",
  weight,
  center,
  muted,
  style,
  ...rest
}) {
  const { colors, typography } = useTheme();
  const resolvedColor = muted ? colors.textMuted : colors[color] || color;

  const isHeading = variant === "display" || variant === "title";
  const w = weight || (isHeading ? "bold" : "regular");
  const family =
    w === "bold"
      ? typography.familyBold
      : w === "medium"
        ? typography.familyMedium
        : typography.family;

  return (
    <RNText
      style={[
        {
          // Con fuente por peso NO se fija fontWeight (evita doble bold / ignorado).
          fontFamily: family,
          fontSize: typography.size[variant] ?? typography.size.body,
          lineHeight:
            typography.lineHeight[variant] ?? typography.lineHeight.body,
          color: resolvedColor,
          textAlign: center ? "center" : undefined,
        },
        style,
      ]}
      {...rest}
    />
  );
}

export default Text;
