// Codificador EAN-13 propio (sin dependencias) que produce un SVG vectorial.
// A diferencia del PNG que genera el backend, el SVG queda nítido a cualquier
// tamaño y en impresoras térmicas de 203 dpi.

const L = [
  "0001101",
  "0011001",
  "0010011",
  "0111101",
  "0100011",
  "0110001",
  "0101111",
  "0111011",
  "0110111",
  "0001011",
];
const G = [
  "0100111",
  "0110011",
  "0011011",
  "0100001",
  "0011101",
  "0111001",
  "0000101",
  "0010001",
  "0001001",
  "0010111",
];
const R = [
  "1110010",
  "1100110",
  "1101100",
  "1000010",
  "1011100",
  "1001110",
  "1010000",
  "1000100",
  "1001000",
  "1110100",
];
// Paridad de los 6 dígitos de la izquierda según el primer dígito.
const PARITY = [
  "LLLLLL",
  "LLGLGG",
  "LLGGLG",
  "LLGGGL",
  "LGLLGG",
  "LGGLLG",
  "LGGGLL",
  "LGLGLG",
  "LGLGGL",
  "LGGLGL",
];

// Zonas de silencio obligatorias: 11 módulos a la izquierda, 7 a la derecha.
export const QUIET_LEFT = 11;
export const QUIET_RIGHT = 7;
export const BARS_MODULES = 95;
export const TOTAL_MODULES = QUIET_LEFT + BARS_MODULES + QUIET_RIGHT;

export function checkDigit(first12) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(first12[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
}

export function isValidEan13(code) {
  const s = String(code ?? "");
  return /^\d{13}$/.test(s) && checkDigit(s.slice(0, 12)) === Number(s[12]);
}

// Cadena de 95 módulos ("1" = barra, "0" = espacio).
export function ean13Modules(code) {
  const s = String(code ?? "");
  if (!isValidEan13(s)) throw new Error(`EAN-13 inválido: ${s}`);
  const parity = PARITY[Number(s[0])];
  let out = "101";
  for (let i = 0; i < 6; i++) {
    const d = Number(s[i + 1]);
    out += parity[i] === "L" ? L[d] : G[d];
  }
  out += "01010";
  for (let i = 7; i < 13; i++) out += R[Number(s[i])];
  return out + "101";
}

/**
 * SVG del código con su número debajo. Todas las medidas van en mm:
 * `moduleMm` = ancho de la barra más angosta, `barHeightMm` = alto de las barras.
 * Las barras contiguas se unen en un solo <rect> (menos nodos, sin costuras).
 */
export function ean13Svg(code, { moduleMm = 0.33, barHeightMm = 14 } = {}) {
  const modules = ean13Modules(code);
  const textMm = 3; // franja de los dígitos
  const barH = barHeightMm / moduleMm; // en módulos
  const textH = textMm / moduleMm;
  const fontSize = textH * 0.85;

  let rects = "";
  for (let i = 0; i < modules.length; ) {
    if (modules[i] === "1") {
      let j = i;
      while (j < modules.length && modules[j] === "1") j++;
      rects += `<rect x="${QUIET_LEFT + i}" y="0" width="${j - i}" height="${barH}"/>`;
      i = j;
    } else {
      i++;
    }
  }

  const y = barH + textH * 0.85;
  const s = String(code);
  const txt = (x, t, anchor = "middle") =>
    `<text x="${x}" y="${y}" font-size="${fontSize}" text-anchor="${anchor}" ` +
    `font-family="Arial,Helvetica,sans-serif">${t}</text>`;
  const digits =
    txt(QUIET_LEFT / 2, s[0]) +
    txt(QUIET_LEFT + 3 + 21, s.slice(1, 7)) +
    txt(QUIET_LEFT + 50 + 21, s.slice(7));

  const w = TOTAL_MODULES;
  const h = barH + textH;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" ` +
    `width="${(w * moduleMm).toFixed(3)}mm" height="${(h * moduleMm).toFixed(3)}mm" ` +
    `shape-rendering="crispEdges"><g fill="#000">${rects}</g>` +
    `<g fill="#000">${digits}</g></svg>`
  );
}
