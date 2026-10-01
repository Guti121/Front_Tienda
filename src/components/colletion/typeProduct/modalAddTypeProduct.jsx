import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createTypeProduct } from "../../../api/products";
import { listCategories } from "../../../api/categories";
import { ApiError } from "../../../api/http";
import { useTheme } from "../../../theme/ThemeProvider";
import {
  Button,
  Divider,
  Icon,
  Loader,
  Screen,
  Sheet,
  Text,
  TextField,
  useToast,
} from "../../../ui";

// Sheet de elección de categoría (opcional) para el nuevo tipo. Las
// categorías no se anidan entre sí: es un solo nivel a elegir o "Sin categoría".
function CategoryPicker({ visible, onClose, onSelect }) {
  const { spacing } = useTheme();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["categories"],
      queryFn: ({ pageParam }) => listCategories(pageParam),
      initialPageParam: "listCategory/",
      getNextPageParam: (last) => last?.next ?? undefined,
      enabled: visible,
    });

  const items = (data?.pages ?? []).flatMap((p) => p?.results ?? []);

  return (
    <Sheet visible={visible} onClose={onClose} title="Categoría">
      <View style={{ maxHeight: 360 }}>
        <Pressable
          onPress={() => onSelect(null)}
          style={{ paddingVertical: spacing.md }}
        >
          <Text muted>Sin categoría</Text>
        </Pressable>
        <Divider />
        {isLoading ? (
          <Loader fill={false} />
        ) : items.length === 0 ? (
          <Text muted style={{ paddingVertical: spacing.md }}>
            No hay categorías todavía.
          </Text>
        ) : (
          items.map((item, i) => (
            <View key={item.id}>
              {i > 0 ? <Divider /> : null}
              <Pressable
                onPress={() => onSelect(item)}
                style={{ paddingVertical: spacing.md }}
                onLayout={
                  i === items.length - 1
                    ? () => hasNextPage && fetchNextPage()
                    : undefined
                }
              >
                <Text>{item.nombre}</Text>
              </Pressable>
            </View>
          ))
        )}
        {isFetchingNextPage ? <Loader fill={false} /> : null}
      </View>
    </Sheet>
  );
}

export const ModalAddTypeProduct = () => {
  const { colors, spacing } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState(null); // objeto o null ("Sin categoría")
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState(null);

  const create = useMutation({
    mutationFn: ({ tipo, categoriaId }) => createTypeProduct(tipo, categoriaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["typeProducts"] });
      toast.success("Tipo de producto creado");
      setNombre("");
      setCategoria(null);
      if (router.canGoBack()) router.back();
    },
    onError: (err) =>
      setError(
        err instanceof ApiError ? err.message : "No se pudo crear el tipo.",
      ),
  });

  const submit = () => {
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setError(null);
    create.mutate({ tipo: nombre.trim(), categoriaId: categoria?.id ?? null });
  };

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Text variant="title" weight="bold">
          Nuevo tipo de producto
        </Text>
        <TextField
          label="Nombre del tipo"
          value={nombre}
          onChangeText={(t) => {
            setNombre(t);
            setError(null);
          }}
          placeholder="Ej. Bebidas, Aseo, Snacks…"
          error={error}
        />

        <View style={{ gap: spacing.xs }}>
          <Text variant="small" weight="medium" muted>
            Categoría (opcional)
          </Text>
          <Button
            title={categoria ? categoria.nombre : "Sin categoría"}
            variant="secondary"
            right={<Icon name="chevron-down" size={18} color={colors.text} />}
            onPress={() => setPickerOpen(true)}
          />
        </View>

        <Button title="Crear" onPress={submit} loading={create.isPending} />
      </View>

      <CategoryPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(item) => {
          setCategoria(item);
          setPickerOpen(false);
        }}
      />
    </Screen>
  );
};

export default ModalAddTypeProduct;
