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

  return (
    <RNText
      style={[
        {
          fontFamily:
            weight === "bold" ? typography.familyBold : typography.family,
          fontSize: typography.size[variant] ?? typography.size.body,
          lineHeight:
            typography.lineHeight[variant] ?? typography.lineHeight.body,
          fontWeight:
            typography.weight[weight] ??
            (variant === "display" || variant === "title"
              ? typography.weight.bold
              : typography.weight.regular),
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
