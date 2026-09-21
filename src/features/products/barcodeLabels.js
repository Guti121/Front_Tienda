// Impresión de etiquetas de código de barras: una página por etiqueta, con el
// tamaño real del sticker (@page), barras EAN-13 en vector y N copias.
// Web: abre el diálogo de impresión del navegador. Nativo: expo-print.
import * as Print from "expo-print";

import { pesosFormat } from "../../components/icons/functionFormat";
import { isWeb } from "../../components/token/localstorage";
import { ean13Svg, isValidEan13, TOTAL_MODULES } from "./ean13";

// Tamaños de sticker más comunes en tienda (térmica de etiquetas / rollo).
// `bar` = alto de las barras en mm; el resto del alto lo ocupan nombre, precio
// y dígitos. `name`/`price` en pt.
export const LABEL_SIZES = {
  "50x30": { w: 50, h: 30, name: 8, price: 9, bar: 12 },
  "40x25": { w: 40, h: 25, name: 7, price: 8, bar: 9.5 },
  "60x40": { w: 60, h: 40, name: 9, price: 10, bar: 18 },
  "100x50": { w: 100, h: 50, name: 12, price: 12, bar: 22 },
};
export const SIZE_OPTIONS = Object.keys(LABEL_SIZES);
export const DEFAULT_SIZE = "50x30";
export const MAX_COPIES = 200;
// Tope de etiquetas por impresión (el HTML crece ~3 KB por etiqueta).
export const MAX_TOTAL = 1000;

// Barra más angosta: hasta 0,4 mm; en etiquetas angostas se reduce para que
// quepan los 113 módulos (incluye zonas de silencio). Recomendado >= 0,33 mm.
const MAX_MODULE_MM = 0.4;
const SIDE_PADDING_MM = 1;

const escapeHtml = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const clampCopies = (n) =>
  Math.min(MAX_COPIES, Math.max(1, Math.floor(Number(n)) || 1));

function labelHtml(item, c, showPrice) {
  const moduleMm = Math.min(
    MAX_MODULE_MM,
    (c.w - 2 * SIDE_PADDING_MM) / TOTAL_MODULES,
  );
  const svg = ean13Svg(item.code, { moduleMm, barHeightMm: c.bar });
  const price =
    showPrice && item.valor != null
      ? `<div class="price">${escapeHtml(pesosFormat(item.valor))}</div>`
      : "";
  return `<div class="label"><div class="name">${escapeHtml(item.nombre)}</div>${price}${svg}</div>`;
}

/**
 * HTML imprimible. `items`: [{ nombre, valor, code, copies }]. Devuelve
 * { html, count } o lanza si algún código no es un EAN-13 válido.
 */
export function buildLabelsHtml(
  items,
  { size = DEFAULT_SIZE, showPrice = true } = {},
) {
  const c = LABEL_SIZES[size] || LABEL_SIZES[DEFAULT_SIZE];
  let body = "";
  let count = 0;
  for (const item of items) {
    if (!isValidEan13(item.code)) {
      throw new Error(
        `“${item.nombre}” no tiene un código de barras válido todavía.`,
      );
    }
    const one = labelHtml(item, c, showPrice);
    const copies = clampCopies(item.copies);
    body += one.repeat(copies);
    count += copies;
  }
  if (count > MAX_TOTAL) {
    throw new Error(
      `Son ${count} etiquetas; el máximo por impresión es ${MAX_TOTAL}.`,
    );
  }
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Etiquetas</title>
<style>
@page { size: ${c.w}mm ${c.h}mm; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; }
.label { width: ${c.w}mm; height: ${c.h}mm; padding: 1.2mm ${SIDE_PADDING_MM}mm;
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  overflow: hidden; page-break-after: always; break-after: page;
  font-family: Arial, Helvetica, sans-serif; color: #000; text-align: center; }
.label:last-child { page-break-after: auto; break-after: auto; }
.name { font-size: ${c.name}pt; font-weight: 700; line-height: 1.1; max-width: 100%;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow-wrap: anywhere; }
.price { font-size: ${c.price}pt; font-weight: 700; line-height: 1.1; }
svg { display: block; flex: none; }
</style></head><body>${body}</body></html>`;
  return { html, count };
}

export async function printLabels(items, opts = {}) {
  const { size = DEFAULT_SIZE } = opts;
  const c = LABEL_SIZES[size] || LABEL_SIZES[DEFAULT_SIZE];
  const { html, count } = buildLabelsHtml(items, opts);

  if (isWeb) {
    const w = window.open("", "_blank");
    if (!w) throw new Error("No se pudo abrir la ventana de impresión.");
    w.document.write(html);
    w.document.close();
    w.focus();
    // Espera un tick a que el navegador maquete el SVG antes de imprimir.
    setTimeout(() => w.print(), 250);
  } else {
    const pt = 72 / 25.4; // mm -> puntos (iOS usa width/height en pt)
    await Print.printAsync({ html, width: c.w * pt, height: c.h * pt });
  }
  return count;
}
