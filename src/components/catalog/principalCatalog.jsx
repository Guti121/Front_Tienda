import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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
import { Badge, EmptyState, Icon, Loader, Text, useToast } from "../../ui";
import { pesosFormat } from "../icons/functionFormat";

const MAX_W = 1160;
const NAV_H = 52;
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
  const { width, height } = useWindowDimensions();
  const { cartItems, addToCart } = useCart();

  const cols = width >= 1100 ? 4 : width >= 720 ? 3 : 2;
  const gutter = spacing.sm;

  const [tipo, setTipo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const companyQ = useQuery({
    queryKey: ["catalog", "company", name],
    queryFn: () => getCatalogCompany(name),
    enabled: !!name,
  });
  const company = companyQ.data;

  useEffect(() => {
    if (company) dispatch(setEmpresa(company));
  }, [company, dispatch]);

  useEffect(() => {
    if (menuOpen) {
      setMenuMounted(true);
      Animated.timing(menuAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 130,
        useNativeDriver: true,
      }).start(({ finished }) => finished && setMenuMounted(false));
    }
  }, [menuOpen, menuAnim]);

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
  const activeType = types.find((t) => t.id === tipo);

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

  const pickType = (id) => {
    setTipo(id);
    setMenuOpen(false);
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
        paddingBottom: spacing.lg,
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
      {activeType ? (
        <View style={{ marginTop: spacing.md }}>
          <Badge
            label={`Categoría: ${activeType.tipo_producto}`}
            tone="brand"
          />
        </View>
      ) : null}
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

  const catRow = (key, label, selected, onPress) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
        backgroundColor: pressed ? colors.surfaceAlt : "transparent",
        borderRadius: radii.sm,
      })}
    >
      <Text
        weight={selected ? "bold" : "regular"}
        color={selected ? "primary" : "text"}
      >
        {label}
      </Text>
      {selected ? <Icon name="check" size={18} color={colors.primary} /> : null}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Navbar de tienda */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          height: NAV_H,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          zIndex: 30,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Image
            source={{ uri: mediaUrl(company?.url_logo) || FALLBACK_IMG }}
            style={{ width: 26, height: 26, borderRadius: radii.pill }}
          />
          <Text weight="bold" numberOfLines={1} style={{ flexShrink: 1 }}>
            {company?.company || name}
          </Text>
        </View>

        {types.length > 0 ? (
          <Pressable
            onPress={() => setMenuOpen((v) => !v)}
            hitSlop={6}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.sm,
              borderRadius: radii.pill,
              borderWidth: 1,
              borderColor: tipo || menuOpen ? colors.primary : colors.border,
              backgroundColor:
                tipo || menuOpen ? colors.primarySoft : colors.surface,
            }}
          >
            <Icon
              name="shape-outline"
              size={16}
              color={tipo || menuOpen ? colors.primary : colors.textMuted}
            />
            <Icon
              name={menuOpen ? "chevron-up" : "chevron-down"}
              size={16}
              color={tipo || menuOpen ? colors.primary : colors.textMuted}
            />
          </Pressable>
        ) : null}

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

      {/* Menú desplegable de categorías, anclado bajo el navbar */}
      {menuMounted ? (
        <>
          <Animated.View
            style={{
              position: "absolute",
              top: NAV_H,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.overlay,
              opacity: menuAnim,
              zIndex: 20,
            }}
          >
            <Pressable style={{ flex: 1 }} onPress={() => setMenuOpen(false)} />
          </Animated.View>

          <Animated.View
            style={{
              position: "absolute",
              top: NAV_H,
              left: 0,
              right: 0,
              zIndex: 25,
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              opacity: menuAnim,
              transform: [
                {
                  translateY: menuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-8, 0],
                  }),
                },
              ],
              ...shadow(3),
            }}
          >
            <View
              style={{
                width: "100%",
                maxWidth: MAX_W,
                alignSelf: "center",
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.md,
                paddingBottom: spacing.sm,
              }}
            >
              <Text
                variant="caption"
                weight="bold"
                muted
                style={{ letterSpacing: 1 }}
              >
                CATEGORÍAS
              </Text>
              <ScrollView
                style={{ maxHeight: height * 0.55, marginTop: spacing.xs }}
                showsVerticalScrollIndicator={false}
              >
                {catRow("all", "Todas", !tipo, () => pickType(null))}
                {types.map((t) => (
                  <View key={t.id}>
                    <View
                      style={{ height: 1, backgroundColor: colors.border }}
                    />
                    {catRow(t.id, t.tipo_producto, tipo === t.id, () =>
                      pickType(t.id),
                    )}
                  </View>
                ))}
                <View style={{ height: spacing.xs }} />
              </ScrollView>
            </View>
          </Animated.View>
        </>
      ) : null}
    </View>
  );
}
