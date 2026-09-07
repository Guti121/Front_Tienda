import { View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { getStockTotals } from "../../api/inventory";
import { useTheme } from "../../theme/ThemeProvider";
import { Button, Card, Divider, Icon, Loader, Screen, Text } from "../../ui";
import { pesosFormat } from "../icons/functionFormat";

function Row({ label, value }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
      }}
    >
      <Text muted>{label}</Text>
      <Text weight="bold">{value}</Text>
    </View>
  );
}

export default function StocktakingPage() {
  const { colors, spacing } = useTheme();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory", "stockTotals"],
    queryFn: getStockTotals,
  });

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Card level={1}>
          <Text variant="title" weight="bold">
            Inventario
          </Text>
          <Text muted style={{ marginTop: spacing.xs }}>
            Revisa el valor del stock activo y el inventario de facturación
            diaria o mensual.
          </Text>
        </Card>

        <Card level={1}>
          <Text weight="bold" style={{ marginBottom: spacing.sm }}>
            Stock activo
          </Text>
          {isLoading ? (
            <Loader fill={false} />
          ) : isError ? (
            <Text color="danger" variant="small">
              No se pudo cargar el valor del stock.
            </Text>
          ) : (
            <>
              <Row
                label="Total unidades"
                value={String(data?.total_unidades_disponibles ?? 0)}
              />
              <Divider />
              <Row
                label="Valor por mayor"
                value={pesosFormat(data?.total_precio_mayor)}
              />
              <Row
                label="Valor de venta"
                value={pesosFormat(data?.total_precio_venta)}
              />
              <Row
                label="Costos fijos"
                value={pesosFormat(data?.total_costos_fijos)}
              />
            </>
          )}
        </Card>

        <Button
          title="Ver inventario de facturación"
          left={
            <Icon
              name="file-chart-outline"
              size={18}
              color={colors.textOnBrand}
            />
          }
          onPress={() => router.push("/stockTaking/dailyStockTakingDrawer")}
        />
      </View>
    </Screen>
  );
}
