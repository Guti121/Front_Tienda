import { useState } from "react";
import { Pressable, View } from "react-native";

import ProductView from "../../src/components/colletion/product/product";
import TypeProductView from "../../src/components/colletion/typeProduct/typeProduct";
import CategoryView from "../../src/components/colletion/category/category";
import { useUserCAAuthRedirect } from "../../src/redux/viewsPermissions";
import { useTheme } from "../../src/theme/ThemeProvider";
import { Text } from "../../src/ui";

const TABS = [
  ["product", "Productos"],
  ["type", "Tipos"],
  ["category", "Categorías"],
];

const VIEWS = {
  product: ProductView,
  type: TypeProductView,
  category: CategoryView,
};

// Cambia entre el listado de productos y el de tipos de producto.
export default function ProductsDrawer() {
  useUserCAAuthRedirect();
  const { colors, spacing, radii } = useTheme();
  const [tab, setTab] = useState("product");

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          flexDirection: "row",
          gap: spacing.xs,
          margin: spacing.lg,
          marginBottom: spacing.sm,
          padding: spacing.xxs,
          backgroundColor: colors.surfaceAlt,
          borderRadius: radii.md,
        }}
      >
        {TABS.map(([key, label]) => {
          const active = tab === key;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={{
                flex: 1,
                paddingVertical: spacing.sm,
                borderRadius: radii.sm,
                alignItems: "center",
                backgroundColor: active ? colors.surface : "transparent",
              }}
            >
              <Text
                variant="small"
                weight={active ? "bold" : "regular"}
                color={active ? "text" : "textMuted"}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }}>
        {(() => {
          const ActiveView = VIEWS[tab];
          return <ActiveView />;
        })()}
      </View>
    </View>
  );
}
