import { useState } from "react";
import { View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

import { validateAllyQr } from "../../src/api/store";
import { deleteTokenStorage } from "../../src/components/token/token";
import { useUserCAWAuthRedirect } from "../../src/redux/viewsPermissions";
import { useTheme } from "../../src/theme/ThemeProvider";
import { Button, Card, Screen, Text, useToast } from "../../src/ui";

export default function AddToCompanyDrawer() {
  useUserCAWAuthRedirect();
  const { spacing, radii } = useTheme();
  const toast = useToast();
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const onScan = async ({ data }) => {
    setScanned(true);
    setBusy(true);
    try {
      const parsed = JSON.parse(data);
      const res = await validateAllyQr(parsed.token);
      setDone(res?.message || "Vinculación exitosa.");
      toast.success("Vinculado a la tienda. Vuelve a iniciar sesión.");
      setTimeout(() => deleteTokenStorage(), 1200); // clearSession + /login
    } catch {
      toast.error("El código QR no es válido.");
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={{ gap: spacing.lg }}>
        <Card level={0}>
          <Text weight="bold">Vincularme a una tienda</Text>
          <Text muted variant="small" style={{ marginTop: spacing.xs }}>
            Escanea el código QR que te compartió el dueño de la tienda. Al
            vincularte tendrás que iniciar sesión de nuevo.
          </Text>
        </Card>

        {done ? (
          <Card level={1}>
            <Text color="success" weight="bold">
              {done}
            </Text>
          </Card>
        ) : !permission?.granted ? (
          <Card level={0} style={{ gap: spacing.sm }}>
            <Text muted>Necesitamos la cámara para escanear el QR.</Text>
            <Button title="Permitir cámara" onPress={requestPermission} />
          </Card>
        ) : (
          <View
            style={{
              height: 300,
              borderRadius: radii.lg,
              overflow: "hidden",
              backgroundColor: "#000",
            }}
          >
            <CameraView
              style={{ flex: 1 }}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={scanned || busy ? undefined : onScan}
            />
          </View>
        )}

        {scanned && !done ? (
          <Button
            title="Escanear de nuevo"
            variant="ghost"
            onPress={() => {
              setScanned(false);
              setBusy(false);
            }}
          />
        ) : null}
      </View>
    </Screen>
  );
}
