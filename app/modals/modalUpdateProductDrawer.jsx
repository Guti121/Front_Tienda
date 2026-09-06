import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { updateStock } from "../../src/api/products";
import { useTheme } from "../../src/theme/ThemeProvider";
import {
  Badge,
  Button,
  Card,
  Screen,
  Sheet,
  Stepper,
  Text,
  useToast,
} from "../../src/ui";

// Ajuste de stock desde el detalle del producto. `event` = "agg" | "decreased".
export default function ModalUpdateProductDrawer() {
  const { product, event } = useLocalSearchParams();
  const parsed = JSON.parse(product || "{}");
  const isAdd = event === "agg";

  const { spacing } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();

  const actuales = parseInt(parsed.unidades_disponibles, 10) || 0;
  const [cantidad, setCantidad] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const max = isAdd ? undefined : actuales;
  const nuevoTotal = isAdd ? actuales + cantidad : actuales - cantidad;

  const guardar = async () => {
    setSaving(true);
    try {
      await updateStock(parsed.id, nuevoTotal);
      await queryClient.invalidateQueries({ queryKey: ["product"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(
        isAdd
          ? `+${cantidad} unidad(es). Stock: ${nuevoTotal}`
          : `-${cantidad} unidad(es). Stock: ${nuevoTotal}`,
      );
      setConfirming(false);
      router.back();
    } catch (err) {
      setConfirming(false);
      toast.error(err?.message || "No se pudo actualizar el stock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={{ gap: spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            variant="title"
            weight="bold"
            style={{ flex: 1 }}
            numberOfLines={2}
          >
            {parsed.nombre}
          </Text>
          <Badge
            label={isAdd ? "Ingreso" : "Retiro"}
            tone={isAdd ? "success" : "danger"}
          />
        </View>

        <Card level={1}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text muted>Stock actual</Text>
            <Text weight="bold">{actuales}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: spacing.md,
            }}
          >
            <Text muted>
              {isAdd ? "Unidades a ingresar" : "Unidades a retirar"}
            </Text>
            <Stepper value={cantidad} onChange={setCantidad} max={max} />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: spacing.md,
            }}
          >
            <Text weight="bold">Nuevo stock</Text>
            <Text
              variant="title"
              weight="bold"
              color={isAdd ? "success" : "danger"}
            >
              {nuevoTotal}
            </Text>
          </View>
        </Card>

        <Button
          title={isAdd ? "Ingresar unidades" : "Retirar unidades"}
          variant={isAdd ? "primary" : "danger"}
          onPress={() => setConfirming(true)}
        />
      </View>

      <Sheet
        visible={confirming}
        onClose={() => setConfirming(false)}
        title="Confirmar ajuste"
      >
        <Text muted>
          {isAdd ? "Ingresar" : "Retirar"} {cantidad} unidad(es). El stock
          pasará de {actuales} a {nuevoTotal}.
        </Text>
        <Button title="Confirmar" onPress={guardar} loading={saving} />
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => setConfirming(false)}
        />
      </Sheet>
    </Screen>
  );
}
