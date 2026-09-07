import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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
// ease-out fuerte para UI (skill animate-expo: los Easing de fábrica son débiles)
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const FALLBACK_IMG =
  "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

const esReciente = (fecha) => {
  if (!fecha) return false;
  return (Date.now() - new Date(fecha).getTime()) / 86400000 <= 15;
};

// Tarjeta de producto con press-feedback. Va a nivel de módulo para poder usar
// hooks de animación dentro de un renderItem de FlatList.
// Motion: feedback, decenas de veces/día -> escala imperceptible <150ms, sin
// tocar la sombra (elevation re-renderiza cada frame en Android).
function CatalogCard({ item, width, gutter, onOpen, onQuickAdd }) {
  const { colors, spacing, radii, shadow } = useTheme();
  const reduced = useReducedMotion();

  const cardScale = useSharedValue(1);
  const addScale = useSharedValue(1);
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));
  const addStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addScale.value }],
  }));

  const press = (sv, to, ms) => {
    sv.value = withTiming(reduced && to < 1 ? 1 : to, {
      duration: ms,
      easing: EASE_OUT,
    });
  };

  const uri = mediaUrl(item?.image_principal) || FALLBACK_IMG;

  return (
    <View style={{ width, padding: gutter }}>
      <Pressable
        onPress={() => onOpen(item.id)}
        onPressIn={() => press(cardScale, 0.97, 120)}
        onPressOut={() => press(cardScale, 1, 140)}
        pressRetentionOffset={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
            },
            shadow(1),
            cardStyle,
          ]}
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
              onPress={() => onQuickAdd(item)}
              onPressIn={() => press(addScale, 0.9, 90)}
              onPressOut={() => press(addScale, 1, 120)}
              hitSlop={8}
              style={{
                position: "absolute",
                right: spacing.sm,
                bottom: spacing.sm,
              }}
            >
              <Animated.View
                style={[
                  {
                    width: 36,
                    height: 36,
                    borderRadius: radii.pill,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  shadow(2),
                  addStyle,
                ]}
              >
                <Icon name="plus" size={20} color={colors.textOnBrand} />
              </Animated.View>
            </Pressable>
          </View>

          <View style={{ padding: spacing.md, gap: spacing.xxs }}>
            {item.tipo_producto ? (
              <Text variant="caption" muted style={{ letterSpacing: 1 }}>
                {String(item.tipo_producto).toUpperCase()}
              </Text>
            ) : null}
            <Text weight="medium" numberOfLines={1}>
              {item.nombre}
            </Text>
            <Text
              variant="subtitle"
              weight="bold"
              color="primary"
              style={{ marginTop: spacing.xxs }}
            >
              {pesosFormat(item.valor)}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

export default function PrincipalCatalog({ name }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const { colors, spacing, radii, shadow } = useTheme();
  const { width, height } = useWindowDimensions();
  const { cartItems, addToCart } = useCart();
  const reduced = useReducedMotion();

  const cols = width >= 1100 ? 4 : width >= 720 ? 3 : 2;
  const gutter = spacing.sm;

  const [tipo, setTipo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);

  // Menú desplegable: apertura/salida controladas por un shared value en el hilo
  // de UI. Salida más rápida que la entrada; sin overshoot (un panel que hizo
  // fade no debe rebotar).
  const menu = useSharedValue(0);
  useEffect(() => {
    if (menuOpen) setMenuMounted(true);
    menu.value = withTiming(
      menuOpen ? 1 : 0,
      { duration: menuOpen ? 180 : 130, easing: EASE_OUT },
      (finished) => {
        "worklet";
        if (finished && !menuOpen) runOnJS(setMenuMounted)(false);
      },
    );
  }, [menuOpen, menu]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: menu.value }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: menu.value,
    transform: [{ translateY: reduced ? 0 : (menu.value - 1) * 8 }],
  }));
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${menu.value * 180}deg` }],
  }));

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
  const activeType = types.find((t) => t.id === tipo);
  const filterActive = tipo || menuOpen;

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

  const renderItem = ({ item }) => (
    <CatalogCard
      item={item}
      width={`${100 / cols}%`}
      gutter={gutter}
      onOpen={openProduct}
      onQuickAdd={quickAdd}
    />
  );

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
        style={[
          {
            padding: 4,
            borderRadius: radii.pill,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          },
          shadow(1),
        ]}
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
      <Text variant="caption" weight="bold" muted style={{ letterSpacing: 1 }}>
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
              borderColor: filterActive ? colors.primary : colors.border,
              backgroundColor: filterActive
                ? colors.primarySoft
                : colors.surface,
            }}
          >
            <Icon
              name="shape-outline"
              size={16}
              color={filterActive ? colors.primary : colors.textMuted}
            />
            <Animated.View style={chevronStyle}>
              <Icon
                name="chevron-down"
                size={16}
                color={filterActive ? colors.primary : colors.textMuted}
              />
            </Animated.View>
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
            style={[
              {
                position: "absolute",
                top: NAV_H,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colors.overlay,
                zIndex: 20,
              },
              backdropStyle,
            ]}
          >
            <Pressable style={{ flex: 1 }} onPress={() => setMenuOpen(false)} />
          </Animated.View>

          <Animated.View
            style={[
              {
                position: "absolute",
                top: NAV_H,
                left: 0,
                right: 0,
                zIndex: 25,
                backgroundColor: colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
              shadow(3),
              panelStyle,
            ]}
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
