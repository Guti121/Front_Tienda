import { useState } from "react";
import { Image, Pressable, View } from "react-native";

import FormLogin from "../src/components/sesion/loginView";
import FormRegister from "../src/components/sesion/registerView";
import { useTheme } from "../src/theme/ThemeProvider";
import { Card, Screen, Text } from "../src/ui";

const TABS = [
  ["login", "Iniciar sesión"],
  ["register", "Crear cuenta"],
];

export default function Login() {
  const { colors, spacing, radii } = useTheme();
  const [tab, setTab] = useState("login");

  return (
    <Screen scroll>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          gap: spacing.xl,
          width: "100%",
          maxWidth: 420,
          alignSelf: "center",
        }}
      >
        <View style={{ alignItems: "center", gap: spacing.xs }}>
          <Image
            source={require("../assets/logo.png")}
            style={{ width: 64, height: 64, borderRadius: radii.lg }}
          />
          <Text variant="display" weight="bold">
            Mi Stock App
          </Text>
          <Text variant="small" muted>
            Gestiona tu tienda
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.surfaceAlt,
            borderRadius: radii.md,
            padding: 4,
          }}
        >
          {TABS.map(([key, label]) => {
            const active = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  borderRadius: radii.sm,
                  alignItems: "center",
                  backgroundColor: active ? colors.surface : "transparent",
                }}
              >
                <Text
                  variant="small"
                  weight={active ? "bold" : "regular"}
                  color={active ? "text" : "textMuted"}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Card level={1}>
          {tab === "login" ? <FormLogin /> : <FormRegister />}
        </Card>
      </View>
    </Screen>
  );
}
