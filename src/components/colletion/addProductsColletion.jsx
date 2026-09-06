import { useState } from "react";
import { FlatList, View } from "react-native";
import { Link, router } from "expo-router";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createProduct, listTypeProducts } from "../../api/products";
import { suggestRetailPrice } from "../../api/pricing";
import { ApiError } from "../../api/http";
import { cleanNumber, formatToCOP, pesosFormat } from "../icons/functionFormat";
import ImagePickerWeb from "./componentWebimage";
import { useTheme } from "../../theme/ThemeProvider";
import {
  Badge,
  Button,
  Card,
  Icon,
  ListItem,
  Loader,
  Screen,
  Sheet,
  Text,
  TextField,
  Toggle,
  useToast,
} from "../../ui";

const round2 = (n) => Math.round(n * 100) / 100;

// --- Selector de tipo de producto (hoja inferior + lista paginada) ----------
function TypeProductPicker({ visible, onClose, onSelect }) {
  const { spacing } = useTheme();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["typeProducts"],
      queryFn: ({ pageParam }) => listTypeProducts(pageParam),
      initialPageParam: "listType/",
      getNextPageParam: (last) => last?.next ?? undefined,
      enabled: visible,
    });

  const items = (data?.pages ?? []).flatMap((p) => p?.results ?? []);

  return (
    <Sheet visible={visible} onClose={onClose} title="Tipo de producto">
      <View style={{ maxHeight: 360 }}>
        {isLoading ? (
          <Loader fill={false} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(it) => String(it.id)}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              isFetchingNextPage ? <Loader fill={false} /> : null
            }
            ListEmptyComponent={
              <View
                style={{
                  alignItems: "center",
                  gap: spacing.sm,
                  padding: spacing.lg,
                }}
              >
                <Text muted>No hay tipos de producto.</Text>
                <Button
                  title="Crear tipo de producto"
                  variant="secondary"
                  fullWidth={false}
                  onPress={() => {
                    onClose();
                    router.push("/products/addTypeProductDrawer");
                  }}
                />
              </View>
            }
            renderItem={({ item }) => (
              <ListItem
                title={item.tipo_producto}
                onPress={() => onSelect(item)}
              />
            )}
          />
        )}
      </View>
    </Sheet>
  );
}

