import { Image, Text, View } from "react-native";

import { Icon } from "../../../ui";

// Réplica a escala del storefront de `catalog-web` (hero + grid + pie), pintada
// solo con el tema resuelto y la fuente elegida. Sirve de vista previa en vivo
// dentro de "Apariencia del catálogo". Las medidas salen de la anatomía real
// (catalog-web/components/*), escaladas ~0.55.

const SAMPLE = [
  {
    cat: "Camisetas",
    name: "Camiseta oversize algodón",
    price: "$ 79.900",
    nuevo: true,
  },
  {
    cat: "Pantalones",
    name: "Jean recto azul medio",
    price: "$ 129.900",
    nuevo: false,
  },
];

function ProductMiniCard({ theme, font, item }) {
  const txt = (size, weight, color, extra) => [
    { fontSize: size, fontWeight: weight, color },
    font && { fontFamily: font },
    extra,
  ];
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.line,
        backgroundColor: theme.surface,
        overflow: "hidden",
      }}
    >
      <View style={{ aspectRatio: 1, backgroundColor: "#f1f5f9" }}>
        {item.nuevo ? (
          <View
            style={{
              position: "absolute",
              left: 6,
              top: 6,
              backgroundColor: theme.accentSoft,
              borderRadius: 999,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text style={txt(9, "700", theme.accent)}>Nuevo</Text>
          </View>
        ) : null}
        <View
          style={{
            position: "absolute",
            right: 6,
            bottom: 6,
            width: 24,
            height: 24,
            borderRadius: 999,
            backgroundColor: theme.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="plus" size={14} color={theme.accentFg} />
        </View>
      </View>
      <View style={{ padding: 8, gap: 1 }}>
        <Text
          style={txt(9, "600", theme.muted, {
            letterSpacing: 0.5,
            textTransform: "uppercase",
          })}
        >
          {item.cat}
        </Text>
        <Text numberOfLines={2} style={txt(12, "500", theme.ink)}>
          {item.name}
        </Text>
        <Text style={txt(14, "700", theme.ink, { marginTop: 2 })}>
          {item.price}
        </Text>
      </View>
    </View>
  );
}

export default function StorefrontPreview({
  theme,
  fontFamily,
  storeName,
  municipality,
  tagline,
  announcement,
  bannerUri,
  logoUri,
}) {
  const font = fontFamily;
  const txt = (size, weight, color, extra) => [
    { fontSize: size, fontWeight: weight, color },
    font && { fontFamily: font },
    extra,
  ];

  return (
    <View style={{ backgroundColor: theme.canvas }}>
      {/* Barra de anuncio */}
      {announcement ? (
        <View
          style={{
            backgroundColor: theme.accent,
            paddingVertical: 5,
            paddingHorizontal: 12,
          }}
        >
          <Text
            numberOfLines={1}
            style={txt(11, "500", theme.accentFg, {
              textAlign: "center",
              letterSpacing: -0.2,
            })}
          >
            {announcement}
          </Text>
        </View>
      ) : null}

      {/* Cabecera */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          height: 34,
          paddingHorizontal: 10,
          backgroundColor: theme.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.line,
        }}
      >
        <Icon name="menu" size={16} color={theme.ink} />
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.line,
            backgroundColor: "#e2e8f0",
            overflow: "hidden",
          }}
        >
          {logoUri ? (
            <Image
              source={{ uri: logoUri }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : null}
        </View>
        <Text numberOfLines={1} style={txt(12, "700", theme.ink, { flex: 1 })}>
          {storeName}
        </Text>
        <View>
          <Icon name="shopping-outline" size={16} color={theme.ink} />
          <View
            style={{
              position: "absolute",
              right: -5,
              top: -4,
              minWidth: 12,
              height: 12,
              borderRadius: 999,
              backgroundColor: theme.accent,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 2,
            }}
          >
            <Text style={txt(8, "700", theme.accentFg)}>3</Text>
          </View>
        </View>
      </View>

      {/* Hero */}
      <View
        style={{
          backgroundColor: theme.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.line,
          paddingVertical: 18,
          paddingHorizontal: 16,
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: bannerUri ? undefined : theme.accentSoft,
          }}
        >
          {bannerUri ? (
            <>
              <Image
                source={{ uri: bannerUri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: theme.canvas,
                  opacity: 0.72,
                }}
              />
            </>
          ) : null}
        </View>

        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.line,
            backgroundColor: theme.surface,
            padding: 3,
          }}
        >
          <View
            style={{
              flex: 1,
              borderRadius: 999,
              backgroundColor: "#e2e8f0",
              overflow: "hidden",
            }}
          >
            {logoUri ? (
              <Image
                source={{ uri: logoUri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : null}
          </View>
        </View>
        <Text
          numberOfLines={1}
          style={txt(19, "700", theme.ink, {
            letterSpacing: -0.4,
            marginTop: 8,
          })}
        >
          {storeName}
        </Text>
        {municipality ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              marginTop: 4,
            }}
          >
            <Icon name="map-marker-outline" size={11} color={theme.muted} />
            <Text style={txt(10, "400", theme.muted)}>{municipality}</Text>
          </View>
        ) : null}
        {tagline ? (
          <Text
            numberOfLines={2}
            style={txt(11, "400", theme.body, {
              maxWidth: 220,
              textAlign: "center",
              marginTop: 6,
            })}
          >
            {tagline}
          </Text>
        ) : null}
        <View
          style={{
            marginTop: 10,
            backgroundColor: theme.accent,
            borderRadius: 999,
            paddingHorizontal: 16,
            paddingVertical: 7,
          }}
        >
          <Text style={txt(11, "600", theme.accentFg)}>Ver catálogo</Text>
        </View>
      </View>

      {/* Encabezado de sección */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.line,
        }}
      >
        <Text style={txt(14, "700", theme.ink)}>Todo el catálogo</Text>
        <Text style={txt(11, "400", theme.muted)}>12 productos</Text>
      </View>

      {/* Grid */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        {SAMPLE.map((item) => (
          <ProductMiniCard
            key={item.name}
            theme={theme}
            font={font}
            item={item}
          />
        ))}
      </View>

      {/* Pie */}
      <View
        style={{
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.line,
          padding: 12,
          gap: 4,
        }}
      >
        <Text style={txt(12, "700", theme.ink)}>{storeName}</Text>
        {tagline ? (
          <Text numberOfLines={1} style={txt(10, "400", theme.muted)}>
            {tagline}
          </Text>
        ) : null}
        <Text
          style={txt(8, "700", theme.muted, {
            letterSpacing: 1,
            textTransform: "uppercase",
          })}
        >
          Contacto
        </Text>
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.line,
            marginTop: 4,
            paddingTop: 4,
          }}
        >
          <Text style={txt(9, "400", theme.muted)}>
            {storeName} · Catálogo en línea
          </Text>
        </View>
      </View>
    </View>
  );
}
