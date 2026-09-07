import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import {
  retrieveCompany,
  updateCompany,
  deleteCompany,
} from "../../../api/store";
import { ApiError } from "../../../api/http";
import { deleteTokenStorage } from "../../token/token";
import ImagePickerWeb from "../../colletion/componentWebimage";
import { isWeb } from "../../token/localstorage";
import { useTheme } from "../../../theme/ThemeProvider";
import {
  Button,
  Card,
  Icon,
  Loader,
  Screen,
  Sheet,
  Text,
  TextField,
  useToast,
} from "../../../ui";

const FIELDS = [
  ["nit", "NIT"],
  ["company", "Compañía"],
  ["name", "Nombre"],
  ["phone", "Teléfono"],
  ["email", "Correo electrónico"],
  ["direction", "Dirección"],
  ["municipality", "Municipio"],
];

const FALLBACK_LOGO =
  "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

export default function DetailsMyStore() {
  const { colors, spacing } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.user.user);
  const isCreator = user?.typeUser === "creator";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["company"],
    queryFn: retrieveCompany,
  });

  const [form, setForm] = useState({});
  const [editable, setEditable] = useState(false);
  const [images, setImages] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () => {
      const changed = Object.keys(form).filter((k) => form[k] !== data?.[k]);
      const fd = new FormData();
      changed.forEach((k) => fd.append(k, form[k] ?? ""));
      images.forEach((img) => {
        if (isWeb && img?.file) fd.append("url_logo", img.file);
        else if (!isWeb && img?.uri)
          fd.append("url_logo", {
            uri: img.uri,
            name: "logo.jpg",
            type: "image/jpeg",
          });
      });
      return updateCompany(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      setEditable(false);
      setImages([]);
      toast.success("Datos actualizados");
    },
    onError: (err) =>
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo actualizar.",
      ),
  });

  const del = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      setConfirmDelete(false);
      toast.success("Compañía eliminada");
      setTimeout(() => deleteTokenStorage(), 800);
    },
    onError: (err) => {
      setConfirmDelete(false);
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo eliminar.",
      );
    },
  });

  if (isLoading) return <Loader label="Cargando…" />;
  if (isError) {
    return (
      <Screen>
        <Text color="danger" center>
          No se pudieron cargar los datos de la tienda.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Card level={1} style={{ alignItems: "center", gap: spacing.sm }}>
          <Image
            source={{ uri: form?.url_logo || FALLBACK_LOGO }}
            style={{ width: 88, height: 88, borderRadius: 44 }}
          />
          {editable ? (
            <ImagePickerWeb images={images} setImages={setImages} />
          ) : null}
        </Card>

        <Card level={0} style={{ gap: spacing.md }}>
          {FIELDS.map(([key, label]) => (
            <TextField
              key={key}
              label={label}
              value={form?.[key] ?? ""}
              onChangeText={(t) => setForm((p) => ({ ...p, [key]: t }))}
              editable={editable}
              inputStyle={!editable ? { color: colors.textMuted } : undefined}
            />
          ))}
        </Card>

        {isCreator ? (
          <View style={{ gap: spacing.md }}>
            {editable ? (
              <Button
                title="Guardar cambios"
                loading={save.isPending}
                onPress={() => save.mutate()}
              />
            ) : (
              <Button
                title="Editar"
                variant="secondary"
                left={
                  <Icon name="pencil-outline" size={18} color={colors.text} />
                }
                onPress={() => setEditable(true)}
              />
            )}
            {!editable ? (
              <Button
                title="Eliminar compañía"
                variant="danger"
                left={
                  <Icon
                    name="trash-can-outline"
                    size={18}
                    color={colors.textOnBrand}
                  />
                }
                onPress={() => setConfirmDelete(true)}
              />
            ) : null}
          </View>
        ) : null}
      </View>

      <Sheet
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Eliminar compañía"
      >
        <Text muted>
          Se eliminarán todos los datos de tu tienda de forma permanente: esta
          acción no se puede deshacer.
        </Text>
        <Button
          title="Sí, eliminar todo"
          variant="danger"
          loading={del.isPending}
          onPress={() => del.mutate()}
        />
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => setConfirmDelete(false)}
        />
      </Sheet>
    </Screen>
  );
}
