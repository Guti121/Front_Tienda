import { View } from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";

import { useTheme } from "../../src/theme/ThemeProvider";
import {
  Screen,
  Text,
  Card,
  Badge,
  ListItem,
  Divider,
  useToast,
} from "../../src/ui";
import { handleLogout } from "../../src/components/sesion/axiosRequest";
import { NAV } from "./_layout";

const ROLE_LABEL = {
  creator: "Propietario",
  admin: "Administrador",
  worker: "Colaborador",
  cliente: "Cliente",
};

export default function More() {
  const user = useSelector((state) => state.user.user);
  const { spacing } = useTheme();
  const toast = useToast();
  const role = user?.typeUser;

  // Pantallas secundarias (no `primary`) permitidas para el rol.
  const items = Object.entries(NAV)
    .filter(([, cfg]) => !cfg.primary && role && cfg.roles.includes(role))
    .map(([name, cfg]) => ({ name, ...cfg }));

  const onLogout = async () => {
    try {
      await handleLogout(); // limpia sesión y redirige a /login
    } catch {
      toast.error("No se pudo cerrar sesión.");
    }
  };

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Card level={1}>
          <Text variant="subtitle" weight="bold">
            {user?.username || "Usuario"}
          </Text>
          {user?.email ? (
            <Text variant="small" muted>
              {user.email}
            </Text>
          ) : null}
          <View style={{ marginTop: spacing.sm }}>
            <Badge label={ROLE_LABEL[role] || "Sin rol"} tone="brand" />
          </View>
        </Card>

        {items.length > 0 ? (
          <Card level={0} padded={false}>
            {items.map((it, i) => (
              <View key={it.name}>
                {i > 0 ? <Divider /> : null}
                <ListItem
                  icon={it.icon}
                  title={it.title}
                  onPress={() => router.push(`/drawer/${it.name}`)}
                />
              </View>
            ))}
          </Card>
        ) : null}

        <Card level={0} padded={false}>
          <ListItem
            icon="logout"
            title="Cerrar sesión"
            danger
            onPress={onLogout}
          />
        </Card>
      </View>
    </Screen>
  );
}
