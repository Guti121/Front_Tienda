// Tema del CATÁLOGO PÚBLICO por tienda (no es el tema de esta app). Espejo de
// `catalog-web/lib/theme.ts`: paleta base + override opcional de 3 colores
// (accent / bg / text); el resto de tokens se derivan. Se usa solo en la
// pantalla "Apariencia del catálogo" para la vista previa en vivo.
//
// PALETTES tiene que coincidir con catalog-web/lib/theme.ts y con
// CATALOG_PALETTE_CHOICES del backend.

export const PALETTES = {
  "": {
    key: "",
    label: "Índigo (por defecto)",
    accent: "#4f46e5",
    bg: "#f6f7f9",
    text: "#334155",
  },
  carbon: {
    key: "carbon",
    label: "Carbón",
    accent: "#2563eb",
    bg: "#f8fafc",
    text: "#0f172a",
  },
  calido: {
    key: "calido",
    label: "Cálido",
    accent: "#ea580c",
    bg: "#fff7ed",
    text: "#431407",
  },
  menta: {
    key: "menta",
    label: "Menta",
    accent: "#0d9488",
    bg: "#f0fdfa",
    text: "#134e4a",
  },
  rosa: {
    key: "rosa",
    label: "Rosa",
    accent: "#db2777",
    bg: "#fdf2f8",
    text: "#500724",
  },
  noche: {
    key: "noche",
    label: "Noche (oscuro)",
    accent: "#8b5cf6",
    bg: "#0f1115",
    text: "#e5e7eb",
  },
};

export const PALETTE_LIST = Object.values(PALETTES);

// ---------------------------------------------------------------- utils de color
function parseHex(hex) {
  const s = String(hex || "")
    .trim()
    .replace(/^#/, "");
  const full =
    s.length === 3
      ? s
          .split("")
          .map((c) => c + c)
          .join("")
      : s;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function toHex([r, g, b]) {
  const h = (n) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function mix(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const lighten = (c, t) => mix(c, WHITE, t);
const darken = (c, t) => mix(c, BLACK, t);

function relLuminance([r, g, b]) {
  const lin = [r, g, b].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrastRatio(a, b) {
  const ra = parseHex(a);
  const rb = parseHex(b);
  if (!ra || !rb) return 1;
  const la = relLuminance(ra);
  const lb = relLuminance(rb);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Valida un hex (#rgb o #rrggbb). "" cuenta como válido (= sin override). */
export function isValidHex(v) {
  return v === "" || parseHex(v) != null;
}

// ---------------------------------------------------------------- resolución
// Los overrides finos (surface/muted/ink/line/accentSoft) se usan tal cual si
// parsean; si no, se derivan del trío base.
export function resolveCatalogTheme({
  palette,
  accent,
  bg,
  text,
  surface,
  muted,
  ink,
  line,
  accentSoft,
} = {}) {
  const base = PALETTES[(palette || "").trim()] || PALETTES[""];
  const accentRGB = parseHex(accent) || parseHex(base.accent);
  const bgRGB = parseHex(bg) || parseHex(base.bg);
  const textRGB = parseHex(text) || parseHex(base.text);

  const bgIsDark = relLuminance(bgRGB) < 0.5;
  const accentFg =
    contrastRatio(toHex(accentRGB), "#ffffff") >=
    contrastRatio(toHex(accentRGB), "#0f1115")
      ? "#ffffff"
      : "#0f1115";

  const pick = (v, derived) => {
    const rgb = parseHex(v);
    return rgb ? toHex(rgb) : derived;
  };

  return {
    accent: toHex(accentRGB),
    accentHover: toHex(
      relLuminance(accentRGB) > 0.4
        ? darken(accentRGB, 0.12)
        : lighten(accentRGB, 0.1),
    ),
    accentFg,
    accentSoft: pick(accentSoft, toHex(mix(accentRGB, bgRGB, 0.88))),
    canvas: toHex(bgRGB),
    surface: pick(surface, toHex(bgIsDark ? mix(bgRGB, WHITE, 0.08) : WHITE)),
    body: toHex(textRGB),
    ink: pick(
      ink,
      toHex(bgIsDark ? lighten(textRGB, 0.08) : darken(textRGB, 0.15)),
    ),
    muted: pick(muted, toHex(mix(textRGB, bgRGB, 0.45))),
    line: pick(line, toHex(mix(textRGB, bgRGB, 0.88))),
  };
}

/** Color EFECTIVO de cada slot (para pintar el swatch y abrir la rueda con él).
 *  accent/bg/text vienen del override o del trío base; el resto, del tema
 *  resuelto (que ya aplica override-o-derivado). */
export function effectiveColors(input = {}) {
  const base = PALETTES[(input.palette || "").trim()] || PALETTES[""];
  const t = resolveCatalogTheme(input);
  return {
    accent: input.accent || base.accent,
    bg: input.bg || base.bg,
    text: input.text || base.text,
    surface: t.surface,
    muted: t.muted,
    heading: t.ink,
    border: t.line,
    accentSoft: t.accentSoft,
  };
}
