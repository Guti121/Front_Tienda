import { Linking, Share, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useQuery } from "@tanstack/react-query";

import { catalogUrl } from "../../src/api/config";
import { retrieveCompany } from "../../src/api/store";
import { useUserCAWAuthRedirect } from "../../src/redux/viewsPermissions";
import { useTheme } from "../../src/theme/ThemeProvider";
import {
  Button,
  Card,
  Icon,
  Loader,
  Screen,
  Text,
  useToast,
} from "../../src/ui";

// El catálogo público ya NO se renderiza dentro de la app: vive en su propia
// mini-app web (repo `catalog-web`). Esta pantalla solo comparte el enlace
// público de la tienda.
export default function CatalogMyStoreDrawer() {
  useUserCAWAuthRedirect();
  const { colors, spacing } = useTheme();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["company"],
    queryFn: retrieveCompany,
  });
  const storeName = data?.name;
  const url = storeName ? catalogUrl(storeName) : null;

  const open = () => {
    if (url) Linking.openURL(url);
  };

  const copy = async () => {
    if (!url) return;
    await Clipboard.setStringAsync(url);
    toast.success("Enlace del catálogo copiado");
  };

  const share = async () => {
    if (!url) return;
    try {
      await Share.share({ message: `Catálogo de ${storeName}: ${url}`, url });
    } catch {
      // el usuario canceló el diálogo de compartir
    }
  };

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="title">Catálogo público</Text>
          <Text variant="body" muted>
            Tu catálogo vive en la web. Comparte este enlace con tus clientes
            para que vean tus productos publicados y te escriban por WhatsApp.
          </Text>
        </View>

        {isLoading ? (
          <Loader />
        ) : url ? (
          <>
            <Card>
              <View style={{ gap: spacing.xs }}>
                <Text variant="caption" muted>
                  ENLACE
                </Text>
                <Text variant="body" color="primary">
                  {url}
                </Text>
              </View>
            </Card>

            <View style={{ gap: spacing.sm }}>
              <Button
                title="Abrir catálogo"
                onPress={open}
                left={
                  <Icon
                    name="open-in-new"
                    size={18}
                    color={colors.textOnBrand}
                  />
                }
              />
              <Button
                title="Copiar enlace"
                variant="secondary"
                onPress={copy}
                left={
                  <Icon name="link-variant" size={18} color={colors.text} />
                }
              />
              <Button
                title="Compartir"
                variant="secondary"
                onPress={share}
                left={
                  <Icon name="share-variant" size={18} color={colors.text} />
                }
              />
            </View>
          </>
        ) : (
          <Text variant="body" muted>
            No pudimos cargar el nombre de tu tienda. Revisa tu conexión e
            intenta de nuevo.
          </Text>
        )}
      </View>
    </Screen>
  );
}
