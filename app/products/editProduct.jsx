import { useState } from "react";
import { Image, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { patchProduct, patchProductForm } from "../../src/api/products";
import {
  cleanNumber,
  formatToCOP,
} from "../../src/components/icons/functionFormat";
import ImagePickerWeb from "../../src/components/colletion/componentWebimage";
import { useTheme } from "../../src/theme/ThemeProvider";
import {
  Button,
  Card,
  Screen,
  Text,
  TextField,
  Toggle,
  useToast,
} from "../../src/ui";

// Construye el FormData con las imágenes nuevas (web: File; nativo: {uri,...}).
function appendImages(formData, images) {
  images.forEach((img, i) => {
    if (img?.file instanceof File) {
      formData.append("imagenes", img.file);
    } else if (img?.uri) {
      const ext = img.uri.split(".").pop();
      formData.append("imagenes", {
        uri: img.uri,
        name: `image_${i}.${ext}`,
        type: `image/${ext}`,
      });
    }
  });
}

export default function EditProduct() {
  const { product } = useLocalSearchParams();
  const parsed = JSON.parse(product || "{}");
  const { spacing } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState(parsed.nombre || "");
  const [valor, setValor] = useState(formatToCOP(String(parsed.valor ?? "")));
  const [detalles, setDetalles] = useState(parsed.detalles || "");
  const [publicar, setPublicar] = useState(Boolean(parsed.publicar));
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const save = async () => {
    const numericValor = cleanNumber(valor);
    if (!numericValor) {
      setError("El valor del producto no puede ser 0.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (images.length > 0) {
        const fd = new FormData();
        fd.append("nombre", nombre);
        fd.append("valor", numericValor);
        fd.append("detalles", detalles);
        fd.append("publicar", publicar);
        appendImages(fd, images);
        await patchProductForm(parsed.id, fd);
      } else {
        await patchProduct(parsed.id, {
          nombre,
          valor: numericValor,
          detalles,
          publicar,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["product"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto actualizado");
      router.back();
    } catch (err) {
      setError(err?.message || "No se pudo actualizar el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <TextField label="Nombre" value={nombre} onChangeText={setNombre} />
        <TextField
          label="Valor de venta"
          value={valor}
          onChangeText={(t) => setValor(formatToCOP(t))}
          keyboardType="numeric"
        />
        <TextField
          label="Detalles"
          value={detalles}
          onChangeText={setDetalles}
          multiline
          numberOfLines={4}
          inputStyle={{ minHeight: 90, textAlignVertical: "top" }}
        />

        <Card level={0}>
          <Toggle
            label="Publicar en el catálogo"
            value={publicar}
            onValueChange={setPublicar}
          />
        </Card>

        <View style={{ gap: spacing.sm }}>
          <Text variant="small" weight="medium" muted>
            Imágenes nuevas (reemplazan las actuales)
          </Text>
          {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                {images.map((img, i) => (
                  <Image
                    key={i}
                    source={{ uri: img.uri }}
                    style={{ width: 92, height: 92, borderRadius: 10 }}
                  />
                ))}
              </View>
            </ScrollView>
          ) : null}
          <ImagePickerWeb images={images} setImages={setImages} />
        </View>

        {error ? (
          <Text color="danger" variant="small">
            {error}
          </Text>
        ) : null}

        <Button title="Guardar cambios" onPress={save} loading={saving} />
      </View>
    </Screen>
  );
}
