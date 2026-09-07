import { useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { router } from "expo-router";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { filterTypeProducts, deleteTypeProduct } from "../../../api/products";
import { ApiError } from "../../../api/http";
import { useTheme } from "../../../theme/ThemeProvider";
import {
  Button,
  Card,
  EmptyState,
  Icon,
  Loader,
  Sheet,
  Text,
  TextField,
  useToast,
} from "../../../ui";

// Listado de tipos de producto (pestaña dentro de ProductsDrawer).
export default function TypeProductView() {
  const { colors, spacing } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [toDelete, setToDelete] = useState(null);

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
    queryKey: ["typeProducts", "admin", debounced],
    queryFn: ({ pageParam }) =>
      filterTypeProducts({ q: debounced, page: pageParam }),
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
                    : debounced
                      ? "Prueba con otro nombre."
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
                <Text weight="medium" style={{ flex: 1 }} numberOfLines={2}>
                  {item.tipo_producto}
                </Text>
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
    </View>
  );
}
