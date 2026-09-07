import { View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useQuery } from "@tanstack/react-query";

import { retrieveCompany } from "../../src/api/store";
import { useUserCAWAuthRedirect } from "../../src/redux/viewsPermissions";
import { useTheme } from "../../src/theme/ThemeProvider";
import { Button, Icon, useToast } from "../../src/ui";
import { CartProvider } from "../../src/components/catalog/CartContext";
import PrincipalCatalog from "../../src/components/catalog/principalCatalog";

export default function CatalogMyStoreDrawer() {
  useUserCAWAuthRedirect();
  const { colors, spacing } = useTheme();
  const toast = useToast();

  const { data } = useQuery({
    queryKey: ["company"],
    queryFn: retrieveCompany,
  });
  const storeName = data?.name;

  const copyLink = async () => {
    if (!storeName) return;
    await Clipboard.setStringAsync(
      `https://mystockapp.site/catalog/${encodeURIComponent(storeName)}`,
    );
    toast.success("Enlace del catálogo copiado");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
        <Button
          title="Copiar link del catálogo"
          variant="secondary"
          left={<Icon name="link-variant" size={18} color={colors.text} />}
          onPress={copyLink}
        />
      </View>
      {storeName ? (
        <CartProvider>
          <PrincipalCatalog name={storeName} />
        </CartProvider>
      ) : null}
    </View>
  );
}
