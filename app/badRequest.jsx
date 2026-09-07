import { View } from "react-native";
import { router } from "expo-router";

import { useTheme } from "../src/theme/ThemeProvider";
import { Button, Icon, Screen, Text } from "../src/ui";

export default function BadRequest() {
  const { colors, spacing } = useTheme();
  return (
    <Screen>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.lg,
        }}
      >
        <Icon name="alert-circle-outline" size={72} color={colors.danger} />
        <Text variant="title" weight="bold" center>
          Ocurrió un error
        </Text>
        <Text muted center>
          Es probable que esta vista no esté disponible para tu tipo de usuario.
        </Text>
        <Button
          title="Ir a inicio"
          fullWidth={false}
          onPress={() => router.replace("/drawer")}
        />
      </View>
    </Screen>
  );
}
