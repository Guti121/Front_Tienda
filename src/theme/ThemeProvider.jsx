import { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { themes, spacing, radii, typography, shadow, palette } from "./tokens";

const ThemeContext = createContext(null);

// override: "light" | "dark" | "system" (default). Persistir la preferencia del
// usuario es trivial luego (setMode + AsyncStorage/SecureStore).
export function ThemeProvider({ children, initialMode = "system" }) {
  const system = useColorScheme() || "light";
  const [mode, setMode] = useState(initialMode);

  const value = useMemo(() => {
    const active = mode === "system" ? system : mode;
    return {
      mode,
      setMode,
      isDark: active === "dark",
      colors: themes[active] || themes.light,
      spacing,
      radii,
      typography,
      shadow,
      palette,
    };
  }, [mode, system]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback si algún componente se usa fuera del provider.
    return {
      mode: "light",
      setMode: () => {},
      isDark: false,
      colors: themes.light,
      spacing,
      radii,
      typography,
      shadow,
      palette,
    };
  }
  return ctx;
}
