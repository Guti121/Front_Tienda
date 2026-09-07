import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTypeProduct } from "../../../api/products";
import { ApiError } from "../../../api/http";
import { useTheme } from "../../../theme/ThemeProvider";
import { Button, Screen, Text, TextField, useToast } from "../../../ui";

export const ModalAddTypeProduct = () => {
  const { spacing } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState("");
  const [error, setError] = useState(null);

  const create = useMutation({
    mutationFn: (tipo) => createTypeProduct(tipo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["typeProducts"] });
      toast.success("Tipo de producto creado");
      setNombre("");
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
    create.mutate(nombre.trim());
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
        <Button title="Crear" onPress={submit} loading={create.isPending} />
      </View>
    </Screen>
  );
};

export default ModalAddTypeProduct;
