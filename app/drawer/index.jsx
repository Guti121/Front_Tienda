import { useEffect } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";

import { useTheme } from "../../src/theme/ThemeProvider";
import { Screen, Text, Card, Badge, Icon } from "../../src/ui";
import { expiredGetToken } from "../../src/components/axios/generalAxiosRequest";

const ROLE_LABEL = {
  creator: "Propietario",
  admin: "Administrador",
  worker: "Colaborador",
  cliente: "Cliente",
};

// Accesos rápidos del home. `roles` filtra por tipo de usuario; `route` es la
// pantalla destino dentro de /drawer.
const ACTIONS = [
  {
    route: "billDrawer",
    label: "Facturar",
    icon: "cash-register",
    roles: ["creator", "admin", "worker"],
  },
  {
    route: "productsDrawer",
    label: "Productos",
    icon: "package-variant-closed",
    roles: ["creator", "admin"],
  },
  {
    route: "catalog",
    label: "Catálogo",
    icon: "storefront-outline",
    roles: ["creator", "admin", "worker"],
  },
  {
    route: "billsGenerateDrawer",
    label: "Ver facturas",
    icon: "file-document-outline",
    roles: ["creator", "admin"],
  },
  {
    route: "stocktaking",
    label: "Inventario",
    icon: "clipboard-list-outline",
    roles: ["creator"],
  },
  {
    route: "addProductsColletionDrawer",
    label: "Ingreso de producto",
    icon: "plus-box-outline",
    roles: ["creator"],
  },
  {
    route: "settingsStoreDrawer",
    label: "Mi tienda",
    icon: "cog-outline",
    roles: ["creator", "admin"],
  },
  {
    route: "addToCompanyDrawer",
    label: "QR aliado",
    icon: "qrcode-scan",
    roles: ["cliente"],
  },
  {
    route: "createCompanyDrawer",
    label: "Crear mi tienda",
    icon: "store-plus-outline",
    roles: ["cliente"],
  },
];

export default function Home() {
  const user = useSelector((state) => state.user.user);
  const { colors, spacing, radii } = useTheme();
  const role = user?.typeUser;

  useEffect(() => {
    // Chequeo ligero: si el token no se puede refrescar, expiredGetToken
    // redirige a /login por su cuenta.
    expiredGetToken();
  }, []);

  const actions = ACTIONS.filter((a) => a.roles.includes(role));

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Card level={1}>
          <Text variant="small" muted>
            Hola,
          </Text>
          <Text variant="title" weight="bold">
            {user?.username || "Usuario"}
          </Text>
          <View style={{ marginTop: spacing.sm }}>
            <Badge label={ROLE_LABEL[role] || "Sin rol"} tone="brand" />
          </View>
        </Card>

        <View>
          <Text
            variant="small"
            weight="bold"
            muted
            style={{ marginBottom: spacing.sm }}
          >
            ACCIONES
          </Text>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}
          >
            {actions.map((a) => (
              <Pressable
                key={a.route}
                onPress={() => router.push(`/drawer/${a.route}`)}
                style={({ pressed }) => ({
                  width: "47%",
                  flexGrow: 1,
                  backgroundColor: colors.surface,
                  borderRadius: radii.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing.lg,
                  gap: spacing.sm,
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: radii.md,
                    backgroundColor: colors.primarySoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={a.icon} size={22} color={colors.primary} />
                </View>
                <Text weight="medium">{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {actions.length === 0 ? (
          <Card level={0}>
            <Text muted center>
              No hay acciones disponibles para tu rol.
            </Text>
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}