// --- Formulario de alta de producto ---------------------------------------
export function AddProductsColletion() {
  const { colors, spacing } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState("");
  const [detalles, setDetalles] = useState("");
  const [valorMayorTxt, setValorMayorTxt] = useState("");
  const [valorTxt, setValorTxt] = useState("");
  const [unidadesTxt, setUnidadesTxt] = useState("");
  const [tipo, setTipo] = useState(null);
  const [publicar, setPublicar] = useState(false);
  const [percent, setPercent] = useState("");
  const [addCF, setAddCF] = useState(false);
  const [images, setImages] = useState([]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formError, setFormError] = useState(null);

  const valorMayor = cleanNumber(valorMayorTxt);
  const valor = cleanNumber(valorTxt);
  const unidades = parseInt(unidadesTxt, 10) || 0;

  const calc = useMutation({
    mutationFn: () => suggestRetailPrice({ valorMayor, margen: percent }),
    onSuccess: () => setAddCF(false),
    onError: (err) =>
      toast.error(
        err instanceof ApiError
          ? err.message
          : "No se pudo calcular el precio.",
      ),
  });
  const suggested = calc.data;
  const valorCostosFijos =
    addCF && suggested ? round2(suggested.ValorXmayor_CF - valorMayor) : 0;

  const create = useMutation({
    mutationFn: (formData) => createProduct(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto creado");
      setConfirmOpen(false);
      reset();
      if (data?.id) {
        router.replace({
          pathname: "/products/detailProduct",
          params: { id: data.id },
        });
      }
    },
    onError: (err) => {
      setConfirmOpen(false);
      const fields = err instanceof ApiError ? err.fields : null;
      const first = fields
        ? Object.values(fields).flat().filter(Boolean)[0]
        : null;
      setFormError(
        first ||
          (err instanceof ApiError
            ? err.message
            : "No se pudo crear el producto."),
      );
    },
  });

  function reset() {
    setNombre("");
    setDetalles("");
    setValorMayorTxt("");
    setValorTxt("");
    setUnidadesTxt("");
    setTipo(null);
    setPublicar(false);
    setPercent("");
    setAddCF(false);
    setImages([]);
    setFormError(null);
    calc.reset();
  }

  function validate() {
    if (!nombre.trim()) return "El nombre es obligatorio.";
    if (!detalles.trim()) return "Los detalles son obligatorios.";
    if (valorMayor <= 0) return "El valor por mayor debe ser mayor que 0.";
    if (valor <= 0) return "El valor de venta debe ser mayor que 0.";
    if (valor < valorMayor)
      return "El valor de venta no puede ser menor al valor por mayor.";
    if (unidades <= 0) return "Las unidades deben ser mayores que 0.";
    if (!tipo) return "Selecciona un tipo de producto.";
    return null;
  }

  function buildFormData() {
    const fd = new FormData();
    fd.append("nombre", nombre.trim());
    fd.append("tipo_producto", String(tipo.id));
    fd.append("detalles", detalles.trim());
    fd.append("valor", String(valor));
    fd.append("valor_mayor", String(valorMayor));
    fd.append("valor_costos_fijos", String(valorCostosFijos));
    fd.append("unidades_disponibles", String(unidades));
    fd.append("publicar", String(publicar));
    images.forEach((img, i) => {
      if (img?.file) {
        fd.append("imagenes", img.file);
      } else if (img?.uri) {
        const ext = img.uri.split(".").pop() || "jpg";
        fd.append("imagenes", {
          uri: img.uri,
          name: `image_${i}.${ext}`,
          type: `image/${ext}`,
        });
      }
    });
    return fd;
  }

  function onSubmit() {
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    setConfirmOpen(true);
  }

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Text variant="caption" muted>
          Todos los campos son obligatorios.
        </Text>

        <TextField
          label="Nombre del producto"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextField
          label="Detalles"
          value={detalles}
          onChangeText={setDetalles}
          multiline
          numberOfLines={4}
          inputStyle={{ minHeight: 90, textAlignVertical: "top" }}
        />
        <TextField
          label="Valor por mayor"
          value={valorMayorTxt}
          onChangeText={(t) => {
            setValorMayorTxt(formatToCOP(t));
            calc.reset();
            setAddCF(false);
          }}
          keyboardType="numeric"
          placeholder="$"
        />

        {/* Precio sugerido */}
        <Card level={0} style={{ gap: spacing.sm }}>
          <Text weight="bold">Precio sugerido de venta</Text>
          <Text variant="caption" muted>
            Suma tus costos fijos y el % de ganancia. Sin %, se usa el
            configurado en la tienda.
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: spacing.sm,
              alignItems: "flex-end",
            }}
          >
            <View style={{ flex: 1 }}>
              <TextField
                label="% ganancia"
                value={percent}
                onChangeText={setPercent}
                keyboardType="numeric"
                placeholder="opcional"
              />
            </View>
            <Button
              title="Calcular"
              fullWidth={false}
              loading={calc.isPending}
              disabled={valorMayor <= 0}
              onPress={() => calc.mutate()}
            />
          </View>

          {calc.isError ? (
            <View style={{ gap: spacing.xs }}>
              <Text variant="small" color="danger">
                {calc.error instanceof ApiError
                  ? calc.error.message
                  : "No se pudo calcular."}
              </Text>
              <Link
                href="/myStoreSettings/costsMyStoreDrawer"
                style={{ color: colors.primary }}
              >
                Configurar costos fijos…
              </Link>
            </View>
          ) : null}

          {suggested ? (
            <View style={{ gap: spacing.xs }}>
              <Text variant="small">
                Precio sugerido:{" "}
                <Text variant="small" weight="bold" color="primary">
                  {pesosFormat(suggested.Precio_sugerido_Unidad)}
                </Text>
              </Text>
              <Text variant="small" muted>
                Valor con CF: {pesosFormat(suggested.ValorXmayor_CF)} ·
                Ganancia: {Math.round(suggested.Margen * 100)}%
              </Text>
              <Toggle
                label="Agregar costos fijos al producto"
                value={addCF}
                onValueChange={setAddCF}
              />
              {addCF ? (
                <Badge
                  label={`CF: ${pesosFormat(valorCostosFijos)}`}
                  tone="brand"
                />
              ) : null}
            </View>
          ) : null}
        </Card>

        <TextField
          label="Valor de venta"
          value={valorTxt}
          onChangeText={(t) => setValorTxt(formatToCOP(t))}
          keyboardType="numeric"
          placeholder="$"
        />
        <TextField
          label="Unidades"
          value={unidadesTxt}
          onChangeText={setUnidadesTxt}
          keyboardType="numeric"
        />

        {/* Tipo de producto */}
        <View style={{ gap: spacing.xs }}>
          <Text variant="small" weight="medium" muted>
            Tipo de producto
          </Text>
          <Button
            title={tipo ? tipo.tipo_producto : "Seleccionar tipo"}
            variant="secondary"
            right={<Icon name="chevron-down" size={18} color={colors.text} />}
            onPress={() => setPickerOpen(true)}
          />
        </View>

        <Card level={0}>
          <Toggle
            label="Publicar en el catálogo"
            value={publicar}
            onValueChange={setPublicar}
          />
        </Card>

        <ImagePickerWeb images={images} setImages={setImages} />

        {formError ? (
          <Text color="danger" variant="small">
            {formError}
          </Text>
        ) : null}

        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Button
            title="Limpiar"
            variant="ghost"
            style={{ flex: 1 }}
            onPress={reset}
          />
          <Button
            title="Crear producto"
            style={{ flex: 2 }}
            onPress={onSubmit}
          />
        </View>
      </View>

      <TypeProductPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(item) => {
          setTipo(item);
          setPickerOpen(false);
        }}
      />

      <Sheet
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar creación"
      >
        <Text muted>{nombre}</Text>
        <Text variant="small" muted>
          {tipo?.tipo_producto} · {unidades} u. · venta {pesosFormat(valor)}
        </Text>
        <Button
          title="Crear producto"
          loading={create.isPending}
          onPress={() => create.mutate(buildFormData())}
        />
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => setConfirmOpen(false)}
        />
      </Sheet>
    </Screen>
  );
}

export default AddProductsColletion;
