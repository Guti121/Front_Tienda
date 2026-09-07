import { Image, Linking, Pressable, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { router } from "expo-router";
import { useSelector } from "react-redux";

import { useCart } from "../../src/components/catalog/CartContext";
import { mediaUrl } from "../../src/api/config";
import { pesosFormat } from "../../src/components/icons/functionFormat";
import { isWeb } from "../../src/components/token/localstorage";
import { useTheme } from "../../src/theme/ThemeProvider";
import { Button, EmptyState, Icon, Stepper, Text } from "../../src/ui";

const MAX_W = 720;
const FALLBACK_IMG =
  "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

export default function CartScreen() {
  const { cartItems, removeFromCart, setQty, clearCart } = useCart();
  const { colors, spacing, radii, shadow } = useTheme();
  const empresa = useSelector((state) => state.user.empresa);

  const subtotal = (it) => Number(it.valor) * it.cantidad;
  const total = cartItems.reduce((sum, it) => sum + subtotal(it), 0);
  const count = cartItems.reduce((n, it) => n + it.cantidad, 0);

  const enviarPedido = () => {
    if (cartItems.length === 0) return;
    let msg = "Hola, quisiera realizar el siguiente pedido:\n\n";
    cartItems.forEach((it) => {
      msg += `• ${it.nombre} x${it.cantidad} — ${pesosFormat(subtotal(it))}\n`;
    });
    msg += `\nTotal: ${pesosFormat(total)}`;
    const url = `https://wa.me/57${empresa?.phone || ""}?text=${encodeURIComponent(msg)}`;
    if (isWeb) window.open(url);
    else Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          height: 52,
          paddingHorizontal: spacing.sm,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{ padding: spacing.sm }}
        >
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text weight="bold">Tu carrito{count ? ` · ${count}` : ""}</Text>
      </View>

      <Animated.FlatList
        data={cartItems}
        keyExtractor={(item) => String(item.id)}
        // Al quitar una línea, las demás cierran el hueco (evita el salto seco).
        itemLayoutAnimation={LinearTransition.duration(180)}
        contentContainerStyle={{
          width: "100%",
          maxWidth: MAX_W,
          alignSelf: "center",
          padding: spacing.lg,
          paddingBottom: 140,
        }}
        ListEmptyComponent={
          <View style={{ paddingVertical: spacing.xxl, gap: spacing.md }}>
            <EmptyState
              icon="cart-outline"
              title="Tu carrito está vacío"
              message="Explora el catálogo y añade productos."
            />
            <View style={{ alignItems: "center" }}>
              <Button
                title="Ver catálogo"
                variant="secondary"
                fullWidth={false}
                onPress={() => router.back()}
              />
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => {
          const uri = mediaUrl(item?.imagenes?.[0]?.imagen) || FALLBACK_IMG;
          return (
            <View
              style={{
                flexDirection: "row",
                gap: spacing.md,
                backgroundColor: colors.surface,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing.md,
              }}
            >
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/catalog/productDetail",
                    params: { id: item.id, name: empresa?.name },
                  })
                }
              >
                <Image
                  source={{ uri }}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: radii.md,
                    backgroundColor: colors.surfaceAlt,
                  }}
                />
              </Pressable>

              <View style={{ flex: 1, gap: spacing.xs }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: spacing.sm,
                  }}
                >
                  <Text weight="medium" numberOfLines={2} style={{ flex: 1 }}>
                    {item.nombre}
                  </Text>
                  <Icon
                    name="close"
                    size={18}
                    color={colors.textFaint}
                    onPress={() => removeFromCart(item.id)}
                  />
                </View>
                <Text variant="small" muted>
                  {pesosFormat(item.valor)} c/u
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: spacing.xxs,
                  }}
                >
                  <Stepper
                    value={item.cantidad}
                    onChange={(q) => setQty(item.id, q)}
                    size="sm"
                  />
                  <Text weight="bold" color="primary">
                    {pesosFormat(subtotal(item))}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {cartItems.length > 0 ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            ...shadow(3),
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: MAX_W,
              alignSelf: "center",
              padding: spacing.lg,
              gap: spacing.md,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <Text muted>Total ({count})</Text>
              <Text variant="title" weight="bold" color="primary">
                {pesosFormat(total)}
              </Text>
            </View>
            <Button
              title="Pedir por WhatsApp"
              left={
                <Icon name="whatsapp" size={18} color={colors.textOnBrand} />
              }
              onPress={enviarPedido}
            />
            <Pressable
              onPress={clearCart}
              style={{ alignItems: "center", paddingVertical: spacing.xs }}
            >
              <Text variant="small" color="danger">
                Vaciar carrito
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
