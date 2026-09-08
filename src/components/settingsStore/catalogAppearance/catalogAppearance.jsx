import { useEffect, useRef, useState } from "react";
import { Image, Linking, Pressable, ScrollView, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { useFonts } from "expo-font";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito";
import { SpaceGrotesk_600SemiBold } from "@expo-google-fonts/space-grotesk";
import { SourceSerif4_600SemiBold } from "@expo-google-fonts/source-serif-4";
import ColorPicker, {
  HueSlider,
  Panel1,
  Swatches,
} from "reanimated-color-picker";

import { retrieveCompany, updateCompany } from "../../../api/store";
import { ApiError } from "../../../api/http";
import { catalogUrl, mediaUrl } from "../../../api/config";
import { isWeb } from "../../token/localstorage";
import { useTheme } from "../../../theme/ThemeProvider";
import {
  contrastRatio,
  effectiveColors,
  isValidHex,
  PALETTE_LIST,
  resolveCatalogTheme,
} from "../../../theme/catalogTheme";
import {
  Button,
  Card,
  Divider,
  Icon,
  Loader,
  Screen,
  Sheet,
  Text,
  TextField,
  useToast,
} from "../../../ui";

// Las claves coinciden con CATALOG_FONT_CHOICES del backend y con
// catalog-web/lib/fonts.ts.
const FONT_OPTIONS = [
  { key: "", label: "Inter (por defecto)" },
  { key: "serif", label: "Serif elegante" },
  { key: "rounded", label: "Redondeada" },
  { key: "geometric", label: "Geométrica" },
  { key: "grotesk", label: "Grotesca moderna" },
];
// Familia real para la vista previa de cada opción (se cargan perezosamente).
const PREVIEW_FONT = {
  "": undefined, // Inter, ya cargada globalmente
  serif: "SourceSerif4_600SemiBold",
  rounded: "Nunito_600SemiBold",
  geometric: "Poppins_600SemiBold",
  grotesk: "SpaceGrotesk_600SemiBold",
};
const fontLabel = (key) =>
  FONT_OPTIONS.find((o) => o.key === (key ?? ""))?.label ??
  "Inter (por defecto)";

const COLOR_ROWS = [
  { slot: "accent", key: "catalog_color_accent", label: "Botones y enlaces" },
  { slot: "bg", key: "catalog_color_bg", label: "Fondo de página" },
  { slot: "text", key: "catalog_color_text", label: "Texto" },
];

const TAGLINE_MAX = 120;
const ANNOUNCE_MAX = 140;
const EMPTY = {
  catalog_font: "",
  catalog_tagline: "",
  catalog_announcement: "",
  catalog_palette: "",
  catalog_color_accent: "",
  catalog_color_bg: "",
  catalog_color_text: "",
};

const seedFrom = (data) =>
  Object.fromEntries(Object.keys(EMPTY).map((k) => [k, data?.[k] ?? ""]));

export default function CatalogAppearance() {
  const { colors, spacing, radii } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.user.user);
  const isCreator = user?.typeUser === "creator";

  const webInputRef = useRef(null);
  const [previewFontsReady] = useFonts({
    Poppins_600SemiBold,
    Nunito_600SemiBold,
    SpaceGrotesk_600SemiBold,
    SourceSerif4_600SemiBold,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["company"],
    queryFn: retrieveCompany,
  });

  const [form, setForm] = useState(EMPTY);
  const [banner, setBanner] = useState(null); // imagen nueva sin subir: { file?, uri }
  const [editable, setEditable] = useState(false);
  const [fontSheet, setFontSheet] = useState(false);
  const [colorSlot, setColorSlot] = useState(null); // "accent" | "bg" | "text"
  const [draftColor, setDraftColor] = useState("#000000");

  useEffect(() => {
    if (data) setForm(seedFrom(data));
  }, [data]);

  const textChanged = Object.keys(EMPTY).some(
    (k) => (form[k] ?? "") !== (data?.[k] ?? ""),
  );
  const dirty = textChanged || Boolean(banner);

  const set = (patch) => setForm((p) => ({ ...p, ...patch }));

  const applyPalette = (key) => {
    set({
      catalog_palette: key,
      catalog_color_accent: "",
      catalog_color_bg: "",
      catalog_color_text: "",
    });
    toast.success("Colores de la paleta aplicados");
  };

  const openColor = (slot) => {
    setDraftColor(
      effectiveColors({
        palette: form.catalog_palette,
        accent: form.catalog_color_accent,
        bg: form.catalog_color_bg,
        text: form.catalog_color_text,
      })[slot],
    );
    setColorSlot(slot);
  };

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
  const themeInput = {
    palette: form.catalog_palette,
    accent: form.catalog_color_accent,
    bg: form.catalog_color_bg,
    text: form.catalog_color_text,
  };
  const t = resolveCatalogTheme(themeInput);
  const eff = effectiveColors(themeInput);
  const previewFamily = previewFontsReady
    ? PREVIEW_FONT[form.catalog_font ?? ""]
    : undefined;
  const lowContrast =
    contrastRatio(t.body, t.canvas) < 4.5 ||
    contrastRatio(t.accent, t.accentFg) < 3;
  const customColors = Boolean(
    form.catalog_color_accent ||
      form.catalog_color_bg ||
      form.catalog_color_text,
  );

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Text variant="body" muted>
          Personaliza cómo se ve tu catálogo público. Los cambios pueden tardar
          unos minutos en verse.
        </Text>

        {/* Vista previa en vivo */}
        <Card level={1} padded={false} style={{ overflow: "hidden" }}>
          <View
            style={{
              backgroundColor: t.canvas,
              padding: spacing.lg,
              gap: spacing.sm,
            }}
          >
            <Text
              weight="bold"
              style={[
                { fontSize: 20, color: t.ink },
                previewFamily && { fontFamily: previewFamily },
              ]}
            >
              {data?.company || "Mi Tienda"}
            </Text>
            <Text
              style={[
                { fontSize: 13, color: t.muted },
                previewFamily && { fontFamily: previewFamily },
              ]}
            >
              {form.catalog_tagline || "Tu catálogo, tu estilo."}
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: spacing.sm,
                marginTop: spacing.xs,
              }}
            >
              <View
                style={{
                  backgroundColor: t.accent,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: radii.pill,
                }}
              >
                <Text
                  style={[
                    { color: t.accentFg, fontSize: 13, fontWeight: "600" },
                    previewFamily && { fontFamily: previewFamily },
                  ]}
                >
                  Comprar
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: t.surface,
                  borderColor: t.line,
                  borderWidth: 1,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: radii.pill,
                }}
              >
                <Text style={{ color: t.body, fontSize: 13 }}>Ver más</Text>
              </View>
            </View>
          </View>
          {lowContrast ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: colors.warningSoft,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
              }}
            >
              <Icon name="alert-outline" size={16} color={colors.warning} />
              <Text
                variant="caption"
                style={{ color: colors.warning, flex: 1 }}
              >
                Contraste bajo: puede costar leer el catálogo.
              </Text>
            </View>
          ) : null}
        </Card>

        <Button
          title="Ver mi catálogo"
          variant="secondary"
          left={<Icon name="open-in-new" size={18} color={colors.text} />}
          onPress={openCatalog}
        />

        {/* Paleta */}
        <Card level={0} style={{ gap: spacing.sm }}>
          <Text variant="small" weight="medium" muted>
            Paleta
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingVertical: 2 }}
          >
            {PALETTE_LIST.map((p) => {
              const active =
                (form.catalog_palette ?? "") === p.key && !customColors;
              return (
                <Pressable
                  key={p.key || "def"}
                  disabled={!editable}
                  onPress={() => applyPalette(p.key)}
                  style={{
                    borderWidth: 2,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: radii.md,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    alignItems: "center",
                    gap: 6,
                    minWidth: 84,
                    opacity: editable ? 1 : 0.55,
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    {[p.accent, p.bg, p.text].map((c, i) => (
                      <View
                        key={i}
                        style={{
                          width: 16,
                          height: 16,
                          backgroundColor: c,
                          borderRadius: 4,
                          marginLeft: i ? -4 : 0,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      />
                    ))}
                  </View>
                  <Text variant="caption" muted>
                    {p.label.split(" ")[0]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>

        {/* Colores */}
        <Card level={0} style={{ gap: spacing.xs }}>
          <Text variant="small" weight="medium" muted>
            Colores
          </Text>
          {COLOR_ROWS.map((row, i) => (
            <View key={row.slot}>
              {i > 0 ? <Divider spacing={spacing.xs} /> : null}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  paddingVertical: spacing.sm,
                }}
              >
                <Pressable
                  disabled={!editable}
                  onPress={() => openColor(row.slot)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: eff[row.slot],
                    borderWidth: 1,
                    borderColor: colors.border,
                    opacity: editable ? 1 : 0.6,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text>{row.label}</Text>
                  <Text variant="caption" muted>
                    {form[row.key]
                      ? form[row.key]
                      : `${eff[row.slot]} · de la paleta`}
                  </Text>
                </View>
                {editable && form[row.key] ? (
                  <Pressable onPress={() => set({ [row.key]: "" })}>
                    <Text variant="caption" style={{ color: colors.primary }}>
                      Restablecer
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
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
            <Text
              style={[
                { color: editable ? colors.text : colors.textMuted },
                previewFamily && { fontFamily: previewFamily },
              ]}
            >
              {fontLabel(form.catalog_font)}
            </Text>
            {editable ? (
              <Icon name="chevron-down" size={20} color={colors.textFaint} />
            ) : null}
          </Pressable>
        </Card>

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

        {/* Textos */}
        <Card level={0} style={{ gap: spacing.md }}>
          <TextField
            label="Frase / eslogan"
            value={form.catalog_tagline}
            onChangeText={(v) =>
              set({ catalog_tagline: v.slice(0, TAGLINE_MAX) })
            }
            editable={editable}
            placeholder="Ej: Envíos a todo el país"
            helper={`${form.catalog_tagline?.length ?? 0}/${TAGLINE_MAX} · bajo el nombre de la tienda`}
            inputStyle={!editable ? { color: colors.textMuted } : undefined}
          />
          <TextField
            label="Barra de anuncio"
            value={form.catalog_announcement}
            onChangeText={(v) =>
              set({ catalog_announcement: v.slice(0, ANNOUNCE_MAX) })
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
                    if (data) setForm(seedFrom(data));
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

      {/* Sheet: tipografía con preview de cada estilo */}
      <Sheet
        visible={fontSheet}
        onClose={() => setFontSheet(false)}
        title="Tipografía del catálogo"
      >
        <View>
          {FONT_OPTIONS.map((o, i) => {
            const fam = previewFontsReady ? PREVIEW_FONT[o.key] : undefined;
            const selected = (form.catalog_font ?? "") === o.key;
            return (
              <View key={o.key || "def"}>
                {i > 0 ? <Divider /> : null}
                <Pressable
                  onPress={() => {
                    set({ catalog_font: o.key });
                    setFontSheet(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: spacing.md,
                    gap: spacing.md,
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={fam && { fontFamily: fam }}>{o.label}</Text>
                    <Text
                      style={[
                        { fontSize: 18, color: colors.textMuted },
                        fam && { fontFamily: fam },
                      ]}
                    >
                      Aa · Tienda 123
                    </Text>
                  </View>
                  {selected ? (
                    <Icon name="check" size={20} color={colors.primary} />
                  ) : null}
                </Pressable>
              </View>
            );
          })}
          {!previewFontsReady ? (
            <Text variant="caption" muted style={{ marginTop: spacing.sm }}>
              Cargando fuentes para la vista previa…
            </Text>
          ) : null}
        </View>
      </Sheet>

      {/* Sheet: rueda de color */}
      <Sheet
        visible={Boolean(colorSlot)}
        onClose={() => setColorSlot(null)}
        title={
          COLOR_ROWS.find((r) => r.slot === colorSlot)?.label || "Elegir color"
        }
      >
        <View style={{ gap: spacing.md }}>
          <ColorPicker
            value={
              isValidHex(draftColor) && draftColor ? draftColor : "#000000"
            }
            onCompleteJS={({ hex }) => setDraftColor(hex.slice(0, 7))}
            style={{ gap: spacing.md }}
          >
            <Panel1 style={{ borderRadius: radii.md, height: 180 }} />
            <HueSlider style={{ borderRadius: radii.pill }} />
            <Swatches />
          </ColorPicker>
          <TextField
            label="Hex"
            value={draftColor}
            onChangeText={(v) => setDraftColor(v.trim())}
            autoCapitalize="none"
            autoCorrect={false}
            error={
              draftColor && !isValidHex(draftColor)
                ? "Usa un color como #4f46e5"
                : undefined
            }
          />
          <Button
            title="Usar este color"
            disabled={!draftColor || !isValidHex(draftColor)}
            onPress={() => {
              set({ [`catalog_color_${colorSlot}`]: draftColor });
              setColorSlot(null);
            }}
          />
        </View>
      </Sheet>
    </Screen>
  );
}
