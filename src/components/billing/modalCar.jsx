import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
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
  TextField,
  useToast,
} from "../../ui";
import { pesosFormat } from "../icons/functionFormat";

const first = (v) => (Array.isArray(v) ? v[0] : v);
const clampPct = (n) => Math.min(100, Math.max(0, n));

export default function ModalCar() {
  const toast = useToast();
  const { colors, spacing } = useTheme();
  const { items, count, setQty, remove, clear } = useCart();

  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [stockError, setStockError] = useState(null);

  // { [producto]: pct } — override manual de esa línea SOLO para esta venta.
  // Ausente = usa la promo del producto (item.descuentoPct); 0 explícito = la anula.
  const [overrides, setOverrides] = useState({});
  const [overrideFor, setOverrideFor] = useState(null); // item del carrito o null
  const [overrideTxt, setOverrideTxt] = useState("");
  const [descuentoGeneralTxt, setDescuentoGeneralTxt] = useState("");

  const pctDeLinea = (item) =>
    overrides[item.producto] !== undefined
      ? overrides[item.producto]
      : Number(item.descuentoPct || 0);

  const subtotalConDescuentosDeLinea = items.reduce((acc, it) => {
    const pct = pctDeLinea(it);
    return acc + it.cantidad * Number(it.valorPro || 0) * (1 - pct / 100);
  }, 0);

  const descuentoGeneralPct = clampPct(parseFloat(descuentoGeneralTxt) || 0);
  const totalPreview = Math.round(
    subtotalConDescuentosDeLinea * (1 - descuentoGeneralPct / 100),
  );

  const openOverrideSheet = (item) => {
    setOverrideFor(item);
    const current = overrides[item.producto];
    setOverrideTxt(current !== undefined ? String(current) : "");
  };

  const aplicarOverride = () => {
    const pct = overrideTxt === "" ? NaN : parseFloat(overrideTxt);
    setOverrides((prev) => {
      const next = { ...prev };
      if (Number.isNaN(pct)) {
        delete next[overrideFor.producto];
      } else {
        next[overrideFor.producto] = clampPct(pct);
      }
      return next;
    });
    setOverrideFor(null);
  };

  const quitarDescuentoDeLinea = () => {
    setOverrides((prev) => ({ ...prev, [overrideFor.producto]: 0 }));
    setOverrideFor(null);
  };

  const usarPromoDelProducto = () => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[overrideFor.producto];
      return next;
    });
    setOverrideFor(null);
  };

  const facturar = async () => {
    setSending(true);
    setStockError(null);
    try {
      const detalles = items.map((it) => {
        const d = { producto: it.producto, cantidad: it.cantidad };
        if (overrides[it.producto] !== undefined) {
          d.descuento_porcentaje = overrides[it.producto];
        }
        return d;
      });
      const data = await createInvoice(
        detalles,
        descuentoGeneralPct || undefined,
      );
      await clear();
      setOverrides({});
      setDescuentoGeneralTxt("");
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

  const renderItem = ({ item }) => {
    const promoPct = Number(item.descuentoPct || 0);
    const overridePct = overrides[item.producto];
    const pctEfectivo = pctDeLinea(item);
    const precioEfectivo = Number(item.valorPro || 0) * (1 - pctEfectivo / 100);

    let etiquetaDescuento = "Agregar descuento";
    if (overridePct !== undefined)
      etiquetaDescuento = "Descuento de esta venta";
    else if (promoPct > 0) etiquetaDescuento = "Promo del producto";

    return (
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
              }}
            >
              <Text variant="small" muted>
                {pesosFormat(item.valorPro)} c/u
              </Text>
              {pctEfectivo > 0 ? (
                <Badge label={`-${pctEfectivo}%`} tone="danger" />
              ) : null}
            </View>
            <Text weight="bold" color="primary">
              {pesosFormat(precioEfectivo * item.cantidad)}
            </Text>
            <Pressable
              onPress={() => openOverrideSheet(item)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 2,
              }}
            >
              <Icon name="percent-outline" size={16} color={colors.primary} />
              <Text variant="caption" color="primary">
                {etiquetaDescuento}
              </Text>
            </Pressable>
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
  };

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

          <View style={{ marginTop: spacing.sm }}>
            <TextField
              label="Descuento general (%)"
              value={descuentoGeneralTxt}
              onChangeText={(t) =>
                setDescuentoGeneralTxt(t.replace(/[^0-9.]/g, ""))
              }
              placeholder="Opcional"
              keyboardType="numeric"
            />
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
              {pesosFormat(totalPreview)}
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
        visible={!!overrideFor}
        onClose={() => setOverrideFor(null)}
        title={`Descuento · ${overrideFor?.nombrePro ?? ""}`}
      >
        {overrideFor ? (
          <>
            {Number(overrideFor.descuentoPct || 0) > 0 ? (
              <Text muted>
                Este producto trae una promo de{" "}
                {Number(overrideFor.descuentoPct)}% — podés reemplazarla solo
                para esta venta.
              </Text>
            ) : null}
            <TextField
              label="% de descuento para esta línea"
              value={overrideTxt}
              onChangeText={(t) => setOverrideTxt(t.replace(/[^0-9.]/g, ""))}
              placeholder="Ej. 15"
              keyboardType="numeric"
            />
            <Button title="Aplicar" onPress={aplicarOverride} />
            <Button
              title="Quitar descuento de esta línea"
              variant="secondary"
              onPress={quitarDescuentoDeLinea}
            />
            {overrides[overrideFor.producto] !== undefined ? (
              <Button
                title="Usar la promo del producto"
                variant="ghost"
                onPress={usarPromoDelProducto}
              />
            ) : null}
          </>
        ) : null}
      </Sheet>

      <Sheet
        visible={confirming}
        onClose={() => setConfirming(false)}
        title="Confirmar facturación"
      >
        <Text muted>
          Se generará una factura por {count} producto(s) por un total de{" "}
          {pesosFormat(totalPreview)}.
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
