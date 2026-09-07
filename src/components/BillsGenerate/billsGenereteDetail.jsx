import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Print from "expo-print";

import { retrieveInvoice, deleteInvoice } from "../../api/billing";
import { ApiError } from "../../api/http";
import { isWeb } from "../token/localstorage";
import { useTheme } from "../../theme/ThemeProvider";
import {
  Button,
  Card,
  Divider,
  Icon,
  Loader,
  Screen,
  Sheet,
  Text,
  useToast,
} from "../../ui";
import { pesosFormat } from "../icons/functionFormat";

function facturaHtml(f, id) {
  const rows = (f.detalles ?? [])
    .map(
      (it, i) =>
        `<tr><td>${i + 1}</td><td>${it.nombre_producto}</td><td>${it.cantidad}</td>` +
        `<td>${pesosFormat(it.valor_und)}</td><td>${it.subtotal_cop}</td></tr>`,
    )
    .join("");
  return `<html><body style="font-family:Arial,sans-serif">
    <h2 style="text-align:center;text-transform:uppercase">${f.tienda_nombre ?? ""}</h2>
    <h3 style="text-align:center">Factura #${id}</h3>
    <p style="text-align:center">Vendedor: ${f.creado_por_full_name ?? ""}</p>
    <table border="1" style="width:100%;border-collapse:collapse">
      <thead><tr><th>#</th><th>Producto</th><th>Cantidad</th><th>Valor unitario</th><th>Subtotal</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <h3 style="text-align:right">Total: ${f.total_cop ?? ""}</h3>
  </body></html>`;
}

export function BillGenerateDetail({ id }) {
  const { colors, spacing } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => retrieveInvoice(id),
    enabled: !!id,
  });

  const del = useMutation({
    mutationFn: () => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setConfirmDelete(false);
      toast.success("Factura eliminada y stock repuesto");
      setTimeout(() => router.back(), 500);
    },
    onError: (err) => {
      setConfirmDelete(false);
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo eliminar.",
      );
    },
  });

  const imprimir = async () => {
    const html = facturaHtml(data, id);
    if (isWeb) {
      const w = window.open("", "_blank");
      if (!w) return toast.error("No se pudo abrir la ventana de impresión.");
      w.document.write(html);
      w.document.close();
      w.focus();
      w.print();
    } else {
      await Print.printAsync({ html });
    }
  };

  if (isLoading) return <Loader label="Cargando factura…" />;
  if (isError || !data) {
    return (
      <Screen>
        <Text color="danger" center>
          No se encontró la factura #{id}.
        </Text>
      </Screen>
    );
  }

  const d = data.fecha ? new Date(data.fecha) : null;

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Card level={1}>
          <Text variant="title" weight="bold">
            Factura #{id}
          </Text>
          <Text muted style={{ textTransform: "uppercase" }}>
            {data.tienda_nombre}
          </Text>
          <Text variant="small" muted>
            {data.creado_por_full_name}
          </Text>
          {d ? (
            <Text variant="small" muted>
              {d.toISOString().split("T")[0]} · {d.toTimeString().split(" ")[0]}
            </Text>
          ) : null}
        </Card>

        <Card level={0} padded={false}>
          {(data.detalles ?? []).map((it, i) => (
            <View key={it.id ?? i}>
              {i > 0 ? <Divider /> : null}
              <View style={{ padding: spacing.md, gap: spacing.xxs }}>
                <Text weight="medium">{it.nombre_producto}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text variant="small" muted>
                    {it.cantidad} × {pesosFormat(it.valor_und)}
                  </Text>
                  <Text variant="small" weight="bold">
                    {it.subtotal_cop}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>

        <Card level={1}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text weight="bold">Total pagado</Text>
            <Text variant="title" weight="bold" color="primary">
              {data.total_cop}
            </Text>
          </View>
        </Card>

        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Button
            title="Eliminar"
            variant="danger"
            style={{ flex: 1 }}
            left={
              <Icon
                name="trash-can-outline"
                size={18}
                color={colors.textOnBrand}
              />
            }
            onPress={() => setConfirmDelete(true)}
          />
          <Button
            title="Imprimir / compartir"
            style={{ flex: 2 }}
            left={
              <Icon
                name="printer-outline"
                size={18}
                color={colors.textOnBrand}
              />
            }
            onPress={imprimir}
          />
        </View>
      </View>

      <Sheet
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Eliminar factura"
      >
        <Text muted>
          Se eliminará la factura #{id} y el stock de sus productos se repondrá
          automáticamente. Úsalo para devoluciones.
        </Text>
        <Button
          title="Sí, eliminar"
          variant="danger"
          loading={del.isPending}
          onPress={() => del.mutate()}
        />
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => setConfirmDelete(false)}
        />
      </Sheet>
    </Screen>
  );
}

export default BillGenerateDetail;
