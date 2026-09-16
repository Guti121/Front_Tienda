import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { searchAvailableProducts } from "../../api/products";
import { mediaUrl } from "../../api/config";
import { addToCart, useCart } from "../../hooks/useCart";
import { useTheme } from "../../theme/ThemeProvider";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  Loader,
  Screen,
  Sheet,
  Stepper,
  Text,
  TextField,
  useToast,
} from "../../ui";
import { pesosFormat } from "../icons/functionFormat";

const FALLBACK_IMG =
  "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

export default function Bill() {
  const router = useRouter();
  const toast = useToast();
  const { colors, spacing, radii } = useTheme();
  const { count, add } = useCart();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState(null); // producto para el Sheet
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["products", "available", debounced],
    queryFn: () => searchAvailableProducts(debounced),
    enabled: debounced.length > 0,
  });

  const products = useMemo(
    () => (Array.isArray(data) ? data : (data?.results ?? [])),
    [data],
  );

  const openProduct = (item) => {
    setSelected(item);
    setQty(1);
  };

  const confirmAdd = async () => {
    await add(
      {
        producto: selected.id,
        nombrePro: selected.nombre,
        valorPro: selected.valor,
        descuentoPct: Number(selected.descuento_porcentaje || 0),
      },
      qty,
    );
    toast.success(`${selected.nombre} · ${qty} u. en el carrito`);
    setSelected(null);
  };

  const renderItem = ({ item }) => {
    const uri = mediaUrl(item?.imagen_principal) || FALLBACK_IMG;
    const sinStock = !item.unidades_disponibles;
    const descuentoPct = Number(item.descuento_porcentaje || 0);
    return (
      <Pressable
        onPress={() => openProduct(item)}
        disabled={sinStock}
        style={{ width: "48%", opacity: sinStock ? 0.5 : 1 }}
      >
        <Card level={1} padded={false} style={{ overflow: "hidden" }}>
          <View>
            <Image
              source={{ uri }}
              style={{ width: "100%", height: 140, resizeMode: "cover" }}
            />
            {descuentoPct > 0 ? (
              <View style={{ position: "absolute", top: 6, left: 6 }}>
                <Badge label={`-${descuentoPct}%`} tone="danger" />
              </View>
            ) : null}
          </View>
          <View style={{ padding: spacing.md, gap: spacing.xs }}>
            <Text weight="medium" numberOfLines={1}>
              {item.nombre}
            </Text>
            {descuentoPct > 0 ? (
              <>
                <Text
                  variant="small"
                  muted
                  style={{ textDecorationLine: "line-through" }}
                >
                  {pesosFormat(item.valor)}
                </Text>
                <Text weight="bold" color="primary">
                  {pesosFormat(item.valor_con_descuento)}
                </Text>
              </>
            ) : (
              <Text weight="bold" color="primary">
                {pesosFormat(item.valor)}
              </Text>
            )}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Badge
                label={`${item.unidades_disponibles} u.`}
                tone={item.unidades_disponibles > 3 ? "success" : "warning"}
              />
              <Text variant="caption" muted>
                #{item.numero_producto}
              </Text>
            </View>
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <Screen padded={false}>
      <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar producto"
          left={<Icon name="magnify" size={20} color={colors.textMuted} />}
          right={
            <Icon
              name="barcode-scan"
              size={22}
              color={colors.primary}
              onPress={() => router.push("/modals/modalBarCode")}
            />
          }
        />
      </View>

      {isFetching && products.length === 0 ? <Loader fill={false} /> : null}

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: spacing.lg,
        }}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          isFetching ? null : (
            <View style={{ padding: spacing.xl }}>
              <EmptyState
                icon={isError ? "alert-circle-outline" : "magnify"}
                title={
                  isError
                    ? "No se pudo buscar"
                    : debounced
                      ? "Sin resultados"
                      : "Busca un producto"
                }
                message={
                  isError
                    ? "Revisa tu conexión e inténtalo de nuevo."
                    : debounced
                      ? "Prueba con otro nombre o número."
                      : "Escribe el nombre o escanea el código de barras."
                }
              />
            </View>
          )
        }
        renderItem={renderItem}
      />

      {/* FAB carrito */}
      <Pressable
        onPress={() => router.push("/modals/modalCarDrawer")}
        style={{
          position: "absolute",
          right: spacing.lg,
          bottom: spacing.xl,
          width: 60,
          height: 60,
          borderRadius: radii.pill,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="cart-outline" size={26} color={colors.textOnBrand} />
        {count > 0 ? (
          <View
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              minWidth: 22,
              height: 22,
              paddingHorizontal: 4,
              borderRadius: radii.pill,
              backgroundColor: colors.danger,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: colors.bg,
            }}
          >
            <Text variant="caption" weight="bold" color={colors.textOnBrand}>
              {count}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <Sheet
        visible={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.nombre ?? ""}
      >
        {selected ? (
          <>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text muted>Precio unitario</Text>
              {Number(selected.descuento_porcentaje || 0) > 0 ? (
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    variant="small"
                    muted
                    style={{ textDecorationLine: "line-through" }}
                  >
                    {pesosFormat(selected.valor)}
                  </Text>
                  <Text weight="bold">
                    {pesosFormat(selected.valor_con_descuento)}{" "}
                    <Text variant="caption" color="danger">
                      -{Number(selected.descuento_porcentaje)}%
                    </Text>
                  </Text>
                </View>
              ) : (
                <Text weight="bold">{pesosFormat(selected.valor)}</Text>
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text muted>Cantidad</Text>
              <Stepper
                value={qty}
                onChange={setQty}
                max={selected.unidades_disponibles}
              />
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text muted>Subtotal</Text>
              <Text weight="bold" color="primary">
                {pesosFormat(
                  Number(
                    selected.descuento_porcentaje > 0
                      ? selected.valor_con_descuento
                      : selected.valor,
                  ) * qty,
                )}
              </Text>
            </View>
            <Button title="Agregar al carrito" onPress={confirmAdd} />
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

// Compat: modalBarCode.jsx importa `getArrayCar` desde aquí.
export const getArrayCar = async (producto, cantidad, valorPro, nombrePro) => {
  await addToCart({ producto, nombrePro, valorPro }, cantidad);
};
