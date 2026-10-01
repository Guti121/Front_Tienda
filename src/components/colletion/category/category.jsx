import { useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { router } from "expo-router";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { filterCategories, deleteCategory } from "../../../api/categories";
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

// Listado de categorías (pestaña dentro de ProductsDrawer). Agrupan tipos de
// producto; borrar una NO borra sus tipos, los deja "Sin categoría".
export default function CategoryView() {
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
    queryKey: ["categories", "admin", debounced],
    queryFn: ({ pageParam }) =>
      filterCategories({ q: debounced, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last?.next ? pages.length + 1 : undefined,
  });

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p?.results ?? []),
    [data],
  );

  const del = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["typeProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setToDelete(null);
      toast.success("Categoría eliminada");
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
            placeholder="Buscar categoría"
            left={<Icon name="magnify" size={20} color={colors.textMuted} />}
          />
        </View>
        <Button
          title="Nueva"
          fullWidth={false}
          left={<Icon name="plus" size={18} color={colors.textOnBrand} />}
          onPress={() => router.push("/modals/modalAddCategoryDrawer")}
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
                icon={isError ? "alert-circle-outline" : "folder-outline"}
                title={isError ? "No se pudo cargar" : "Sin categorías"}
                message={
                  isError
                    ? "Revisa tu conexión e inténtalo de nuevo."
                    : debounced
                      ? "Prueba con otro nombre."
                      : "Crea la primera con el botón “Nueva”."
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
                  {item.nombre}
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
        title="Eliminar categoría"
      >
        <Text muted>
          Se eliminará “{toDelete?.nombre}”. Los tipos de esta categoría
          pasarán a mostrarse como{" "}
          <Text muted weight="bold">
            “Sin categoría”
          </Text>{" "}
          (no se eliminan).
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
