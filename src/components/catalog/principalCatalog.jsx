import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getCatalogCompany,
  listCatalog,
  listCatalogTypes,
} from "../../api/catalog";
import { setEmpresa } from "../../redux/userSlice";
import { useCart } from "./CartContext";
import { useTheme } from "../../theme/ThemeProvider";
import { Badge, Card, EmptyState, Icon, Loader, Sheet, Text } from "../../ui";
import { pesosFormat } from "../icons/functionFormat";

const FALLBACK_IMG =
  "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

const esReciente = (fecha) => {
  if (!fecha) return false;
  return (Date.now() - new Date(fecha).getTime()) / 86400000 <= 15;
};

export default function PrincipalCatalog({ name }) {
  const dispatch = useDispatch();
  const { colors, spacing, radii } = useTheme();
  const { width } = useWindowDimensions();
  const { cartItems } = useCart();
  const numColumns = width > 900 ? 4 : width > 600 ? 3 : 2;

  const [tipo, setTipo] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const companyQ = useQuery({
    queryKey: ["catalog", "company", name],
    queryFn: () => getCatalogCompany(name),
    enabled: !!name,
  });

  useEffect(() => {
    if (companyQ.data) dispatch(setEmpresa(companyQ.data));
  }, [companyQ.data, dispatch]);

  const productsQ = useInfiniteQuery({
    queryKey: ["catalog", "list", name, tipo],
    queryFn: ({ pageParam }) => listCatalog({ name, tipo, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last?.next ? pages.length + 1 : undefined,
    enabled: !!name,
  });

  const typesQ = useInfiniteQuery({
    queryKey: ["catalog", "types", name],
    queryFn: ({ pageParam }) => listCatalogTypes({ name, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last?.next ? pages.length + 1 : undefined,
    enabled: !!name && filterOpen,
  });

  const products = useMemo(
    () => (productsQ.data?.pages ?? []).flatMap((p) => p?.results ?? []),
    [productsQ.data],
  );
  const types = useMemo(
    () => (typesQ.data?.pages ?? []).flatMap((p) => p?.results ?? []),
    [typesQ.data],
  );
  const cartCount = cartItems.reduce((n, it) => n + (it.cantidad || 1), 0);

  const company = companyQ.data;

  const renderItem = ({ item }) => {
    const uri = item?.image_principal?.trim()
      ? item.image_principal
      : FALLBACK_IMG;
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/catalog/productDetail",
            params: { id: item.id, name },
          })
        }
        style={{ width: `${100 / numColumns - 3}%`, margin: "1.5%" }}
      >
        <Card level={1} padded={false} style={{ overflow: "hidden" }}>
          <View>
            <Image
              source={{ uri }}
              style={{ width: "100%", height: 150, resizeMode: "cover" }}
            />
            {esReciente(item.creado_en) ? (
              <View style={{ position: "absolute", top: 6, left: 6 }}>
                <Badge label="Nuevo" tone="brand" />
              </View>
            ) : null}
          </View>
          <View style={{ padding: spacing.md, gap: spacing.xxs }}>
            <Text weight="medium" numberOfLines={1}>
              {item.nombre}
            </Text>
            <Text weight="bold" color="primary">
              {pesosFormat(item.valor)}
            </Text>
            <Text variant="caption" muted>
              #{item.numero_producto}
            </Text>
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={products}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={
          numColumns > 1 ? { paddingHorizontal: spacing.sm } : undefined
        }
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 110 }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
            <Card level={0}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                }}
              >
                <Image
                  source={{ uri: company?.url_logo || FALLBACK_IMG }}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                />
                <View style={{ flex: 1 }}>
                  <Text weight="bold" numberOfLines={1}>
                    {company?.company || name}
                  </Text>
                  <Text variant="small" muted>
                    {company?.municipality || ""}
                  </Text>
                </View>
              </View>
            </Card>
            <Pressable
              onPress={() => setFilterOpen(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                alignSelf: "flex-start",
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: radii.pill,
                borderWidth: 1,
                borderColor: tipo ? colors.primary : colors.border,
                backgroundColor: tipo ? colors.primarySoft : colors.surface,
              }}
            >
              <Icon
                name="tune-variant"
                size={16}
                color={tipo ? colors.primary : colors.textMuted}
              />
              <Text variant="small" color={tipo ? "primary" : "textMuted"}>
                {tipo ? "Filtro activo" : "Filtrar por tipo"}
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          productsQ.isLoading ? (
            <Loader />
          ) : (
            <EmptyState
              icon="storefront-outline"
              title="Sin productos"
              message="Este catálogo aún no tiene productos publicados."
            />
          )
        }
        onEndReached={() => productsQ.hasNextPage && productsQ.fetchNextPage()}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          productsQ.isFetchingNextPage ? <Loader fill={false} /> : null
        }
        renderItem={renderItem}
      />

      <Pressable
        onPress={() => router.push("/catalog/car")}
        style={{
          position: "absolute",
          right: spacing.lg,
          bottom: spacing.xl,
          width: 58,
          height: 58,
          borderRadius: radii.pill,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="cart-outline" size={24} color={colors.textOnBrand} />
        {cartCount > 0 ? (
          <View
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              minWidth: 20,
              height: 20,
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
              {cartCount}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <Sheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filtrar por tipo"
      >
        <View style={{ maxHeight: 320 }}>
          <Pressable
            onPress={() => {
              setTipo(null);
              setFilterOpen(false);
            }}
            style={{ paddingVertical: spacing.md }}
          >
            <Text
              weight={tipo ? "regular" : "bold"}
              color={tipo ? "text" : "primary"}
            >
              Todos
            </Text>
          </Pressable>
          <FlatList
            data={types}
            keyExtractor={(it) => String(it.id)}
            onEndReached={() => typesQ.hasNextPage && typesQ.fetchNextPage()}
            onEndReachedThreshold={0.4}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setTipo(item.id);
                  setFilterOpen(false);
                }}
                style={{ paddingVertical: spacing.md }}
              >
                <Text
                  weight={tipo === item.id ? "bold" : "regular"}
                  color={tipo === item.id ? "primary" : "text"}
                >
                  {item.tipo_producto}
                </Text>
              </Pressable>
            )}
          />
        </View>
      </Sheet>
    </View>
  );
}
