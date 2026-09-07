import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
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
import { mediaUrl } from "../../api/config";
import { setEmpresa } from "../../redux/userSlice";
import { useCart } from "./CartContext";
import { useTheme } from "../../theme/ThemeProvider";
import {
  Badge,
  Chip,
  EmptyState,
  Icon,
  Loader,
  Text,
  useToast,
} from "../../ui";
import { pesosFormat } from "../icons/functionFormat";

const MAX_W = 1160;
const FALLBACK_IMG =
  "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

const esReciente = (fecha) => {
  if (!fecha) return false;
  return (Date.now() - new Date(fecha).getTime()) / 86400000 <= 15;
};

export default function PrincipalCatalog({ name }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const { colors, spacing, radii, shadow } = useTheme();
  const { width } = useWindowDimensions();
  const { cartItems, addToCart } = useCart();

  const cols = width >= 1100 ? 4 : width >= 720 ? 3 : 2;
  const gutter = spacing.sm;

  const [tipo, setTipo] = useState(null);

  const companyQ = useQuery({
    queryKey: ["catalog", "company", name],
    queryFn: () => getCatalogCompany(name),
    enabled: !!name,
  });
  const company = companyQ.data;

  useEffect(() => {
    if (company) dispatch(setEmpresa(company));
  }, [company, dispatch]);

  const productsQ = useInfiniteQuery({
    queryKey: ["catalog", "list", name, tipo],
    queryFn: ({ pageParam }) => listCatalog({ name, tipo, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last?.next ? pages.length + 1 : undefined,
    enabled: !!name,
  });

  const typesQ = useQuery({
    queryKey: ["catalog", "types", name],
    queryFn: () => listCatalogTypes({ name, page: 1 }),
    enabled: !!name,
  });

  const products = useMemo(
    () => (productsQ.data?.pages ?? []).flatMap((p) => p?.results ?? []),
    [productsQ.data],
  );
  const types = typesQ.data?.results ?? [];
  const cartCount = cartItems.reduce((n, it) => n + (it.cantidad || 1), 0);

  const openProduct = (id) =>
    router.push({ pathname: "/catalog/productDetail", params: { id, name } });

  const quickAdd = (item) => {
    addToCart({
      id: item.id,
      nombre: item.nombre,
      valor: item.valor,
      numero_producto: item.numero_producto,
      imagenes: [{ imagen: item.image_principal }],
      cantidad: 1,
    });
    toast.success("Añadido al carrito");
  };

  const renderItem = ({ item }) => {
    const uri = mediaUrl(item?.image_principal) || FALLBACK_IMG;
    return (
      <View style={{ width: `${100 / cols}%`, padding: gutter }}>
        <Pressable
          onPress={() => openProduct(item.id)}
          style={({ pressed }) => ({
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
            transform: [{ translateY: pressed ? -1 : 0 }],
            ...(pressed ? shadow(2) : shadow(1)),
          })}
        >
          <View style={{ backgroundColor: colors.surfaceAlt }}>
            <Image
              source={{ uri }}
              style={{ width: "100%", aspectRatio: 1, resizeMode: "cover" }}
            />
            {esReciente(item.creado_en) ? (
              <View
                style={{
                  position: "absolute",
                  top: spacing.sm,
                  left: spacing.sm,
                }}
              >
                <Badge label="Nuevo" tone="brand" />
              </View>
            ) : null}
            <Pressable
              onPress={() => quickAdd(item)}
              hitSlop={6}
              style={{
                position: "absolute",
                right: spacing.sm,
                bottom: spacing.sm,
                width: 36,
                height: 36,
                borderRadius: radii.pill,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                ...shadow(2),
              }}
            >
              <Icon name="plus" size={20} color={colors.textOnBrand} />
            </Pressable>
          </View>

          <View style={{ padding: spacing.md, gap: 2 }}>
            {item.tipo_producto ? (
              <Text variant="caption" muted style={{ letterSpacing: 0.5 }}>
                {String(item.tipo_producto).toUpperCase()}
              </Text>
            ) : null}
            <Text weight="medium" numberOfLines={1}>
              {item.nombre}
            </Text>
            <Text variant="subtitle" weight="bold" color="primary">
              {pesosFormat(item.valor)}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };

  const Hero = (
    <View
      style={{
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
      }}
    >
      <View
        style={{
          padding: 4,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          ...shadow(1),
        }}
      >
        <Image
          source={{ uri: mediaUrl(company?.url_logo) || FALLBACK_IMG }}
          style={{ width: 96, height: 96, borderRadius: radii.pill }}
        />
      </View>
      <Text
        variant="display"
        weight="bold"
        center
        style={{ marginTop: spacing.md }}
      >
        {company?.company || name}
      </Text>
      {company?.municipality ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            marginTop: spacing.xs,
          }}
        >
          <Icon name="map-marker-outline" size={15} color={colors.textMuted} />
          <Text variant="small" muted>
            {company.municipality}
          </Text>
        </View>
      ) : null}

      {types.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: spacing.sm,
            paddingVertical: spacing.lg,
          }}
          style={{ alignSelf: "stretch", marginTop: spacing.sm }}
        >
          <Chip label="Todos" selected={!tipo} onPress={() => setTipo(null)} />
          {types.map((t) => (
            <Chip
              key={t.id}
              label={t.tipo_producto}
              selected={tipo === t.id}
              onPress={() => setTipo(tipo === t.id ? null : t.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={{ height: spacing.lg }} />
      )}
    </View>
  );

  const Footer = company ? (
    <View
      style={{
        marginTop: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: spacing.lg,
        gap: spacing.sm,
      }}
    >
      <Text
        variant="caption"
        weight="bold"
        muted
        style={{ letterSpacing: 0.5 }}
      >
        CONTACTO
      </Text>
      {[
        ["phone-outline", company.phone],
        ["email-outline", company.email],
        [
          "map-marker-outline",
          [company.direction, company.municipality].filter(Boolean).join(", "),
        ],
      ]
        .filter(([, v]) => v)
        .map(([icon, v]) => (
          <View
            key={icon}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
            }}
          >
            <Icon name={icon} size={16} color={colors.textMuted} />
            <Text variant="small" muted>
              {v}
            </Text>
          </View>
        ))}
    </View>
  ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Barra superior tipo navbar de tienda */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.lg,
          height: 52,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          zIndex: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Image
            source={{ uri: mediaUrl(company?.url_logo) || FALLBACK_IMG }}
            style={{ width: 26, height: 26, borderRadius: radii.pill }}
          />
          <Text weight="bold" numberOfLines={1}>
            {company?.company || name}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/catalog/car")}
          hitSlop={8}
          style={{ padding: spacing.xs }}
        >
          <Icon name="cart-outline" size={22} color={colors.text} />
          {cartCount > 0 ? (
            <View
              style={{
                position: "absolute",
                top: -2,
                right: -2,
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

      <FlatList
        data={products}
        key={cols}
        numColumns={cols}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          width: "100%",
          maxWidth: MAX_W,
          alignSelf: "center",
          paddingHorizontal: spacing.md - gutter,
          paddingBottom: spacing.xxl,
        }}
        ListHeaderComponent={Hero}
        ListFooterComponent={
          productsQ.isFetchingNextPage ? (
            <Loader fill={false} />
          ) : products.length > 0 ? (
            Footer
          ) : null
        }
        ListEmptyComponent={
          productsQ.isLoading ? (
            <Loader />
          ) : (
            <View style={{ paddingVertical: spacing.xxl }}>
              <EmptyState
                icon="storefront-outline"
                title={tipo ? "Nada en esta categoría" : "Catálogo vacío"}
                message={
                  tipo
                    ? "Prueba con otra categoría."
                    : "Esta tienda aún no publicó productos."
                }
              />
            </View>
          )
        }
        onEndReached={() => productsQ.hasNextPage && productsQ.fetchNextPage()}
        onEndReachedThreshold={0.5}
        renderItem={renderItem}
      />
    </View>
  );
}
