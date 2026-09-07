import { View } from "react-native";
import { router } from "expo-router";

import { useTheme } from "../../src/theme/ThemeProvider";
import { Card, Divider, ListItem, Screen, Text } from "../../src/ui";

// El índice (0–5) se envía como `returnedValue` y el backend lo interpreta como
// el parámetro `order` del listado de productos.
const OPCIONES = [
  "Agotados primero",
  "Más unidades disponibles",
  "Menos unidades disponibles",
  "Más recientes",
  "Más antiguos",
  "Orden alfabético (A–Z)",
];

export default function ModalFilterProductIcon() {
  const { spacing } = useTheme();

  const aplicar = (index) => {
    router.replace({
      pathname: "/drawer/productsDrawer",
      params: { returnedValue: index },
    });
  };

  return (
    <Screen>
      <View style={{ gap: spacing.md }}>
        <Text muted variant="small">
          Ordena el listado de productos:
        </Text>
        <Card level={0} padded={false}>
          {OPCIONES.map((label, i) => (
            <View key={label}>
              {i > 0 ? <Divider /> : null}
              <ListItem title={label} onPress={() => aplicar(i)} />
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}
