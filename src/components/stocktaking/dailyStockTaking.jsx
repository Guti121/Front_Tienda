import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getDailyReport, getMonthlySummary } from "../../api/inventory";
import { useTheme } from "../../theme/ThemeProvider";
import { Button, Card, Divider, Icon, Loader, Screen, Text } from "../../ui";
import { pesosFormat } from "../icons/functionFormat";
import { MonthPickerModal } from "../themeStyles/modalsCalendar";

const now = new Date();

function SummaryRow({ label, value }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
      }}
    >
      <Text muted variant="small">
        {label}
      </Text>
      <Text weight="medium" variant="small">
        {value}
      </Text>
    </View>
  );
}

export default function DailyStockTaking() {
  const { colors, spacing } = useTheme();
  const [period, setPeriod] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const [pickerVisible, setPickerVisible] = useState(false);

  const { month, year } = period;

  const daily = useInfiniteQuery({
    queryKey: ["inventory", "daily", month, year],
    queryFn: ({ pageParam }) =>
      getDailyReport({ month, year, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last?.next ? pages.length + 1 : undefined,
  });

  const summaryQ = useQuery({
    queryKey: ["inventory", "summary", month, year],
    queryFn: () => getMonthlySummary({ month, year }),
  });
  const resumen = summaryQ.data?.resumen;

  const rows = useMemo(
    () => (daily.data?.pages ?? []).flatMap((p) => p?.results ?? []),
    [daily.data],
  );

  const netas =
    resumen &&
    Number(resumen.total_ventas || 0) -
      Number(resumen.valor_al_por_mayor || 0) -
      Number(resumen.costos_fijos_cubiertos || 0);

  const header = (
    <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
      <Card level={1}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text weight="bold">Inventario de facturación</Text>
            <Text muted variant="small">
              {String(month).padStart(2, "0")}/{year}
            </Text>
          </View>
          <Button
            title="Periodo"
            variant="secondary"
            fullWidth={false}
            left={
              <Icon
                name="calendar-month-outline"
                size={18}
                color={colors.text}
              />
            }
            onPress={() => setPickerVisible(true)}
          />
        </View>
      </Card>

      <Card level={0}>
        <Text weight="bold" style={{ marginBottom: spacing.xs }}>
          Resumen del mes
        </Text>
        {summaryQ.isLoading ? (
          <Loader fill={false} />
        ) : summaryQ.isError ? (
          <Text color="danger" variant="small">
            No se pudo cargar el resumen.
          </Text>
        ) : (
          <>
            <SummaryRow
              label="Productos vendidos"
              value={String(resumen?.productos_vendidos ?? 0)}
            />
            <SummaryRow
              label="Total ventas"
              value={pesosFormat(resumen?.total_ventas)}
            />
            <SummaryRow
              label="Valor al por mayor"
              value={pesosFormat(resumen?.valor_al_por_mayor)}
            />
            <SummaryRow
              label="Costos fijos cubiertos"
              value={pesosFormat(resumen?.costos_fijos_cubiertos)}
            />
            <Divider />
            <SummaryRow
              label="Ganancias netas"
              value={pesosFormat(netas || 0)}
            />
          </>
        )}
      </Card>
    </View>
  );

  return (
    <Screen padded={false}>
      {daily.isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.fecha)}
          contentContainerStyle={{ padding: spacing.lg }}
          ListHeaderComponent={header}
          onEndReached={() => daily.hasNextPage && daily.fetchNextPage()}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            daily.isFetchingNextPage ? <Loader fill={false} /> : null
          }
          ListEmptyComponent={
            <Text muted center style={{ paddingVertical: spacing.xl }}>
              No hay datos para este periodo.
            </Text>
          }
          renderItem={({ item }) => (
            <Card level={0} style={{ marginBottom: spacing.sm }}>
              <Text
                weight="bold"
                color="primary"
                style={{ marginBottom: spacing.xs }}
              >
                {item.fecha}
              </Text>
              <SummaryRow
                label="Facturas"
                value={String(item.facturas_total)}
              />
              <SummaryRow
                label="Productos vendidos"
                value={String(item.productos_vendidos)}
              />
              <SummaryRow
                label="Subtotal del día"
                value={pesosFormat(item.total_subtotal)}
              />
            </Card>
          )}
        />
      )}

      <MonthPickerModal
        visible={pickerVisible}
        onClose={(sel) => {
          setPickerVisible(false);
          if (sel) setPeriod({ month: sel.month, year: sel.year });
        }}
      />
    </Screen>
  );
}
