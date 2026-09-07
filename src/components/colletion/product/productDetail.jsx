import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import {
  retrieveProduct,
  getBarcode,
  deleteProduct,
} from "../../../api/products";
import {
  downloadBarcodePdf,
  SIZE_OPTIONS,
} from "../../../features/products/barcodePdf";
import { mediaUrl } from "../../../api/config";
import { useTheme } from "../../../theme/ThemeProvider";
import {
  Badge,
  Button,
  Card,
  Divider,
  Icon,
  Loader,
  Screen,
  Sheet,
  Text,
  useToast,
} from "../../../ui";
import { pesosFormat } from "../../icons/functionFormat";
import { isWeb } from "../../token/localstorage";
import ImageModal from "./imageModal";

const FALLBACK_IMG =
  "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

function Row({ label, value, strong }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
      }}
    >
      <Text muted>{label}</Text>
      <Text
        weight={strong ? "bold" : "medium"}
        color={strong ? "primary" : "text"}
      >
        {value}
      </Text>
    </View>
  );
}

export default function DetailProduct({ id }) {
  const { colors, spacing } = useTheme();
  const toast = useToast();
  const user = useSelector((state) => state.user.user);
  const isCreator = user?.typeUser === "creator";

  const [selectedImage, setSelectedImage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pdfSheet, setPdfSheet] = useState(false);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => retrieveProduct(id),
    enabled: !!id,
  });

  const { data: barcode } = useQuery({
    queryKey: ["product", id, "barcode"],
    queryFn: () => getBarcode(id),
    enabled: !!id,
  });

  const barcodeUrl = mediaUrl(barcode?.barcode) || FALLBACK_IMG;

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(id);
      setConfirmDelete(false);
      toast.success("Producto eliminado");
      setTimeout(() => router.back(), 600);
    } catch (err) {
      setConfirmDelete(false);
      toast.error(err?.message || "No se pudo eliminar el producto");
    } finally {
      setDeleting(false);
    }
  };

  const goEditStock = (event) =>
    router.push({
      pathname: "/modals/modalUpdateProductDrawer",
      params: { product: JSON.stringify(product), event },
    });

  const onPickPdfSize = async (size) => {
    setPdfSheet(false);
    try {
      await downloadBarcodePdf({ size, barcodeImageUrl: barcodeUrl, product });
    } catch (err) {
      toast.error(err?.message || "No se pudo generar el PDF");
    }
  };

  if (isLoading) return <Loader label="Cargando producto…" />;
  if (isError || !product) {
    return (
      <Screen>
        <Text color="danger" center>
          No se encontró el producto.
        </Text>
      </Screen>
    );
  }

  const imgs = product.imagenes ?? [];

  return (
    <Screen scroll>
      <View style={{ gap: spacing.md }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text variant="caption" muted>
            #{product.numero_producto}
          </Text>
          <Badge
            label={product.publicar ? "Público" : "Privado"}
            tone={product.publicar ? "success" : "neutral"}
          />
        </View>

        {imgs.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              {imgs.map((img, i) => (
                <Pressable
                  key={i}
                  onPress={() => setSelectedImage(mediaUrl(img.imagen))}
                >
                  <Image
                    source={{ uri: mediaUrl(img.imagen) }}
                    style={{
                      width: 120,
                      height: 150,
                      borderRadius: 12,
                      borderWidth: img.principal ? 2 : 1,
                      borderColor: img.principal
                        ? colors.primary
                        : colors.border,
                    }}
                  />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : null}

        <Text variant="title" weight="bold">
          {product.nombre}
        </Text>

        <Card level={1}>
          <Row
            label="Valor de venta"
            value={pesosFormat(product.valor)}
            strong
          />
          {isCreator ? (
            <>
              <Divider />
              <Row
                label="Valor por mayor"
                value={pesosFormat(product.valor_mayor)}
              />
              <Row
                label="Costos fijos"
                value={pesosFormat(product.valor_costos_fijos)}
              />
            </>
          ) : null}
          <Divider />
          <Row label="Tipo" value={product.tipo_producto || "—"} />
          <Row
            label="Unidades disponibles"
            value={String(product.unidades_disponibles)}
            strong
          />
        </Card>

        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Button
            title="Ingresar"
            variant="secondary"
            style={{ flex: 1 }}
            left={<Icon name="plus" size={18} color={colors.text} />}
            onPress={() => goEditStock("agg")}
          />
          <Button
            title="Retirar"
            variant="secondary"
            style={{ flex: 1 }}
            left={<Icon name="minus" size={18} color={colors.text} />}
            onPress={() => goEditStock("decreased")}
          />
        </View>

        {product.detalles ? (
          <Card level={0}>
            <Text
              variant="small"
              weight="bold"
              muted
              style={{ marginBottom: 4 }}
            >
              DETALLES
            </Text>
            <Text>{product.detalles}</Text>
          </Card>
        ) : null}

        <Card level={0} style={{ alignItems: "center", gap: spacing.sm }}>
          <Image
            source={{ uri: barcodeUrl }}
            style={{ width: 260, height: 120, resizeMode: "contain" }}
          />
          {isWeb ? (
            <Button
              title="Descargar PDF"
              variant="ghost"
              fullWidth={false}
              left={
                <Icon name="file-pdf-box" size={18} color={colors.primary} />
              }
              onPress={() => setPdfSheet(true)}
            />
          ) : null}
        </Card>

        <View
          style={{
            flexDirection: "row",
            gap: spacing.md,
            marginTop: spacing.sm,
          }}
        >
          <Button
            title="Eliminar"
            variant="danger"
            style={{ flex: 1 }}
            left={
              <Icon
                name="trash-can-outline"
                size={18}
                color={colors.textOnBrand}
              />
            }
            onPress={() => setConfirmDelete(true)}
          />
          <Button
            title="Editar"
            style={{ flex: 2 }}
            left={
              <Icon
                name="pencil-outline"
                size={18}
                color={colors.textOnBrand}
              />
            }
            onPress={() =>
              router.push({
                pathname: "/products/editProduct",
                params: { product: JSON.stringify(product) },
              })
            }
          />
        </View>
      </View>

      <Sheet
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Eliminar producto"
      >
        <Text muted>
          ¿Seguro que quieres eliminar “{product.nombre}”? Esta acción no se
          puede deshacer.
        </Text>
        <Button
          title="Sí, eliminar"
          variant="danger"
          loading={deleting}
          onPress={onDelete}
        />
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => setConfirmDelete(false)}
        />
      </Sheet>

      <Sheet
        visible={pdfSheet}
        onClose={() => setPdfSheet(false)}
        title="Tamaño de la etiqueta"
      >
        {SIZE_OPTIONS.map((size) => (
          <Button
            key={size}
            title={`${size} mm`}
            variant="secondary"
            onPress={() => onPickPdfSize(size)}
          />
        ))}
      </Sheet>

      <ImageModal
        visible={!!selectedImage}
        imageUri={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </Screen>
  );
}
