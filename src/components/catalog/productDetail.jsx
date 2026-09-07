import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { getCatalogProduct } from "../../api/catalog";
import { mediaUrl } from "../../api/config";
import { useCart } from "./CartContext";
import HorizontalImageScroller from "./stylesCatalogo/scrollImages";
import ImageModal from "./stylesCatalogo/modalImage";
import { useTheme } from "../../theme/ThemeProvider";
import {
  Button,
  Icon,
  Loader,
  Screen,
  Stepper,
  Text,
  useToast,
} from "../../ui";
import { pesosFormat } from "../icons/functionFormat";

const MAX_W = 1000;
const FALLBACK_IMG =
  "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

export default function DetailProductCatalog({ productId, name }) {
  const { colors, spacing, radii, shadow } = useTheme();
  const { width } = useWindowDimensions();
  const toast = useToast();
  const { addToCart, cartItems } = useCart();
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(null);

  const twoCol = width >= 860;
  const cartCount = cartItems.reduce((n, it) => n + (it.cantidad || 1), 0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["catalog", "product", name, productId],
    queryFn: () => getCatalogProduct(name, productId),
    enabled: !!productId,
  });

  if (isLoading) return <Loader label="Cargando…" />;
  if (isError || !data) {
    return (
      <Screen>
        <Text color="danger" center>
          No se encontró el producto.
        </Text>
        <Button
          title="Volver"
          variant="secondary"
          onPress={() => router.back()}
        />
      </Screen>
    );
  }

  const imgs = (data.imagenes ?? [])
    .map((i) => mediaUrl(i.imagen))
    .filter(Boolean);

  const add = () => {
    addToCart({ ...data, cantidad: qty });
    toast.success(`Añadido (${qty})`);
  };

  const gallery = (
    <View
      style={{
        flex: twoCol ? 1 : undefined,
        backgroundColor: colors.surfaceAlt,
        borderRadius: twoCol ? radii.lg : 0,
        overflow: "hidden",
      }}
    >
      {imgs.length > 0 ? (
        <HorizontalImageScroller images={imgs} onImagePress={setZoom} />
      ) : (
        <Image
          source={{ uri: FALLBACK_IMG }}
          style={{ width: "100%", aspectRatio: 1, resizeMode: "cover" }}
        />
      )}
    </View>
  );

  const info = (
    <View
      style={{
        flex: twoCol ? 1 : undefined,
        gap: spacing.md,
        padding: spacing.lg,
      }}
    >
      {data.tipo_producto ? (
        <Text
          variant="caption"
          muted
          weight="bold"
          style={{ letterSpacing: 1 }}
        >
          {String(data.tipo_producto).toUpperCase()}
        </Text>
      ) : null}
      <Text variant="display" weight="bold">
        {data.nombre}
      </Text>
      <Text variant="title" weight="bold" color="primary">
        {pesosFormat(data.valor)}
      </Text>

      <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
        <Text
          variant="caption"
          weight="bold"
          muted
          style={{ letterSpacing: 1 }}
        >
          DESCRIPCIÓN
        </Text>
        <Text color="textMuted">{data.detalles || "Sin descripción."}</Text>
      </View>

      <Text variant="caption" muted style={{ marginTop: spacing.xs }}>
        Ref. #{data.numero_producto}
      </Text>

      {twoCol ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.lg,
            marginTop: spacing.md,
          }}
        >
          <Stepper value={qty} onChange={setQty} />
          <View style={{ flex: 1 }}>
            <Button
              title="Agregar al carrito"
              left={
                <Icon name="cart-plus" size={18} color={colors.textOnBrand} />
              }
              onPress={add}
            />
          </View>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* navbar mínima con volver + carrito */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
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
        <Pressable
          onPress={() => router.push("/catalog/car")}
          hitSlop={8}
          style={{ padding: spacing.sm }}
        >
          <Icon name="cart-outline" size={22} color={colors.text} />
          {cartCount > 0 ? (
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                minWidth: 18,
                height: 18,
                paddingHorizontal: 3,
                borderRadius: radii.pill,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="caption" weight="bold" color={colors.textOnBrand}>
                {cartCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          width: "100%",
          maxWidth: MAX_W,
          alignSelf: "center",
          padding: twoCol ? spacing.lg : 0,
          paddingBottom: twoCol ? spacing.lg : 120,
        }}
      >
        <View
          style={{
            flexDirection: twoCol ? "row" : "column",
            gap: twoCol ? spacing.xl : 0,
            alignItems: twoCol ? "flex-start" : "stretch",
          }}
        >
          {gallery}
          {info}
        </View>
      </ScrollView>

      {/* barra fija de compra (móvil) */}
      {!twoCol ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.lg,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            ...shadow(2),
          }}
        >
          <Stepper value={qty} onChange={setQty} />
          <View style={{ flex: 1 }}>
            <Button
              title="Agregar"
              left={
                <Icon name="cart-plus" size={18} color={colors.textOnBrand} />
              }
              onPress={add}
            />
          </View>
        </View>
      ) : null}

      <ImageModal
        visible={!!zoom}
        imageUri={zoom}
        onClose={() => setZoom(null)}
      />
    </View>
  );
}
