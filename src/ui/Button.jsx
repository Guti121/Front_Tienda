import { ActivityIndicator, Pressable, View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

// variant: primary | secondary | ghost | danger
// size: sm | md | lg
export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = true,
  left,
  right,
  style,
}) {
  const { colors, radii, spacing } = useTheme();
  const isDisabled = disabled || loading;

  const pad = {
    sm: { v: spacing.sm, h: spacing.md, font: "small" },
    md: { v: spacing.md, h: spacing.lg, font: "body" },
    lg: { v: spacing.lg, h: spacing.xl, font: "subtitle" },
  }[size];

  const bg = {
    primary: colors.primary,
    secondary: colors.surfaceAlt,
    ghost: "transparent",
    danger: colors.danger,
  }[variant];

  const fg = {
    primary: colors.textOnBrand,
    secondary: colors.text,
    ghost: colors.primary,
    danger: colors.textOnBrand,
  }[variant];

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sm,
          paddingVertical: pad.v,
          paddingHorizontal: pad.h,
          borderRadius: radii.md,
          backgroundColor: bg,
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor: colors.border,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <>
          {left ? <View>{left}</View> : null}
          <Text variant={pad.font} weight="bold" color={fg}>
            {title}
          </Text>
          {right ? <View>{right}</View> : null}
        </>
      )}
    </Pressable>
  );
}

export default Button;
