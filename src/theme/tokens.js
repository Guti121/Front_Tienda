// Tokens de diseño. Antes: un objeto plano `theme.jsx` con estilos ya compuestos
// y colores hex sueltos, sin escala ni modo claro.
// Dirección: marca índigo + acento teal, superficies neutras, claro + oscuro.

// ---------------------------------------------------------------- Paletas
const palette = {
  // marca (indigo)
  brand50: "#eef2ff",
  brand100: "#e0e7ff",
  brand200: "#c7d2fe",
  brand300: "#a5b4fc",
  brand400: "#818cf8",
  brand500: "#6366f1",
  brand600: "#4f46e5", // primario
  brand700: "#4338ca",
  brand800: "#3730a3",
  brand900: "#312e81",
  // acento (teal)
  teal400: "#2dd4bf",
  teal500: "#14b8a6",
  teal600: "#0d9488",
  // neutros (slate)
  n0: "#ffffff",
  n50: "#f8fafc",
  n100: "#f1f5f9",
  n200: "#e2e8f0",
  n300: "#cbd5e1",
  n400: "#94a3b8",
  n500: "#64748b",
  n600: "#475569",
  n700: "#334155",
  n800: "#1e293b",
  n900: "#0f172a",
  n950: "#0b0f19",
  // semánticos
  green500: "#16a34a",
  green100: "#dcfce7",
  amber500: "#d97706",
  amber100: "#fef3c7",
  red500: "#dc2626",
  red100: "#fee2e2",
  blue500: "#2563eb",
  blue100: "#dbeafe",
};

// ---------------------------------------------------------------- Temas
const light = {
  mode: "light",
  bg: palette.n50,
  surface: palette.n0,
  surfaceAlt: palette.n100,
  overlay: "rgba(15, 23, 42, 0.45)",

  text: palette.n900,
  textMuted: palette.n500,
  textFaint: palette.n400,
  textOnBrand: palette.n0,

  border: palette.n200,
  borderStrong: palette.n300,

  primary: palette.brand600,
  primaryHover: palette.brand700,
  primarySoft: palette.brand50,
  accent: palette.teal600,

  success: palette.green500,
  successSoft: palette.green100,
  warning: palette.amber500,
  warningSoft: palette.amber100,
  danger: palette.red500,
  dangerSoft: palette.red100,
  info: palette.blue500,
  infoSoft: palette.blue100,
};

const dark = {
  mode: "dark",
  bg: palette.n950,
  surface: "#151a27",
  surfaceAlt: "#1e2536",
  overlay: "rgba(0, 0, 0, 0.6)",

  text: palette.n100,
  textMuted: palette.n400,
  textFaint: palette.n500,
  textOnBrand: palette.n0,

  border: "#2a3346",
  borderStrong: "#3a4560",

  primary: palette.brand500,
  primaryHover: palette.brand400,
  primarySoft: "#1e1b4b",
  accent: palette.teal400,

  success: "#22c55e",
  successSoft: "#052e16",
  warning: "#f59e0b",
  warningSoft: "#3a2a06",
  danger: "#ef4444",
  dangerSoft: "#3a0a0a",
  info: "#3b82f6",
  infoSoft: "#0a1e3a",
};

export const themes = { light, dark };
export { palette };

// ---------------------------------------------------------------- Escalas
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const typography = {
  // family: undefined -> fuente del sistema. Para usar Inter: cargarla con
  // expo-font en app/_layout.jsx y poner "Inter" aquí.
  family: undefined,
  familyBold: undefined,
  size: {
    display: 30,
    title: 22,
    subtitle: 18,
    body: 15,
    small: 13,
    caption: 11,
  },
  weight: {
    regular: "400",
    medium: "500",
    bold: "700",
  },
  lineHeight: {
    display: 36,
    title: 28,
    subtitle: 24,
    body: 22,
    small: 18,
    caption: 15,
  },
};

// ---------------------------------------------------------------- Sombras
// RN nativo usa shadow*/elevation; react-native-web respeta boxShadow.
export function shadow(level = 1) {
  const map = {
    0: { boxShadow: "none", elevation: 0 },
    1: {
      boxShadow: "0 1px 3px rgba(15,23,42,0.10), 0 1px 2px rgba(15,23,42,0.06)",
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 3,
      elevation: 2,
    },
    2: {
      boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 12,
      elevation: 5,
    },
    3: {
      boxShadow: "0 10px 30px rgba(15,23,42,0.18)",
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
  };
  return map[level] ?? map[1];
}
