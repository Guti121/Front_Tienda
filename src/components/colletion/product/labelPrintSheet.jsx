import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import {
  printLabels,
  DEFAULT_SIZE,
  MAX_COPIES,
  MAX_TOTAL,
  SIZE_OPTIONS,
} from "../../../features/products/barcodeLabels";
import { useTheme } from "../../../theme/ThemeProvider";
import { Button, Sheet, Stepper, Text, Toggle, useToast } from "../../../ui";

const clamp = (n) => Math.min(MAX_COPIES, Math.max(1, Math.floor(n) || 1));

/**
 * Hoja para imprimir etiquetas de uno o varios productos.
 * `items`: [{ id, nombre, valor, code, stock }]. Los que no tienen `code` se
 * omiten (avisando cuántos).
 */
export default function LabelPrintSheet({ visible, onClose, items = [] }) {
  const { spacing } = useTheme();
  const toast = useToast();

  const [size, setSize] = useState(DEFAULT_SIZE);
  const [showPrice, setShowPrice] = useState(true);
  const [perStock, setPerStock] = useState(true); // una etiqueta por unidad
  const [fixedCopies, setFixedCopies] = useState(1);
  const [printing, setPrinting] = useState(false);

  const multiple = items.length > 1;
  const printable = useMemo(() => items.filter((i) => i.code), [items]);
  const skipped = items.length - printable.length;

  // Con un solo producto: un stepper de copias que arranca en el stock.
  const single = items.length === 1 ? items[0] : null;
  const singleId = single?.id;
  const singleStock = single?.stock;
  useEffect(() => {
    if (visible && singleId != null) {
      setFixedCopies(clamp(Number(singleStock) || 1));
    }
  }, [visible, singleId, singleStock]);

  const copiesFor = (item) =>
    multiple && perStock ? clamp(Number(item.stock) || 1) : fixedCopies;

  const total = printable.reduce((n, i) => n + copiesFor(i), 0);

  const onPrint = async () => {
    setPrinting(true);
    try {
      await printLabels(
        printable.map((i) => ({
          nombre: i.nombre,
          valor: i.valor,
          code: i.code,
          copies: copiesFor(i),
        })),
        { size, showPrice },
      );
      onClose();
    } catch (err) {
      toast.error(err?.message || "No se pudieron generar las etiquetas.");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Imprimir etiquetas">
      <Text muted variant="small">
        Tamaño del sticker (ancho x alto en mm)
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {SIZE_OPTIONS.map((s) => (
          <Button
            key={s}
            title={s}
            fullWidth={false}
            variant={size === s ? "primary" : "secondary"}
            onPress={() => setSize(s)}
          />
        ))}
      </View>

      {multiple ? (
        <Toggle
          label="Una etiqueta por unidad en stock"
          value={perStock}
          onValueChange={setPerStock}
        />
      ) : null}
      {!multiple || !perStock ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text muted>{multiple ? "Copias de cada uno" : "Copias"}</Text>
          <Stepper
            value={fixedCopies}
            onChange={setFixedCopies}
            min={1}
            max={MAX_COPIES}
          />
        </View>
      ) : null}

      <Toggle
        label="Mostrar el precio"
        value={showPrice}
        onValueChange={setShowPrice}
      />

      <Text muted variant="small">
        {multiple
          ? `${printable.length} producto${printable.length === 1 ? "" : "s"}, ${total} etiqueta${total === 1 ? "" : "s"} en total.`
          : `${total} etiqueta${total === 1 ? "" : "s"}.`}
        {total > MAX_TOTAL ? ` El máximo por impresión es ${MAX_TOTAL}.` : ""}
      </Text>
      {skipped > 0 ? (
        <Text color="danger" variant="small">
          {skipped === 1
            ? "1 producto no tiene código de barras generado y se omitirá."
            : `${skipped} productos no tienen código de barras generado y se omitirán.`}
        </Text>
      ) : null}

      <Button
        title="Imprimir"
        loading={printing}
        disabled={printable.length === 0 || total > MAX_TOTAL}
        onPress={onPrint}
      />
    </Sheet>
  );
}
