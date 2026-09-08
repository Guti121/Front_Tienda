import { useEffect, useRef, useState } from "react";
import { Image, Linking, Pressable, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";

import { retrieveCompany, updateCompany } from "../../../api/store";
import { ApiError } from "../../../api/http";
import { catalogUrl, mediaUrl } from "../../../api/config";
import { isWeb } from "../../token/localstorage";
import { useTheme } from "../../../theme/ThemeProvider";
import {
  Button,
  Card,
  Divider,
  Icon,
  ListItem,
  Loader,
  Screen,
  Sheet,
  Text,
  TextField,
  useToast,
} from "../../../ui";

// Las claves tienen que coincidir con CATALOG_FONT_CHOICES del backend.
const FONT_OPTIONS = [
  { key: "", label: "Inter (por defecto)" },
  { key: "serif", label: "Serif elegante" },
  { key: "rounded", label: "Redondeada" },
  { key: "geometric", label: "Geométrica" },
  { key: "grotesk", label: "Grotesca moderna" },
];
const fontLabel = (key) =>
  FONT_OPTIONS.find((o) => o.key === (key ?? ""))?.label ??
  "Inter (por defecto)";

const TAGLINE_MAX = 120;
const ANNOUNCE_MAX = 140;
const EMPTY = {
  catalog_font: "",
  catalog_tagline: "",
  catalog_announcement: "",
};

export default function CatalogAppearance() {
  const { colors, spacing, radii } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.user.user);
  const isCreator = user?.typeUser === "creator";

  const webInputRef = useRef(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["company"],
    queryFn: retrieveCompany,
  });

  const [form, setForm] = useState(EMPTY);
  const [banner, setBanner] = useState(null); // imagen nueva sin subir: { file?, uri }
  const [editable, setEditable] = useState(false);
  const [fontSheet, setFontSheet] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        catalog_font: data.catalog_font ?? "",
        catalog_tagline: data.catalog_tagline ?? "",
        catalog_announcement: data.catalog_announcement ?? "",
      });
    }
  }, [data]);

  const textChanged = Object.keys(EMPTY).some(
    (k) => (form[k] ?? "") !== (data?.[k] ?? ""),
  );
  const dirty = textChanged || Boolean(banner);

  const pickWeb = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen supera los 10MB.");
      return;
    }
    setBanner({ file, uri: URL.createObjectURL(file) });
    if (webInputRef.current) webInputRef.current.value = "";
  };

  const pickNative = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.error("Necesitas dar permiso a la galería.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      setBanner({ uri: res.assets[0].uri });
    }
  };

  const pickBanner = () => {
    if (isWeb) webInputRef.current?.click();
    else pickNative();
  };

  const save = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.keys(EMPTY).forEach((k) => {
        if ((form[k] ?? "") !== (data?.[k] ?? "")) fd.append(k, form[k] ?? "");
      });
      if (banner?.file) {
        fd.append("catalog_banner", banner.file);
      } else if (banner?.uri) {
        fd.append("catalog_banner", {
          uri: banner.uri,
          name: "banner.jpg",
          type: "image/jpeg",
        });
      }
      return updateCompany(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      setEditable(false);
      setBanner(null);
      toast.success("Catálogo actualizado");
    },
    onError: (err) =>
      toast.error(
        err instanceof ApiError ? err.message : "No se pudo actualizar.",
      ),
  });

  const openCatalog = () => {
    if (data?.name) Linking.openURL(catalogUrl(data.name));
  };

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

  const previewUri = banner?.uri || mediaUrl(data?.catalog_banner);

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Text variant="body" muted>
          Personaliza cómo se ve tu catálogo público para que no parezca
          genérico. Los cambios pueden tardar unos minutos en verse.
        </Text>

        <Button
          title="Ver mi catálogo"
          variant="secondary"
          left={<Icon name="open-in-new" size={18} color={colors.text} />}
          onPress={openCatalog}
        />

        {/* Portada / banner */}
        <Card level={0} style={{ gap: spacing.md }}>
          <Text variant="small" weight="medium" muted>
            Imagen de portada (hero)
          </Text>
          <View
            style={{
              height: 140,
              borderRadius: radii.md,
              overflow: "hidden",
              backgroundColor: colors.surfaceAlt,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <Text variant="caption" muted>
                Sin portada · se usa un degradado
              </Text>
            )}
          </View>
          {editable ? (
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <Button
                title={previewUri ? "Cambiar imagen" : "Elegir imagen"}
                variant="secondary"
                fullWidth={false}
                left={<Icon name="image-plus" size={18} color={colors.text} />}
                onPress={pickBanner}
              />
              {banner ? (
                <Button
                  title="Quitar"
                  variant="ghost"
                  fullWidth={false}
                  onPress={() => setBanner(null)}
                />
              ) : null}
            </View>
          ) : null}
          {isWeb ? (
            <input
              ref={webInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={pickWeb}
            />
          ) : null}
        </Card>

        {/* Tipografía */}
        <Card level={0} style={{ gap: spacing.xs }}>
          <Text variant="small" weight="medium" muted>
            Tipografía
          </Text>
          <Pressable
            onPress={() => editable && setFontSheet(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: spacing.md,
            }}
          >
            <Text color={editable ? "text" : "textMuted"}>
              {fontLabel(form.catalog_font)}
            </Text>
            {editable ? (
              <Icon name="chevron-down" size={20} color={colors.textFaint} />
            ) : null}
          </Pressable>
        </Card>

        {/* Textos */}
        <Card level={0} style={{ gap: spacing.md }}>
          <TextField
            label="Frase / eslogan"
            value={form.catalog_tagline}
            onChangeText={(t) =>
              setForm((p) => ({
                ...p,
                catalog_tagline: t.slice(0, TAGLINE_MAX),
              }))
            }
            editable={editable}
            placeholder="Ej: Envíos a todo el país"
            helper={`${form.catalog_tagline?.length ?? 0}/${TAGLINE_MAX} · aparece bajo el nombre de la tienda`}
            inputStyle={!editable ? { color: colors.textMuted } : undefined}
          />
          <TextField
            label="Barra de anuncio"
            value={form.catalog_announcement}
            onChangeText={(t) =>
              setForm((p) => ({
                ...p,
                catalog_announcement: t.slice(0, ANNOUNCE_MAX),
              }))
            }
            editable={editable}
            placeholder="Ej: 2x1 esta semana"
            helper={`${form.catalog_announcement?.length ?? 0}/${ANNOUNCE_MAX} · vacío = sin barra`}
            inputStyle={!editable ? { color: colors.textMuted } : undefined}
          />
        </Card>

        {isCreator ? (
          <View style={{ gap: spacing.md }}>
            {editable ? (
              <>
                <Button
                  title="Guardar cambios"
                  loading={save.isPending}
                  disabled={!dirty}
                  onPress={() => save.mutate()}
                />
                <Button
                  title="Cancelar"
                  variant="secondary"
                  onPress={() => {
                    setEditable(false);
                    setBanner(null);
                    if (data) {
                      setForm({
                        catalog_font: data.catalog_font ?? "",
                        catalog_tagline: data.catalog_tagline ?? "",
                        catalog_announcement: data.catalog_announcement ?? "",
                      });
                    }
                  }}
                />
              </>
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
          </View>
        ) : null}
      </View>

      <Sheet
        visible={fontSheet}
        onClose={() => setFontSheet(false)}
        title="Tipografía del catálogo"
      >
        <View>
          {FONT_OPTIONS.map((o, i) => (
            <View key={o.key || "default"}>
              {i > 0 ? <Divider /> : null}
              <ListItem
                title={o.label}
                right={
                  (form.catalog_font ?? "") === o.key ? (
                    <Icon name="check" size={20} color={colors.primary} />
                  ) : null
                }
                onPress={() => {
                  setForm((p) => ({ ...p, catalog_font: o.key }));
                  setFontSheet(false);
                }}
              />
            </View>
          ))}
        </View>
      </Sheet>
    </Screen>
  );
}
