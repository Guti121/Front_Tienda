import { useState } from "react";
import { FlatList, View } from "react-native";
import { router } from "expo-router";

import { createInvoice } from "../../api/billing";
import { useCart } from "../../hooks/useCart";
import { ApiError } from "../../api/http";
import { useTheme } from "../../theme/ThemeProvider";
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  Icon,
  Screen,
  Sheet,
  Stepper,
  Text,
  useToast,
} from "../../ui";
import { pesosFormat } from "../icons/functionFormat";

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default function ModalCar() {
  const toast = useToast();
  const { colors, spacing } = useTheme();
  const { items, count, total, setQty, remove, clear } = useCart();

  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [stockError, setStockError] = useState(null);

  const facturar = async () => {
    setSending(true);
    setStockError(null);
    try {
      const detalles = items.map((it) => ({
        producto: it.producto,
        cantidad: it.cantidad,
      }));
      const data = await createInvoice(detalles);
      await clear();
      setConfirming(false);
      if (data?.factura_id) {
        router.replace(
          `/billsGenerate/billsGenerateDetailDrawer?value=${data.factura_id}`,
        );
      }
    } catch (err) {
      setConfirming(false);
      const f = err instanceof ApiError ? err.fields : null;
      if (f?.producto_nombre) {
        setStockError({
          nombre: first(f.producto_nombre),
          stock: first(f.stock),
        });
      }
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo facturar.",
      );
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => (
    <Card level={0} style={{ marginBottom: spacing.sm }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: spacing.md,
        }}
      >
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text weight="medium" numberOfLines={2}>
            {item.nombrePro}
          </Text>
          <Text variant="small" muted>
            {pesosFormat(item.valorPro)} c/u
          </Text>
          <Text weight="bold" color="primary">
            {pesosFormat(item.valorPro * item.cantidad)}
          </Text>
        </View>
        <View
          style={{ alignItems: "flex-end", justifyContent: "space-between" }}
        >
          <Icon
            name="trash-can-outline"
            size={20}
            color={colors.danger}
            onPress={() => remove(item.producto)}
          />
          <Stepper
            value={item.cantidad}
            onChange={(q) => setQty(item.producto, q)}
            size="sm"
          />
        </View>
      </View>
    </Card>
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.producto)}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.sm,
        }}
        ListEmptyComponent={
          <EmptyState
            icon="cart-outline"
            title="Carrito vacío"
            message="Agrega productos desde la pantalla de facturación."
          />
        }
        renderItem={renderItem}
      />

      {items.length > 0 ? (
        <Card
          level={2}
          style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        >
          {stockError ? (
            <View style={{ marginBottom: spacing.md, gap: spacing.xs }}>
              <Badge label="Stock insuficiente" tone="danger" />
              <Text variant="small" color="danger">
                {stockError.nombre} · disponible: {stockError.stock}
              </Text>
            </View>
          ) : null}

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text muted>Productos</Text>
            <Text weight="medium">{count}</Text>
          </View>
          <Divider />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: spacing.xs,
            }}
          >
            <Text weight="bold">Total</Text>
            <Text variant="title" weight="bold" color="primary">
              {pesosFormat(total)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: spacing.md,
              marginTop: spacing.md,
            }}
          >
            <Button
              title="Limpiar"
              variant="ghost"
              onPress={clear}
              style={{ flex: 1 }}
              left={<Icon name="broom" size={18} color={colors.primary} />}
            />
            <Button
              title="Facturar"
              onPress={() => setConfirming(true)}
              style={{ flex: 2 }}
              left={
                <Icon
                  name="file-document-outline"
                  size={18}
                  color={colors.textOnBrand}
                />
              }
            />
          </View>
        </Card>
      ) : null}

      <Sheet
        visible={confirming}
        onClose={() => setConfirming(false)}
        title="Confirmar facturación"
      >
        <Text muted>
          Se generará una factura por {count} producto(s) por un total de{" "}
          {pesosFormat(total)}.
        </Text>
        <Button
          title="Confirmar y facturar"
          onPress={facturar}
          loading={sending}
        />
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => setConfirming(false)}
        />
      </Sheet>
    </Screen>
  );
}
