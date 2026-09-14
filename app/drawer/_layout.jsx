import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../../src/theme/ThemeProvider";

// Config de navegación. `primary` = aparece en la barra inferior; el resto vive
// dentro de la pestaña "Más". `roles` filtra por tipo de usuario.
export const NAV = {
  index: {
    title: "Inicio",
    icon: "home-variant-outline",
    roles: ["creator", "admin", "worker", "cliente"],
    primary: true,
  },
  billDrawer: {
    title: "Facturar",
    icon: "cash-register",
    roles: ["creator", "admin", "worker"],
    primary: true,
  },
  productsDrawer: {
    title: "Productos",
    icon: "package-variant-closed",
    roles: ["creator", "admin"],
    primary: true,
  },
  catalog: {
    title: "Catálogo",
    icon: "storefront-outline",
    roles: ["creator", "admin", "worker"],
    primary: true,
  },
  more: {
    title: "Más",
    icon: "dots-horizontal",
    roles: ["creator", "admin", "worker", "cliente"],
    primary: true,
  },
  // Secundarias: se abren desde "Más", no salen en la barra.
  addProductsColletionDrawer: {
    title: "Ingreso de producto",
    icon: "plus-box-outline",
    roles: ["creator"],
  },
  billsGenerateDrawer: {
    title: "Ver facturas",
    icon: "file-document-outline",
    roles: ["creator", "admin"],
  },
  stocktaking: {
    title: "Inventario",
    icon: "clipboard-list-outline",
    roles: ["creator"],
  },
  settingsStoreDrawer: {
    title: "Mi tienda",
    icon: "cog-outline",
    roles: ["creator", "admin"],
  },
  addToCompanyDrawer: {
    title: "QR aliado",
    icon: "qrcode-scan",
    roles: ["cliente"],
  },
  createCompanyDrawer: {
    title: "Crear mi tienda",
    icon: "store-plus-outline",
    roles: ["cliente"],
  },
};

export const allowedFor = (role) =>
  Object.entries(NAV)
    .filter(([, cfg]) => cfg.roles.includes(role))
    .map(([name, cfg]) => ({ name, ...cfg }));

export default function DrawerLayout() {
  const router = useRouter();
  const user = useSelector((state) => state.user.user);
  const { colors } = useTheme();
  const role = user?.typeUser;

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 58,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11 },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      {Object.entries(NAV).map(([name, cfg]) => {
        const visible = cfg.primary && role && cfg.roles.includes(role);
        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: cfg.title,
              href: visible ? undefined : null,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name={cfg.icon}
                  size={size ?? 22}
                  color={color}
                />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}
