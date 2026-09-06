import { useState } from "react";
import { TextInput, View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  left,
  right,
  style,
  inputStyle,
  ...rest
}) {
  const { colors, radii, spacing, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused
      ? colors.primary
      : colors.border;

  return (
    <View style={[{ gap: spacing.xs }, style]}>
      {label ? (
        <Text variant="small" weight="medium" muted>
          {label}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          borderWidth: 1,
          borderColor,
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
          minHeight: 46,
        }}
      >
        {left}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            {
              flex: 1,
              color: colors.text,
              fontSize: typography.size.body,
              fontFamily: typography.family,
              paddingVertical: spacing.sm,
            },
            inputStyle,
          ]}
          {...rest}
        />
        {right}
      </View>

      {error ? (
        <Text variant="caption" color="danger">
          {typeof error === "string" ? error : "Revisa este campo"}
        </Text>
      ) : helper ? (
        <Text variant="caption" muted>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

export default TextField;
