import { View } from "react-native";
import { router } from "expo-router";

import { useUserCAAuthRedirect } from "../../src/redux/viewsPermissions";
import { useTheme } from "../../src/theme/ThemeProvider";
import { Card, Divider, ListItem, Screen } from "../../src/ui";

const OPTIONS = [
  {
    icon: "account-multiple-plus-outline",
    title: "Colaboradores",
    subtitle: "Ver y agregar aliados a tu tienda",
    route: "/myStoreSettings/addUserCompanyDrawer",
  },
  {
    icon: "storefront-outline",
    title: "Detalles de mi tienda",
    subtitle: "Datos, contacto y logo",
    route: "/myStoreSettings/detailsMyStoreDrawer",
  },
  {
    icon: "cash-multiple",
    title: "Mis costos fijos",
    subtitle: "Base para el precio sugerido",
    route: "/myStoreSettings/costsMyStoreDrawer",
  },
];

export default function SettingsStoreDrawer() {
  useUserCAAuthRedirect();
  const { spacing } = useTheme();

  return (
    <Screen>
      <View style={{ gap: spacing.lg }}>
        <Card level={0} padded={false}>
          {OPTIONS.map((o, i) => (
            <View key={o.route}>
              {i > 0 ? <Divider /> : null}
              <ListItem
                icon={o.icon}
                title={o.title}
                subtitle={o.subtitle}
                onPress={() => router.push(o.route)}
              />
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}
