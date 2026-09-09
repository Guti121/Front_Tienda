import { useEffect, useState } from "react";
import { View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import { retrieveCosts, saveCosts, deleteCosts } from "../../api/store";
import { ApiError } from "../../api/http";
import { cleanNumber, formatToCOP, pesosFormat } from "../icons/functionFormat";
import { useTheme } from "../../theme/ThemeProvider";
import {
  Button,
  Card,
  Icon,
  Loader,
  Screen,
  Sheet,
  Text,
  TextField,
  useToast,
} from "../../ui";

export function CostsStore() {
  const { colors, spacing } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.user.user);
  const isCreator = user?.typeUser === "creator";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["costs"],
    queryFn: retrieveCosts,
    retry: false,
  });

  // El backend responde 404 cuando aún no hay configuración: en ese caso el
  // formulario arranca en modo edición para crearla.
  const notConfigured =
    isError && error instanceof ApiError && error.status === 404;

  const [costos, setCostos] = useState("");
  const [margen, setMargen] = useState("");
  const [promedio, setPromedio] = useState("");
  const [editable, setEditable] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (data) {
      setCostos(formatToCOP(String(data.costos_fijos ?? "")));
      // El margen es un %, se guarda con 1 decimal (30.0). En la UI se muestra
      // sin el decimal muerto: 30.0 -> "30", 12.5 -> "12.5".
      setMargen(
        data.margen_ganancia == null
          ? ""
          : String(Number(data.margen_ganancia)),
      );
      setPromedio(String(data.promedio_productos_vendidos ?? ""));
      setEditable(false);
    } else if (notConfigured) {
      setEditable(true);
    }
  }, [data, notConfigured]);

  const save = useMutation({
    mutationFn: () =>
      saveCosts({
        costos_fijos: cleanNumber(costos),
        margen_ganancia: margen,
        promedio_productos_vendidos: promedio,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costs"] });
      setEditable(false);
      toast.success("Costos actualizados");
    },
    onError: (err) =>
      toast.error(
        err instanceof ApiError ? err.message : "No se pudieron guardar.",
      ),
  });

  const del = useMutation({
    mutationFn: deleteCosts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costs"] });
      setConfirmDelete(false);
      toast.success("Configuración eliminada");
    },
    onError: (err) => {
      setConfirmDelete(false);
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo eliminar.",
      );
    },
  });

  // Vista previa en vivo: cuánto suma el costo fijo a cada unidad
  // (costos_fijos / promedio). Solo si ambos valores tienen sentido.
  const costosNum = cleanNumber(costos);
  const promedioNum = Number(promedio);
  const costoFijoUnidad =
    costosNum > 0 && promedioNum > 0
      ? Math.round(costosNum / promedioNum)
      : null;

  if (isLoading) return <Loader label="Cargando…" />;
  if (isError && !notConfigured) {
    return (
      <Screen>
        <Text color="danger" center>
          No se pudo cargar la configuración de costos.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Card level={0}>
          <Text weight="bold">Opcional</Text>
          <Text muted variant="small" style={{ marginTop: spacing.xs }}>
            Con el promedio de productos vendidos al mes, el % de ganancia y tus
            costos fijos, el sistema calcula un precio de venta sugerido.
          </Text>
          <Text
            color="danger"
            variant="small"
            weight="bold"
            style={{ marginTop: spacing.xs }}
          >
            No asignes valores al azar.
          </Text>
          <Text muted variant="small" style={{ marginTop: spacing.xs }}>
            Es una sola configuración por tienda. «Guardar» actualiza la que ya
            tienes; no hace falta borrarla para cambiar un valor.
          </Text>
        </Card>

        <Card level={0} style={{ gap: spacing.md }}>
          <TextField
            label="Costos fijos"
            value={costos}
            onChangeText={(t) => setCostos(formatToCOP(t))}
            editable={editable}
            keyboardType="numeric"
          />
          <TextField
            label="Margen de ganancia (%)"
            value={margen}
            onChangeText={setMargen}
            editable={editable}
            keyboardType="numeric"
          />
          <TextField
            label="Promedio de productos vendidos al mes"
            value={promedio}
            onChangeText={setPromedio}
            editable={editable}
            keyboardType="numeric"
          />
          {costoFijoUnidad != null ? (
            <Text muted variant="small">
              Costo fijo por unidad ≈ {pesosFormat(costoFijoUnidad)}
            </Text>
          ) : null}
        </Card>

        {isCreator ? (
          <View style={{ gap: spacing.md }}>
            {editable ? (
              <Button
                title="Guardar"
                loading={save.isPending}
                onPress={() => save.mutate()}
              />
            ) : (
              <Button
                title="Editar"
                variant="secondary"
                left={
                  <Icon name="pencil-outline" size={18} color={colors.text} />
                }
                onPress={() => setEditable(true)}
              />
            )}
            {data && !editable ? (
              <Button
                title="Eliminar configuración"
                variant="danger"
                left={
                  <Icon
                    name="trash-can-outline"
                    size={18}
                    color={colors.textOnBrand}
                  />
                }
                onPress={() => setConfirmDelete(true)}
              />
            ) : null}
          </View>
        ) : null}
      </View>

      <Sheet
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Eliminar configuración"
      >
        <Text muted>
          Se borrará la configuración de costos fijos. El precio sugerido dejará
          de calcularse hasta que la vuelvas a crear.
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

export default CostsStore;
