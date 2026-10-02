import { useState } from "react";
import { Pressable, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  abrirCaja,
  cerrarCaja,
  crearMovimientoCaja,
  getCajaActual,
  getCajaResumen,
} from "../../api/caja";
import { ApiError } from "../../api/http";
import { paymentMethodLabel } from "../../constants/payments";
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
  TextField,
  useToast,
} from "../../ui";
import { pesosFormat } from "../icons/functionFormat";

function Row({ label, value, strong = false, muted = false, color }) {
  const { spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: spacing.xxs,
      }}
    >
      <Text muted={muted}>{label}</Text>
      <Text weight={strong ? "bold" : "regular"} color={color}>
        {value}
      </Text>
    </View>
  );
}

export default function Caja() {
  const { colors, spacing, radii } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: actual, isLoading: loadingActual } = useQuery({
    queryKey: ["caja", "actual"],
    queryFn: getCajaActual,
  });
  const hayAbierta = !!actual;

  const { data: resumen, isLoading: loadingResumen } = useQuery({
    queryKey: ["caja", "resumen"],
    queryFn: getCajaResumen,
    enabled: hayAbierta,
  });

  // --- abrir caja ---
  const [montoApertura, setMontoApertura] = useState("");
  const abrir = useMutation({
    mutationFn: () => abrirCaja(montoApertura || "0"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caja"] });
      setMontoApertura("");
      toast.success("Caja abierta");
    },
    onError: (err) =>
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo abrir la caja.",
      ),
  });

  // --- movimiento ---
  const [movSheet, setMovSheet] = useState(false);
  const [movTipo, setMovTipo] = useState("ingreso");
  const [movMonto, setMovMonto] = useState("");
  const [movMotivo, setMovMotivo] = useState("");
  const movimiento = useMutation({
    mutationFn: () => crearMovimientoCaja(movTipo, movMonto, movMotivo.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caja", "resumen"] });
      setMovSheet(false);
      setMovMonto("");
      setMovMotivo("");
      toast.success(
        movTipo === "ingreso" ? "Ingreso registrado" : "Retiro registrado",
      );
    },
    onError: (err) =>
      toast.error(
        err instanceof ApiError
          ? err.message
          : "No se pudo registrar el movimiento.",
      ),
  });

  // --- cerrar caja ---
  const [cerrarSheet, setCerrarSheet] = useState(false);
  const [montoDeclarado, setMontoDeclarado] = useState("");
  const [notaCierre, setNotaCierre] = useState("");
  const [resultadoCierre, setResultadoCierre] = useState(null);
  const cerrar = useMutation({
    mutationFn: () => cerrarCaja(montoDeclarado, notaCierre.trim()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["caja"] });
      setCerrarSheet(false);
      setMontoDeclarado("");
      setNotaCierre("");
      setResultadoCierre(data);
      toast.success("Caja cerrada");
    },
    onError: (err) =>
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo cerrar la caja.",
      ),
  });

  if (loadingActual) return <Loader label="Cargando…" />;

  if (resultadoCierre) {
    const dif = Number(resultadoCierre.caja.diferencia);
    return (
      <Screen scroll>
        <View style={{ gap: spacing.lg }}>
          <Text variant="title" weight="bold">
            Caja cerrada
          </Text>
          <Card level={1} style={{ gap: spacing.sm }}>
            <Row
              label="Esperado"
              value={pesosFormat(resultadoCierre.caja.monto_cierre_esperado)}
            />
            <Row
              label="Contaste"
              value={pesosFormat(resultadoCierre.caja.monto_cierre_declarado)}
            />
            <Divider />
            <Row
              label="Diferencia"
              value={`${dif > 0 ? "+" : ""}${pesosFormat(dif)}`}
              strong
              color={dif === 0 ? "success" : dif > 0 ? "primary" : "danger"}
            />
          </Card>
          <Button title="Entendido" onPress={() => setResultadoCierre(null)} />
        </View>
      </Screen>
    );
  }

  if (!hayAbierta) {
    return (
      <Screen scroll>
        <View style={{ gap: spacing.lg }}>
          <Text variant="title" weight="bold">
            Caja
          </Text>
          <Text muted>
            No hay una caja abierta. Abrí una para empezar a facturar.
          </Text>
          <Card level={1} style={{ gap: spacing.md }}>
            <TextField
              label="Monto de apertura"
              value={montoApertura}
              onChangeText={(t) => setMontoApertura(t.replace(/[^0-9]/g, ""))}
              placeholder="0"
              keyboardType="numeric"
            />
            <Button
              title="Abrir caja"
              onPress={() => abrir.mutate()}
              loading={abrir.isPending}
            />
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <View>
          <Text variant="title" weight="bold">
            Caja abierta
          </Text>
          <Text variant="small" muted>
            Desde {new Date(actual.abierta_en).toLocaleString("es-CO")} ·{" "}
            {actual.abierta_por}
          </Text>
        </View>

        {loadingResumen || !resumen ? (
          <Loader fill={false} />
        ) : (
          <Card level={1} style={{ gap: spacing.sm }}>
            <Row label="Apertura" value={pesosFormat(resumen.monto_apertura)} />
            <Row
              label="Ventas en efectivo"
              value={pesosFormat(resumen.ventas_efectivo)}
            />
            {Object.entries(resumen.ventas_otros_metodos || {}).map(
              ([metodo, total]) => (
                <Row
                  key={metodo}
                  label={`Ventas · ${paymentMethodLabel(metodo)}`}
                  value={pesosFormat(total)}
                  muted
                />
              ),
            )}
            <Row
              label="Ingresos manuales"
              value={pesosFormat(resumen.ingresos)}
            />
            <Row
              label="Retiros manuales"
              value={`- ${pesosFormat(resumen.retiros)}`}
            />
            <Divider />
            <Row
              label="Esperado en caja"
              value={pesosFormat(resumen.esperado_en_caja)}
              strong
              color="primary"
            />
            <Text variant="caption" muted>
              {resumen.numero_de_facturas} factura(s) en este turno
            </Text>
          </Card>
        )}

        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Button
            title="Movimiento"
            variant="secondary"
            style={{ flex: 1 }}
            left={<Icon name="cash-plus" size={18} color={colors.text} />}
            onPress={() => setMovSheet(true)}
          />
          <Button
            title="Cerrar caja"
            variant="danger"
            style={{ flex: 1 }}
            onPress={() => setCerrarSheet(true)}
          />
        </View>
      </View>

      <Sheet
        visible={movSheet}
        onClose={() => setMovSheet(false)}
        title="Registrar movimiento"
      >
        <View
          style={{
            flexDirection: "row",
            gap: spacing.xs,
            backgroundColor: colors.surfaceAlt,
            borderRadius: radii.md,
            padding: spacing.xxs,
          }}
        >
          {[
            ["ingreso", "Ingreso"],
            ["retiro", "Retiro"],
          ].map(([key, label]) => {
            const active = movTipo === key;
            return (
              <Pressable
                key={key}
                onPress={() => setMovTipo(key)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  borderRadius: radii.sm,
                  alignItems: "center",
                  backgroundColor: active ? colors.surface : "transparent",
                }}
              >
                <Text
                  weight={active ? "bold" : "regular"}
                  color={active ? "text" : "textMuted"}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextField
          label="Monto"
          value={movMonto}
          onChangeText={(t) => setMovMonto(t.replace(/[^0-9]/g, ""))}
          placeholder="0"
          keyboardType="numeric"
        />
        <TextField
          label="Motivo"
          value={movMotivo}
          onChangeText={setMovMotivo}
          placeholder={
            movTipo === "ingreso" ? "Ej. Vuelto inicial" : "Ej. Compra de insumos"
          }
        />
        <Button
          title={movTipo === "ingreso" ? "Registrar ingreso" : "Registrar retiro"}
          onPress={() => movimiento.mutate()}
          loading={movimiento.isPending}
          disabled={!movMonto || !movMotivo.trim()}
        />
      </Sheet>

      <Sheet
        visible={cerrarSheet}
        onClose={() => setCerrarSheet(false)}
        title="Cerrar caja"
      >
        <Text muted>
          Contá el efectivo físico y escribí el monto. Vas a ver la diferencia
          contra lo esperado.
        </Text>
        <TextField
          label="Monto contado"
          value={montoDeclarado}
          onChangeText={(t) => setMontoDeclarado(t.replace(/[^0-9]/g, ""))}
          placeholder="0"
          keyboardType="numeric"
        />
        <TextField
          label="Nota (opcional)"
          value={notaCierre}
          onChangeText={setNotaCierre}
          placeholder="Ej. Faltaron $5.000, se descontó del empleado"
        />
        <Button
          title="Confirmar cierre"
          variant="danger"
          onPress={() => cerrar.mutate()}
          loading={cerrar.isPending}
          disabled={!montoDeclarado}
        />
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => setCerrarSheet(false)}
        />
      </Sheet>
    </Screen>
  );
}
