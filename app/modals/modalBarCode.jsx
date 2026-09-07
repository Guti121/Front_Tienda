import { useState } from "react";
import { View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import { lookupBarcodeText, lookupBarcodeImage } from "../../src/api/billing";
import { addToCart } from "../../src/hooks/useCart";
import { isWeb } from "../../src/components/token/localstorage";
import { pesosFormat } from "../../src/components/icons/functionFormat";
import { useTheme } from "../../src/theme/ThemeProvider";
import {
  Button,
  Card,
  Icon,
  Screen,
  Sheet,
  Stepper,
  Text,
  TextField,
  useToast,
} from "../../src/ui";

export default function ModalBarCode() {
  const { colors, spacing, radii } = useTheme();
  const toast = useToast();
  const [permission, requestPermission] = useCameraPermissions();

  const [code, setCode] = useState("");
  const [scanned, setScanned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState(null); // producto encontrado -> Sheet
  const [qty, setQty] = useState(1);

  const lookupText = async (value) => {
    if (!value) return;
    setBusy(true);
    try {
      const product = await lookupBarcodeText(value);
      if (product?.id) {
        setFound(product);
        setQty(1);
      } else {
        toast.error("Producto no encontrado.");
      }
    } catch {
      toast.error("Producto no encontrado.");
    } finally {
      setBusy(false);
    }
  };

  const lookupPhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    const picked = res.canceled
      ? await ImagePicker.launchImageLibraryAsync({ quality: 0.6 })
      : res;
    if (picked.canceled) return;
    const asset = picked.assets[0];
    setBusy(true);
    try {
      const fd = new FormData();
      if (isWeb) {
        const blob = await (await fetch(asset.uri)).blob();
        fd.append(
          "imagen",
          new File([blob], "foto.jpg", { type: "image/jpeg" }),
        );
      } else {
        fd.append("imagen", {
          uri: asset.uri,
          name: "foto.jpg",
          type: "image/jpeg",
        });
      }
      fd.append("cantidad", "1");
      const product = await lookupBarcodeImage(fd);
      if (product?.id) {
        setFound(product);
        setQty(1);
      } else {
        toast.error("No se reconoció el producto.");
      }
    } catch {
      toast.error("No se pudo procesar la foto.");
    } finally {
      setBusy(false);
    }
  };

  const addFound = async () => {
    await addToCart(
      {
        producto: found.id,
        nombrePro: found.nombre,
        valorPro: found.valor,
      },
      qty,
    );
    toast.success(`${found.nombre} · ${qty} u. en el carrito`);
    setFound(null);
    setScanned(false);
  };

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <TextField
          label="Código de barras"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          placeholder="Ingresa el código manualmente"
          right={
            <Icon
              name="magnify"
              size={22}
              color={colors.primary}
              onPress={() => lookupText(code.trim())}
            />
          }
        />

        {isWeb ? (
          <Button
            title="Tomar / subir foto del producto"
            variant="secondary"
            loading={busy}
            left={<Icon name="camera-outline" size={18} color={colors.text} />}
            onPress={lookupPhoto}
          />
        ) : !permission?.granted ? (
          <Card level={0} style={{ gap: spacing.sm }}>
            <Text muted>Necesitamos la cámara para escanear el código.</Text>
            <Button title="Permitir cámara" onPress={requestPermission} />
          </Card>
        ) : (
          <View
            style={{
              height: 280,
              borderRadius: radii.lg,
              overflow: "hidden",
              backgroundColor: "#000",
            }}
          >
            <CameraView
              style={{ flex: 1 }}
              barcodeScannerSettings={{
                barcodeTypes: ["ean13", "ean8", "upc_a"],
              }}
              onBarcodeScanned={
                scanned || busy
                  ? undefined
                  : ({ data }) => {
                      setScanned(true);
                      lookupText(data);
                    }
              }
            />
          </View>
        )}

        {scanned && !isWeb ? (
          <Button
            title="Escanear de nuevo"
            variant="ghost"
            onPress={() => setScanned(false)}
          />
        ) : null}
      </View>

      <Sheet
        visible={!!found}
        onClose={() => {
          setFound(null);
          setScanned(false);
        }}
        title={found?.nombre ?? ""}
      >
        {found ? (
          <>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text muted>Precio</Text>
              <Text weight="bold">{pesosFormat(found.valor)}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text muted>Cantidad</Text>
              <Stepper value={qty} onChange={setQty} />
            </View>
            <Button title="Agregar al carrito" onPress={addFound} />
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}
