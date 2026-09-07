import { FlatList, Image, Linking, Pressable, View } from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";

import { useCart } from "../../src/components/catalog/CartContext";
import { mediaUrl } from "../../src/api/config";
import { pesosFormat } from "../../src/components/icons/functionFormat";
import { isWeb } from "../../src/components/token/localstorage";
import { useTheme } from "../../src/theme/ThemeProvider";
import {
  Button,
  Card,
  EmptyState,
  Icon,
  Screen,
  Text,
  useToast,
} from "../../src/ui";

const FALLBACK_IMG =
  "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

export default function CartScreen() {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { colors, spacing } = useTheme();
  const toast = useToast();
  const empresa = useSelector((state) => state.user.empresa);

  const subtotal = (it) => Number(it.valor) * it.cantidad;
  const total = cartItems.reduce((sum, it) => sum + subtotal(it), 0);

  const enviarPedido = () => {
    if (cartItems.length === 0) return;
    let msg = "Hola, quisiera realizar el siguiente pedido:\n\n";
    cartItems.forEach((it) => {
      msg += `• ${it.numero_producto} ${it.nombre} x${it.cantidad} = ${pesosFormat(
        subtotal(it),
      )}\n`;
    });
    msg += `\nTotal: ${pesosFormat(total)}`;
    const url = `https://wa.me/57${empresa?.phone || ""}?text=${encodeURIComponent(msg)}`;
    if (isWeb) window.open(url);
    else
      Linking.openURL(url).catch(() =>
        toast.error("No se pudo abrir WhatsApp"),
      );
  };

  return (
    <Screen padded={false}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          <Text
            variant="title"
            weight="bold"
            style={{ marginBottom: spacing.md }}
          >
            Tu carrito
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            icon="cart-outline"
            title="Tu carrito está vacío"
            message="Agrega productos desde el catálogo."
          />
        }
        renderItem={({ item }) => {
          const uri = mediaUrl(item?.imagenes?.[0]?.imagen) || FALLBACK_IMG;
          return (
            <Card level={0} style={{ marginBottom: spacing.sm }}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/catalog/productDetail",
                    params: { id: item.id, name: empresa?.name },
                  })
                }
                style={{ flexDirection: "row", gap: spacing.md }}
              >
                <Image
                  source={{ uri }}
                  style={{ width: 64, height: 64, borderRadius: 10 }}
                />
                <View style={{ flex: 1, gap: spacing.xxs }}>
                  <Text weight="medium" numberOfLines={1}>
                    {item.nombre} x{item.cantidad}
                  </Text>
                  <Text weight="bold" color="primary">
                    {pesosFormat(subtotal(item))}
                  </Text>
                </View>
                <Icon
                  name="trash-can-outline"
                  size={20}
                  color={colors.danger}
                  onPress={() => removeFromCart(item.id)}
                />
              </Pressable>
            </Card>
          );
        }}
      />

      {cartItems.length > 0 ? (
        <Card
          level={2}
          style={{
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            gap: spacing.md,
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text weight="bold">Total</Text>
            <Text variant="title" weight="bold" color="primary">
              {pesosFormat(total)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Button
              title="Vaciar"
              variant="ghost"
              style={{ flex: 1 }}
              onPress={clearCart}
            />
            <Button
              title="Enviar pedido"
              style={{ flex: 2 }}
              left={
                <Icon name="whatsapp" size={18} color={colors.textOnBrand} />
              }
              onPress={enviarPedido}
            />
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
