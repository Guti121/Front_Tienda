import { FlatList, Image, Pressable, Text, View, StyleSheet, Animated } from "react-native";
import { useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

export const SIDEBAR_WIDTH = 160;

/**
 * Barra superior: botón hamburguesa + logo de la empresa.
 * Va dentro del header fijo (fuera del layout en fila).
 */
export function FilterToggleButton({
  logoUri,
  showTypes,
  setShowTypes,
  selectedType,
  productTypes,
  onFetchTypes,
}) {
  const handleToggle = () => {
    if (showTypes) {
      setShowTypes(false);
    } else if (productTypes && productTypes.length > 0) {
      // Ya están cargados, solo mostrar el panel sin volver a pedirlos
      setShowTypes(true);
    } else {
      // Primera carga: pide la lista desde cero
      onFetchTypes(true);
    }
  };

  const hasActiveFilter = selectedType !== null;

  return (
    <View style={styles.topRow}>
      <Pressable
        onPress={handleToggle}
        style={[styles.filterButton, showTypes && styles.filterButtonActive]}
        hitSlop={8}
        accessibilityLabel="Filtrar por tipo"
      >
        <Ionicons
          name="menu-outline"
          size={20}
          color={showTypes ? "#ffffff" : "#5e5ce6"}
        />
        {hasActiveFilter && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>1</Text>
          </View>
        )}
      </Pressable>

      <Image
        source={{
          uri:
            logoUri ||
            "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png",
        }}
        style={styles.logo}
        resizeMode="cover"
      />
    </View>
  );
}

/**
 * Panel lateral animado con la lista de tipos.
 * Debe ir como hermano del FlatList dentro de un contenedor flexDirection: "row".
 */
export function FilterSidebar({
  showTypes,
  setShowTypes,
  selectedType,
  setSelectedType,
  productTypes,
  onFilterChange,
  onLoadMoreType,
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: showTypes ? SIDEBAR_WIDTH : 0,
      duration: 220,
      useNativeDriver: false, // width no es soportado por el native driver
    }).start();
  }, [showTypes]);

  const handleSelect = (item) => {
    if (selectedType === item.id) {
      setSelectedType(null);
      onFilterChange(null);
    } else {
      setSelectedType(item.id);
      onFilterChange(item.id);
    }
    setShowTypes(false); // cierra el panel al elegir un tipo
  };

  const handleClear = () => {
    setSelectedType(null);
    onFilterChange(null);
  };

  const hasActiveFilter = selectedType !== null;

  return (
    <Animated.View style={[styles.sidebar, { width: widthAnim }]}>
      <View style={styles.sidebarInner}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Tipos</Text>
          {hasActiveFilter && (
            <Pressable onPress={handleClear} hitSlop={8} accessibilityLabel="Limpiar filtro">
              <Ionicons name="close-circle" size={18} color="#999" />
            </Pressable>
          )}
        </View>

        <FlatList
          data={productTypes}
          keyExtractor={(item) => String(item?.id ?? Math.random())}
          renderItem={({ item }) => {
            const isSelected = selectedType === item.id;
            return (
              <Pressable
                onPress={() => handleSelect(item)}
                style={[styles.sidebarItem, isSelected && styles.sidebarItemSelected]}
              >
                {isSelected ? (
                  <Ionicons name="checkmark" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                ) : (
                  <View style={{ width: 20 }} />
                )}
                <Text
                  numberOfLines={1}
                  style={[styles.sidebarItemText, isSelected && styles.sidebarItemTextSelected]}
                >
                  {item.tipo_producto}
                </Text>
              </Pressable>
            );
          }}
          onEndReachedThreshold={0.5}
          onEndReached={onLoadMoreType}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef0ff",
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8dcff",
  },
  filterButtonActive: {
    backgroundColor: "#5e5ce6",
    borderColor: "#5e5ce6",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#f8f9fa",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  sidebar: {
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  sidebarInner: {
    width: SIDEBAR_WIDTH,
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888888",
    textTransform: "uppercase",
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  sidebarItemSelected: {
    backgroundColor: "#5e5ce6",
  },
  sidebarItemText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#444444",
    flexShrink: 1,
  },
  sidebarItemTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
