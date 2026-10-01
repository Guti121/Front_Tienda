import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCategory } from "../../../api/categories";
import { ApiError } from "../../../api/http";
import { useTheme } from "../../../theme/ThemeProvider";
import { Button, Screen, Text, TextField, useToast } from "../../../ui";

export const ModalAddCategory = () => {
  const { spacing } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState("");
  const [error, setError] = useState(null);

  const create = useMutation({
    mutationFn: (nombre) => createCategory(nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoría creada");
      setNombre("");
      if (router.canGoBack()) router.back();
    },
    onError: (err) =>
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo crear la categoría.",
      ),
  });

  const submit = () => {
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setError(null);
    create.mutate(nombre.trim());
  };

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Text variant="title" weight="bold">
          Nueva categoría
        </Text>
        <TextField
          label="Nombre de la categoría"
          value={nombre}
          onChangeText={(t) => {
            setNombre(t);
            setError(null);
          }}
          placeholder="Ej. Ropa de hombre, Cocina…"
          error={error}
        />
        <Button title="Crear" onPress={submit} loading={create.isPending} />
      </View>
    </Screen>
  );
};

export default ModalAddCategory;
