import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Animated, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";
import { Icon } from "./Icon";

const ToastContext = createContext(() => {});

// Reemplaza a Alert (que en web funciona mal). Uso: const toast = useToast();
// toast.success("Guardado"); toast.error("Falló"); toast.show("...", { tone });
export function ToastProvider({ children }) {
  const { colors, radii, spacing, shadow } = useTheme();
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [opacity]);

  const show = useCallback(
    (message, { tone = "neutral", duration = 3000 } = {}) => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, tone });
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      timer.current = setTimeout(hide, duration);
    },
    [opacity, hide],
  );

  const api = useRef({
    show,
    success: (m, o) => show(m, { ...o, tone: "success" }),
    error: (m, o) => show(m, { ...o, tone: "danger", duration: 4000 }),
    info: (m, o) => show(m, { ...o, tone: "info" }),
  }).current;
  // mantener callbacks frescos
  api.show = show;
  api.success = (m, o) => show(m, { ...o, tone: "success" });
  api.error = (m, o) => show(m, { ...o, tone: "danger", duration: 4000 });
  api.info = (m, o) => show(m, { ...o, tone: "info" });

  const toneMap = {
    neutral: {
      bg: colors.surfaceAlt,
      fg: colors.text,
      icon: "information-outline",
    },
    success: { bg: colors.success, fg: "#fff", icon: "check-circle-outline" },
    danger: { bg: colors.danger, fg: "#fff", icon: "alert-circle-outline" },
    info: { bg: colors.info, fg: "#fff", icon: "information-outline" },
  };
  const c = toast ? toneMap[toast.tone] || toneMap.neutral : null;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? (
        <SafeAreaView
          edges={["bottom"]}
          pointerEvents="box-none"
          style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
        >
          <Animated.View
            style={{ opacity, margin: spacing.lg }}
            pointerEvents="auto"
          >
            <Pressable onPress={hide}>
              <View
                style={[
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    backgroundColor: c.bg,
                    borderRadius: radii.md,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.lg,
                  },
                  shadow(2),
                ]}
              >
                <Icon name={c.icon} size={20} color={c.fg} />
                <Text
                  variant="small"
                  weight="medium"
                  color={c.fg}
                  style={{ flex: 1 }}
                >
                  {toast.message}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export default ToastProvider;
