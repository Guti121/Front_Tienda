import { useState } from "react";
import { Image, View } from "react-native";
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
  Card,
  Loader,
  Screen,
  Stepper,
  Text,
  useToast,
} from "../../ui";
import { pesosFormat } from "../icons/functionFormat";

const FALLBACK_IMG =
  "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

export default function DetailProductCatalog({ productId, name }) {
  const { spacing } = useTheme();
  const toast = useToast();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(null);

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

  return (
    <Screen scroll padded={false}>
      {imgs.length > 0 ? (
        <HorizontalImageScroller images={imgs} onImagePress={setZoom} />
      ) : (
        <Image
          source={{ uri: FALLBACK_IMG }}
          style={{ width: "100%", height: 260, resizeMode: "cover" }}
        />
      )}

      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Text variant="title" weight="bold">
          {data.nombre}
        </Text>
        <Text variant="subtitle" weight="bold" color="primary">
          {pesosFormat(data.valor)}
        </Text>

        <Card level={0} style={{ gap: spacing.xs }}>
          <Text variant="small" weight="bold" muted>
            DETALLES
          </Text>
          <Text>{data.detalles || "No especificado"}</Text>
          <Text variant="small" muted style={{ marginTop: spacing.xs }}>
            Tipo: {data.tipo_producto || "—"} · #{data.numero_producto}
          </Text>
        </Card>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text muted>Cantidad</Text>
          <Stepper value={qty} onChange={setQty} />
        </View>

        <Button
          title="Agregar al carrito"
          onPress={() => {
            addToCart({ ...data, cantidad: qty });
            toast.success("Producto añadido al carrito");
          }}
        />
      </View>

      <ImageModal
        visible={!!zoom}
        imageUri={zoom}
        onClose={() => setZoom(null)}
      />
    </Screen>
  );
}
