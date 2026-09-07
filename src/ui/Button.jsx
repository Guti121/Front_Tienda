import { ActivityIndicator, Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

// ease-out fuerte para UI (los Easing de fábrica de Reanimated son débiles).
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

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
  const reduced = useReducedMotion();
  const isDisabled = disabled || loading;

  // Press feedback: escala 0.97 en 120ms (un botón tiene que responder al toque).
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const to = (v, ms) => {
    scale.value = reduced
      ? 1
      : withTiming(v, { duration: ms, easing: EASE_OUT });
  };

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
    <Animated.View
      style={[
        { alignSelf: fullWidth ? "stretch" : "flex-start" },
        style,
        pressStyle,
      ]}
    >
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        onPressIn={() => !isDisabled && to(0.97, 120)}
        onPressOut={() => to(1, 140)}
        disabled={isDisabled}
        style={({ pressed }) => ({
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
          opacity: isDisabled ? 0.5 : pressed ? 0.92 : 1,
        })}
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
    </Animated.View>
  );
}

export default Button;
