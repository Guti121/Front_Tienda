import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../theme/ThemeProvider";

// Contenedor base de pantalla: SafeArea + fondo del tema + padding + scroll opc.
export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ["top", "bottom"],
  contentStyle,
  style,
}) {
  const { colors, spacing } = useTheme();
  const pad = padded ? { padding: spacing.lg } : null;

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[{ flexGrow: 1 }, pad, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, pad, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: colors.bg }, style]}
    >
      {body}
    </SafeAreaView>
  );
}

export default Screen;
