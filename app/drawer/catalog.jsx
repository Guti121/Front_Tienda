import { View, Alert, SafeAreaView } from "react-native";
import AnimatedButton from "../../src/components/catalog/stylesCatalogo/buttonAnimate";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { expiredGetToken } from "../../src/components/axios/generalAxiosRequest";
import { deleteTokenStorage } from "../../src/components/token/token";
import { handleListDetailStore } from "../../src/components/settingsStore/axiosRequest";
import * as Clipboard from "expo-clipboard";
import theme from "../../src/components/themeStyles/theme";
import PrincipalCatalog from "../../src/components/catalog/principalCatalog";

export default function CatalogMyStoreDrawer() {
  const [nameStore, setNameStore] = useState("");
  const router = useRouter();

  const handleRequest = async () => {
    try {
      const token = await expiredGetToken();
      if (!token) {
        deleteTokenStorage();
        router.replace("/login");
        return;
      }
      const request = await handleListDetailStore(token);
      setNameStore(request.data.name);
    } catch (error) {
      console.error("Error loading store:", error);
    }
  };

  useEffect(() => {
    handleRequest();
  }, []);

  const copyCatalogLink = async () => {
    if (!nameStore) return;
    const url = `https://mystockapp.site/catalog/${nameStore}`; // cambia por tu dominio real
    await Clipboard.setStringAsync(url);
    Alert.alert("Link copiado", "El enlace del catálogo ha sido copiado al portapapeles.");
  };

  

  return (
    <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 20 ,flex:1,backgroundColor:theme.colors.backgroundColorSecondary}}>
        <AnimatedButton
            title="Copiar link del catálogo"
            onPress={copyCatalogLink}
            style={{ padding: 10, backgroundColor: "#5e5ce6", margin: 10, borderRadius: 10 }}
            textStyle={{ color: "white", fontWeight: "bold", textAlign: "center" }}
            />
        <PrincipalCatalog name={nameStore} />
        </View>
    </SafeAreaView>
  );
}
