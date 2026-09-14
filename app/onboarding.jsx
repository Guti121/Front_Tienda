import { View } from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";

import { useTheme } from "../src/theme/ThemeProvider";
import { Button, Card, Icon, Screen, Text } from "../src/ui";

// Se muestra una sola vez, justo después de registrarse (registerView.jsx
// hace auto-login y navega acá). Solo tiene sentido para un cliente sin
// tienda todavía; si alguien más llega acá por error, lo mandamos al Home.
export default function Onboarding() {
  const { colors, spacing } = useTheme();
  const user = useSelector((state) => state.user.user);

  if (user && user.typeUser !== "cliente") {
    router.replace("/drawer");
    return null;
  }

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
          <Text variant="display" weight="bold" center>
            ¡Bienvenido!
          </Text>
          <Text muted center>
            ¿Qué querés hacer?
          </Text>
        </View>

        <Card level={1} style={{ gap: spacing.sm }}>
          <Text weight="bold">Crear mi tienda</Text>
          <Text muted variant="small">
            Arrancá tu propio negocio: catálogo, facturación e inventario.
          </Text>
          <Button
            title="Crear mi tienda"
            left={
              <Icon
                name="store-plus-outline"
                size={18}
                color={colors.textOnBrand}
              />
            }
            onPress={() => router.push("/drawer/createCompanyDrawer")}
          />
        </Card>

        <Card level={0} style={{ gap: spacing.sm }}>
          <Text weight="bold">Unirme a una tienda</Text>
          <Text muted variant="small">
            Si el dueño de una tienda te compartió un código QR, escaneálo acá.
          </Text>
          <Button
            title="Unirme con un código QR"
            variant="secondary"
            left={<Icon name="qrcode-scan" size={18} color={colors.text} />}
            onPress={() => router.push("/drawer/addToCompanyDrawer")}
          />
        </Card>

        <Button
          title="Explorar primero"
          variant="ghost"
          onPress={() => router.replace("/drawer")}
        />
      </View>
    </Screen>
  );
}
