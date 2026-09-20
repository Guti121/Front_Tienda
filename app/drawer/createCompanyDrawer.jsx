import { useState } from "react";
import { View } from "react-native";
import { useMutation } from "@tanstack/react-query";

import { createCompany } from "../../src/api/store";
import { ApiError } from "../../src/api/http";
import { deleteTokenStorage } from "../../src/components/token/token";
import ImagePickerWeb from "../../src/components/colletion/componentWebimage";
import { isWeb } from "../../src/components/token/localstorage";
import { useRequireRole } from "../../src/redux/viewsPermissions";
import { useTheme } from "../../src/theme/ThemeProvider";
import {
  Button,
  Card,
  Icon,
  Screen,
  Text,
  TextField,
  useToast,
} from "../../src/ui";

const FIELDS = [
  ["nit", "NIT"],
  ["company", "Compañía"],
  ["name", "Nombre de la tienda"],
  ["phone", "Teléfono"],
  ["email", "Correo electrónico"],
  ["direction", "Dirección"],
  ["municipality", "Municipio"],
];

// Solo para un cliente que todavía no tiene tienda (el backend rechaza a
// quien ya pertenece a una compañía).
const SOLO_CLIENTE = ["cliente"];

export default function CreateCompanyDrawer() {
  useRequireRole(SOLO_CLIENTE);
  const { colors, spacing } = useTheme();
  const toast = useToast();

  const [form, setForm] = useState({
    nit: "",
    company: "",
    name: "",
    phone: "",
    email: "",
    direction: "",
    municipality: "",
  });
  const [images, setImages] = useState([]);

  const create = useMutation({
    mutationFn: () => {
      // El logo es opcional: solo se manda FormData (multipart) si hay uno,
      // si no un objeto plano alcanza.
      const logo = images[0];
      if (!logo) return createCompany(form);

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (isWeb && logo.file) fd.append("url_logo", logo.file);
      else if (logo.uri)
        fd.append("url_logo", {
          uri: logo.uri,
          name: "logo.jpg",
          type: "image/jpeg",
        });
      return createCompany(fd);
    },
    onSuccess: () => {
      toast.success("¡Tienda creada! Vuelve a iniciar sesión.");
      setTimeout(() => deleteTokenStorage(), 1200); // clearSession + /login
    },
    onError: (err) =>
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo crear la tienda.",
      ),
  });

  const puedeEnviar = Object.values(form).every((v) => v.trim().length > 0);

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Card level={1}>
          <Text weight="bold">Crear mi tienda</Text>
          <Text muted variant="small" style={{ marginTop: spacing.xs }}>
            Con esto pasas a ser el dueño de tu propia tienda: catálogo,
            facturación e inventario.
          </Text>
        </Card>

        <Card level={0} style={{ alignItems: "center", gap: spacing.sm }}>
          <Text muted variant="small">
            Logo (opcional, lo puedes subir después)
          </Text>
          <ImagePickerWeb images={images} setImages={setImages} />
        </Card>

        <Card level={0} style={{ gap: spacing.md }}>
          {FIELDS.map(([key, label]) => (
            <TextField
              key={key}
              label={label}
              value={form[key]}
              onChangeText={(t) => setForm((f) => ({ ...f, [key]: t }))}
              keyboardType={key === "phone" ? "phone-pad" : "default"}
              autoCapitalize={key === "email" ? "none" : "sentences"}
            />
          ))}
        </Card>

        <Button
          title="Crear tienda"
          left={
            <Icon
              name="store-plus-outline"
              size={18}
              color={colors.textOnBrand}
            />
          }
          loading={create.isPending}
          disabled={!puedeEnviar}
          onPress={() => create.mutate()}
        />
      </View>
    </Screen>
  );
}
