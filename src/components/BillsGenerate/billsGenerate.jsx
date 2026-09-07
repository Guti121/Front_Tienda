import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { listInvoices } from "../../api/billing";
import { ModalCalendar } from "../themeStyles/modalsCalendar";
import { useTheme } from "../../theme/ThemeProvider";
import { Card, EmptyState, Icon, Loader, Text, TextField } from "../../ui";
import { pesosFormat } from "../icons/functionFormat";

const today = () => new Date().toISOString().split("T")[0];

export default function BillsGenerate() {
  const { colors, spacing } = useTheme();
  const [date, setDate] = useState(today());
  const [numero, setNumero] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoices", date],
    queryFn: () => listInvoices({ date }),
  });

  const facturas = data?.facturas ?? [];

  const buscarPorNumero = () => {
    const n = parseInt(numero, 10);
    if (n > 0) {
      router.push(`/billsGenerate/billsGenerateDetailDrawer?value=${n}`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <TextField
          value={numero}
          onChangeText={(t) => setNumero(t.replace(/[^0-9]/g, ""))}
          placeholder="N.º de factura"
          keyboardType="numeric"
          returnKeyType="search"
          onSubmitEditing={buscarPorNumero}
          left={<Icon name="pound" size={18} color={colors.textMuted} />}
          right={
            <Icon
              name="magnify"
              size={22}
              color={colors.primary}
              onPress={buscarPorNumero}
            />
          }
        />

        <Card level={0}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text weight="bold">{date}</Text>
            <Icon
              name="calendar-month-outline"
              size={22}
              color={colors.primary}
              onPress={() => setCalendarOpen(true)}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: spacing.lg,
              marginTop: spacing.sm,
            }}
          >
            <View>
              <Text variant="caption" muted>
                Facturas
              </Text>
              <Text weight="bold">{data?.numero_de_facturas ?? 0}</Text>
            </View>
            <View>
              <Text variant="caption" muted>
                Productos
              </Text>
              <Text weight="bold">
                {data?.total_cantidad_de_procuctos ?? 0}
              </Text>
            </View>
            <View>
              <Text variant="caption" muted>
                Total
              </Text>
              <Text weight="bold" color="primary">
                {data?.total_facturas ?? pesosFormat(0)}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={facturas}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xl,
          }}
          ListEmptyComponent={
            <View style={{ paddingVertical: spacing.xxl }}>
              <EmptyState
                icon={
                  isError ? "alert-circle-outline" : "file-document-outline"
                }
                title={isError ? "No se pudo cargar" : "Sin facturas"}
                message={
                  isError
                    ? "Revisa tu conexión e inténtalo de nuevo."
                    : "No hay facturas en la fecha seleccionada."
                }
              />
            </View>
          }
          renderItem={({ item }) => {
            const d = new Date(item.fecha);
            return (
              <Pressable
                onPress={() =>
                  router.push(
                    `/billsGenerate/billsGenerateDetailDrawer?value=${item.id}`,
                  )
                }
                style={{ marginBottom: spacing.sm }}
              >
                <Card level={0}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ gap: 2 }}>
                      <Text weight="bold">Factura #{item.id}</Text>
                      <Text variant="small" muted>
                        {d.toISOString().split("T")[0]} ·{" "}
                        {d.toTimeString().split(" ")[0]}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.sm,
                      }}
                    >
                      <Text weight="bold" color="primary">
                        {item.total_cop}
                      </Text>
                      <Icon
                        name="chevron-right"
                        size={18}
                        color={colors.textFaint}
                      />
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />
      )}

      <ModalCalendar
        state={calendarOpen}
        onClose={(d) => {
          setCalendarOpen(false);
          if (d) setDate(d);
        }}
      />
    </View>
  );
}
