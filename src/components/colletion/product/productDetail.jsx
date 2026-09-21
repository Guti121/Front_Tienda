import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import {
  retrieveProduct,
  getBarcode,
  deleteProduct,
} from "../../../api/products";
import {
  createDiscount,
  listDiscounts,
  updateDiscount,
} from "../../../api/discounts";
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
  TextField,
  useToast,
} from "../../../ui";
import { ModalCalendar } from "../../themeStyles/modalsCalendar";
import { pesosFormat } from "../../icons/functionFormat";
import ImageModal from "./imageModal";
import LabelPrintSheet from "./labelPrintSheet";

const FALLBACK_IMG =
  "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

function Row({ label, value, strong, strike }) {
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
        muted={strike}
        style={strike ? { textDecorationLine: "line-through" } : undefined}
      >
        {value}
      </Text>
    </View>
  );
}

const isoDate = (d) => (d ? String(d).split("T")[0] : "");

export default function DetailProduct({ id }) {
  const { colors, spacing, radii } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.user.user);
  const isCreator = user?.typeUser === "creator";
  const canManageDiscount = isCreator || user?.typeUser === "admin";

  const [selectedImage, setSelectedImage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [labelSheet, setLabelSheet] = useState(false);

  const [promoSheet, setPromoSheet] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null); // null = crear
  const [pctTxt, setPctTxt] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [calendarField, setCalendarField] = useState(null); // "inicio" | "fin" | null
  const [savingPromo, setSavingPromo] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

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

  const { data: discounts } = useQuery({
    queryKey: ["discounts", id],
    queryFn: () => listDiscounts(id),
    enabled: !!id && canManageDiscount,
  });

  const barcodeUrl = mediaUrl(barcode?.barcode) || FALLBACK_IMG;
  const discountList = Array.isArray(discounts)
    ? discounts
    : (discounts?.results ?? []);
  const promoVigente = discountList.find((d) => d.vigente) || null;

  const openCreatePromo = () => {
    setEditingDiscount(null);
    setPctTxt("");
    setFechaInicio(isoDate(new Date().toISOString()));
    setFechaFin("");
    setPromoSheet(true);
  };

  const openEditPromo = (d) => {
    setEditingDiscount(d);
    setPctTxt(String(d.porcentaje));
    setFechaInicio(isoDate(d.fecha_inicio));
    setFechaFin(isoDate(d.fecha_fin));
    setPromoSheet(true);
  };

  const savePromo = async () => {
    const porcentaje = parseFloat(pctTxt);
    if (!porcentaje || porcentaje <= 0 || porcentaje > 100) {
      toast.error("El % debe estar entre 0 y 100.");
      return;
    }
    if (!fechaInicio || !fechaFin) {
      toast.error("Elige fecha de inicio y fin.");
      return;
    }
    setSavingPromo(true);
    try {
      const payload = {
        producto: id,
        porcentaje,
        fecha_inicio: new Date(`${fechaInicio}T00:00:00`).toISOString(),
        fecha_fin: new Date(`${fechaFin}T23:59:59`).toISOString(),
      };
      if (editingDiscount) {
        await updateDiscount(editingDiscount.id, payload);
      } else {
        await createDiscount(payload);
      }
      queryClient.invalidateQueries({ queryKey: ["discounts", id] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      toast.success(
        editingDiscount ? "Promoción actualizada" : "Promoción creada",
      );
      setPromoSheet(false);
    } catch (err) {
      toast.error(err?.message || "No se pudo guardar la promoción.");
    } finally {
      setSavingPromo(false);
    }
  };

  const desactivarPromo = async () => {
    if (!promoVigente) return;
    setDeactivating(true);
    try {
      await updateDiscount(promoVigente.id, { activo: false });
      queryClient.invalidateQueries({ queryKey: ["discounts", id] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      toast.success("Promoción desactivada");
    } catch (err) {
      toast.error(err?.message || "No se pudo desactivar.");
    } finally {
      setDeactivating(false);
    }
  };

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
          {Number(product.descuento_porcentaje || 0) > 0 ? (
            <>
              <Row
                label="Valor de venta"
                value={pesosFormat(product.valor)}
                strike
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                  }}
                >
                  <Text muted>Precio con descuento</Text>
                  <Badge
                    label={`-${Number(product.descuento_porcentaje)}%`}
                    tone="danger"
                  />
                </View>
                <Text weight="bold" color="primary">
                  {pesosFormat(product.valor_con_descuento)}
                </Text>
              </View>
            </>
          ) : (
            <Row
              label="Valor de venta"
              value={pesosFormat(product.valor)}
              strong
            />
          )}
          {isCreator ? (
            <>
              <Divider />
              <Row
                label="Valor Coste"
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

        {canManageDiscount ? (
          <Card level={0}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                marginBottom: spacing.xs,
              }}
            >
              <Icon name="tag-outline" size={18} color={colors.primary} />
              <Text weight="bold">Promoción</Text>
            </View>
            {promoVigente ? (
              <>
                <Text>
                  Promoción activa: {Number(promoVigente.porcentaje)}% OFF
                </Text>
                <Text variant="small" muted>
                  Vence {isoDate(promoVigente.fecha_fin)}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    gap: spacing.md,
                    marginTop: spacing.sm,
                  }}
                >
                  <Button
                    title="Editar"
                    variant="secondary"
                    style={{ flex: 1 }}
                    onPress={() => openEditPromo(promoVigente)}
                  />
                  <Button
                    title="Desactivar"
                    variant="danger"
                    style={{ flex: 1 }}
                    loading={deactivating}
                    onPress={desactivarPromo}
                  />
                </View>
              </>
            ) : (
              <>
                <Text muted>Sin promoción activa</Text>
                <Button
                  title="Crear promoción"
                  variant="secondary"
                  style={{ marginTop: spacing.sm }}
                  left={
                    <Icon
                      name="tag-plus-outline"
                      size={18}
                      color={colors.primary}
                    />
                  }
                  onPress={openCreatePromo}
                />
              </>
            )}
          </Card>
        ) : null}

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
          <Button
            title="Imprimir etiquetas"
            variant="ghost"
            fullWidth={false}
            left={
              <Icon name="printer-outline" size={18} color={colors.primary} />
            }
            onPress={() => setLabelSheet(true)}
          />
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
        visible={promoSheet}
        onClose={() => setPromoSheet(false)}
        title={editingDiscount ? "Editar promoción" : "Crear promoción"}
      >
        <TextField
          label="% de descuento"
          value={pctTxt}
          onChangeText={(t) => setPctTxt(t.replace(/[^0-9.]/g, ""))}
          placeholder="Ej. 20"
          keyboardType="numeric"
        />
        <View style={{ gap: spacing.xs }}>
          <Text variant="small" weight="medium" muted>
            Fecha de inicio
          </Text>
          <Pressable
            onPress={() => setCalendarField("inicio")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md,
              paddingHorizontal: spacing.md,
              minHeight: 46,
            }}
          >
            <Text>{fechaInicio || "Selecciona una fecha"}</Text>
            <Icon name="calendar-outline" size={20} color={colors.primary} />
          </Pressable>
        </View>
        <View style={{ gap: spacing.xs }}>
          <Text variant="small" weight="medium" muted>
            Fecha de fin
          </Text>
          <Pressable
            onPress={() => setCalendarField("fin")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md,
              paddingHorizontal: spacing.md,
              minHeight: 46,
            }}
          >
            <Text>{fechaFin || "Selecciona una fecha"}</Text>
            <Icon name="calendar-outline" size={20} color={colors.primary} />
          </Pressable>
        </View>
        <Button
          title={editingDiscount ? "Guardar cambios" : "Crear promoción"}
          loading={savingPromo}
          onPress={savePromo}
        />
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => setPromoSheet(false)}
        />
      </Sheet>

      <ModalCalendar
        state={calendarField === "inicio"}
        onClose={(d) => {
          setCalendarField(null);
          if (d) setFechaInicio(d);
        }}
      />
      <ModalCalendar
        state={calendarField === "fin"}
        onClose={(d) => {
          setCalendarField(null);
          if (d) setFechaFin(d);
        }}
      />

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

      <LabelPrintSheet
        visible={labelSheet}
        onClose={() => setLabelSheet(false)}
        items={[
          {
            id: product.id,
            nombre: product.nombre,
            valor: product.valor,
            code: barcode?.code,
            stock: product.unidades_disponibles,
          },
        ]}
      />

      <ImageModal
        visible={!!selectedImage}
        imageUri={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </Screen>
  );
}
