import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";

import { listProductsAdmin } from "../../../api/products";
import { mediaUrl } from "../../../api/config";
import { useTheme } from "../../../theme/ThemeProvider";
import {
  Badge,
  Card,
  EmptyState,
  Icon,
  Loader,
  Text,
  TextField,
} from "../../../ui";
import { pesosFormat } from "../../icons/functionFormat";

const FALLBACK_IMG =
  "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

// Listado de productos (vista admin). Paginado incremental con React Query.
export default function ProductView() {
  const params = useLocalSearchParams();
  const order =
    params?.returnedValue != null ? String(params.returnedValue) : "";
  const { colors, spacing } = useTheme();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", "admin", debounced, order],
    queryFn: ({ pageParam }) =>
      listProductsAdmin({ q: debounced, order, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage?.next ? pages.length + 1 : undefined,
  });

  const items = useMemo(
    () =>
      (data?.pages ?? []).flatMap((p) =>
        Array.isArray(p) ? p : (p?.results ?? []),
      ),
    [data],
  );

  const renderItem = ({ item }) => {
    const uri = mediaUrl(item?.imagen_principal) || FALLBACK_IMG;
    const agotado = !item.unidades_disponibles;
    const descuentoPct = Number(item.descuento_porcentaje || 0);
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/products/detailProduct",
            params: { id: item.id },
          })
        }
        style={{ marginBottom: spacing.sm }}
      >
        <Card level={1}>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Image
              source={{ uri }}
              style={{
                width: 76,
                height: 76,
                borderRadius: 10,
                resizeMode: "cover",
              }}
            />
            <View style={{ flex: 1, gap: spacing.xs }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.xs,
                }}
              >
                <Text weight="medium" numberOfLines={1} style={{ flex: 1 }}>
                  {item.nombre}
                </Text>
                {descuentoPct > 0 ? (
                  <Badge label={`-${descuentoPct}%`} tone="danger" />
                ) : null}
              </View>
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
                style={{
                  flexDirection: "row",
                  gap: spacing.sm,
                  alignItems: "center",
                }}
              >
                {agotado ? (
                  <Badge label="Agotado" tone="danger" />
                ) : (
                  <Badge
                    label={`${item.unidades_disponibles} u.`}
                    tone={item.unidades_disponibles > 3 ? "success" : "warning"}
                  />
                )}
                <Text variant="caption" muted>
                  #{item.numero_producto}
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textFaint} />
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          flexDirection: "row",
          gap: spacing.sm,
          padding: spacing.lg,
          paddingBottom: spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar producto"
            left={<Icon name="magnify" size={20} color={colors.textMuted} />}
          />
        </View>
        <Pressable
          onPress={() => router.push("/modals/modalFilterProductIcon")}
          style={{
            width: 46,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: order ? colors.primary : colors.border,
            backgroundColor: order ? colors.primarySoft : colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name="tune-variant"
            size={20}
            color={order ? colors.primary : colors.textMuted}
          />
        </Pressable>
      </View>

      {isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xl,
          }}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage ? <Loader fill={false} /> : null
          }
          ListEmptyComponent={
            <View style={{ paddingVertical: spacing.xxl }}>
              <EmptyState
                icon={isError ? "alert-circle-outline" : "package-variant"}
                title={isError ? "No se pudo cargar" : "Sin productos"}
                message={
                  isError
                    ? "Revisa tu conexión e inténtalo de nuevo."
                    : debounced
                      ? "Prueba con otro nombre."
                      : "Aún no hay productos en el almacén."
                }
              />
            </View>
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}
