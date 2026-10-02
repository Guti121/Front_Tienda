import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { router } from "expo-router";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { filterTypeProducts, deleteTypeProduct } from "../../../api/products";
import { listCategories } from "../../../api/categories";
import { ApiError } from "../../../api/http";
import { useTheme } from "../../../theme/ThemeProvider";
import {
  Button,
  Card,
  Divider,
  EmptyState,
  Icon,
  Loader,
  Sheet,
  Text,
  TextField,
  useToast,
} from "../../../ui";

// Sheet de filtro por categoría: "Todas" + cada categoría, con checkmark en la
// activa (mismo patrón que el filtro de categoría en product.jsx/bill.jsx).
function CategoryFilterSheet({ visible, onClose, value, onSelect }) {
  const { colors, spacing } = useTheme();
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["categories"],
    queryFn: ({ pageParam }) => listCategories(pageParam),
    initialPageParam: "listCategory/",
    getNextPageParam: (last) => last?.next ?? undefined,
    enabled: visible,
  });

  const items = (data?.pages ?? []).flatMap((p) => p?.results ?? []);

  return (
    <Sheet visible={visible} onClose={onClose} title="Filtrar por categoría">
      <Pressable
        onPress={() => {
          onSelect(null);
          onClose();
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: spacing.md,
        }}
      >
        <Text>Todas</Text>
        {value === null ? (
          <Icon name="check" size={20} color={colors.primary} />
        ) : null}
      </Pressable>
      {isLoading ? (
        <Loader fill={false} />
      ) : (
        items.map((item) => (
          <View key={item.id}>
            <Divider />
            <Pressable
              onPress={() => {
                onSelect(item.id);
                onClose();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: spacing.md,
              }}
              onLayout={
                item.id === items[items.length - 1]?.id
                  ? () => hasNextPage && fetchNextPage()
                  : undefined
              }
            >
              <Text>{item.nombre}</Text>
              {value === item.id ? (
                <Icon name="check" size={20} color={colors.primary} />
              ) : null}
            </Pressable>
          </View>
        ))
      )}
    </Sheet>
  );
}

// Listado de tipos de producto (pestaña dentro de ProductsDrawer).
export default function TypeProductView() {
  const { colors, spacing } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState(null); // id o null
  const [categoriaSheet, setCategoriaSheet] = useState(false);

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
    queryKey: ["typeProducts", "admin", debounced, categoriaFiltro],
    queryFn: ({ pageParam }) =>
      filterTypeProducts({
        q: debounced,
        page: pageParam,
        categoria: categoriaFiltro ?? undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last?.next ? pages.length + 1 : undefined,
  });

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p?.results ?? []),
    [data],
  );

  const del = useMutation({
    mutationFn: (id) => deleteTypeProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["typeProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setToDelete(null);
      toast.success("Tipo de producto eliminado");
    },
    onError: (err) => {
      setToDelete(null);
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo eliminar.",
      );
    },
  });

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
            placeholder="Buscar tipo"
            left={<Icon name="magnify" size={20} color={colors.textMuted} />}
          />
        </View>
        <Button
          title="Nuevo"
          fullWidth={false}
          left={<Icon name="plus" size={18} color={colors.textOnBrand} />}
          onPress={() => router.push("/modals/modalAddTypeProductDrawer")}
        />
        <Pressable
          onPress={() => setCategoriaSheet(true)}
          style={{
            width: 46,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: categoriaFiltro ? colors.primary : colors.border,
            backgroundColor: categoriaFiltro
              ? colors.primarySoft
              : colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name="filter-variant"
            size={20}
            color={categoriaFiltro ? colors.primary : colors.textMuted}
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
                icon={isError ? "alert-circle-outline" : "shape-outline"}
                title={isError ? "No se pudo cargar" : "Sin tipos de producto"}
                message={
                  isError
                    ? "Revisa tu conexión e inténtalo de nuevo."
                    : debounced || categoriaFiltro != null
                      ? "Prueba con otro nombre o categoría."
                      : "Crea el primero con el botón “Nuevo”."
                }
              />
            </View>
          }
          renderItem={({ item }) => (
            <Card level={0} style={{ marginBottom: spacing.sm }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: spacing.md,
                }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text weight="medium" numberOfLines={2}>
                    {item.tipo_producto}
                  </Text>
                  {item.categoria_nombre ? (
                    <Text variant="caption" muted>
                      {item.categoria_nombre}
                    </Text>
                  ) : null}
                </View>
                <Icon
                  name="trash-can-outline"
                  size={20}
                  color={colors.danger}
                  onPress={() => setToDelete(item)}
                />
              </View>
            </Card>
          )}
        />
      )}

      <Sheet
        visible={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar tipo de producto"
      >
        <Text muted>
          Se eliminará “{toDelete?.tipo_producto}” y{" "}
          <Text muted weight="bold">
            todos los productos de este tipo
          </Text>
          . Esta acción no se puede deshacer.
        </Text>
        <Button
          title="Sí, eliminar"
          variant="danger"
          loading={del.isPending}
          onPress={() => del.mutate(toDelete.id)}
        />
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => setToDelete(null)}
        />
      </Sheet>

      <CategoryFilterSheet
        visible={categoriaSheet}
        onClose={() => setCategoriaSheet(false)}
        value={categoriaFiltro}
        onSelect={setCategoriaFiltro}
      />
    </View>
  );
}
