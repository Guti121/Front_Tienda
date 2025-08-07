import { SafeAreaView, Text, View, ScrollView } from "react-native";
import AnimatedButton from "../catalog/stylesCatalogo/buttonAnimate";
import theme from "../themeStyles/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { handleRequestStookProducts } from "./axiosRequest";
import { expiredGetToken } from "../axios/generalAxiosRequest";
import Animated, { FadeInDown } from "react-native-reanimated";
import { pesosFormat } from "../icons/functionFormat";
import { deleteTokenStorage } from "../token/token";
import { showSessionAlert } from "../themeStyles/alerts";

export default function StocktakingPage() {
  const [data, setData] = useState(null);

  const handleRequest = async () => {
    try {
      const token = await expiredGetToken();
      if (!token) {
        deleteTokenStorage();
        router.replace("/login");
        return;
      }

      const request = await handleRequestStookProducts(token);
      setData(request.data);
    } catch (error) {
      showSessionAlert('Error','Error al obtener datos de stock')
    }
  };

  useEffect(() => {
    handleRequest();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, ...theme.backgroundColorPrincipal }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Intro Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Inventario</Text>
          <Text style={styles.description}>
            Esta sección te permite revisar el inventario de los productos en tu
            tienda y el inventario de facturación diaria o mensual.
          </Text>
          <View style={styles.optionContainer}>
            <Text style={styles.optionText}>
              Selecciona una opción para continuar:
            </Text>
          </View>
        </View>

        {/* Button */}
        <AnimatedButton
          style={{ ...theme.button, marginTop: 20 }}
          title="Ver inventario de facturación"
          textStyle={theme.textButton}
          onPress={() => router.push("/stockTaking/dailyStockTakingDrawer")}
        />

        {/* Stock Data Card */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.subtitle}>Stock Activo:</Text>

          <Animated.View entering={FadeInDown.duration(800).delay(150)}>
            <Text style={styles.dataLine}>
              Total CF: {pesosFormat(data?.total_costos_fijos)}
            </Text>
            <Text style={styles.dataLine}>
              Total precio por mayor: {pesosFormat(data?.total_precio_mayor)}
            </Text>
            <Text style={styles.dataLine}>
              Total precio de venta: {pesosFormat(data?.total_precio_venta)}
            </Text>
            <Text style={styles.dataLine}>
              Total de unidades: {data?.total_unidades_disponibles}
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  card: {
    backgroundColor: theme.colors.backgroundColorWarning,
    padding: 20,
    borderRadius: 12,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    ...theme.shadow,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    color: theme.colors.textSecundary,
    fontSize: 14,
    lineHeight: 20,
  },
  optionContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  optionText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    textAlign: "center",
  },
  dataLine: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    marginBottom: 8,
  },
};
