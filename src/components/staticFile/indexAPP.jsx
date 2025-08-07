import { useEffect, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import theme from "../themeStyles/theme";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  FadeInDown,
  withTiming,
  Easing
} from "react-native-reanimated";

export default function IndexAppInfo() {
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const useFadeInOnScroll = (triggerY) =>
    useAnimatedStyle(() => {
      const isVisible = scrollY.value > triggerY - 600 && scrollY.value < triggerY + 600;
      return {
        opacity: withTiming(isVisible ? 1 : 0, {
          duration: 400,
          easing: Easing.out(Easing.ease),
        }),
        transform: [{ scale: withTiming(isVisible ? 1 : 0.95, { duration: 400 }) }],
      };
    });

  const AnimatedImageBlock = ({ uri, title, description }) => {
    const [layoutY, setLayoutY] = useState(0);
    const animatedStyle = useFadeInOnScroll(layoutY);

    return (
      <View onLayout={(e) => setLayoutY(e.nativeEvent.layout.y)} style={{ width: "100%", alignItems: "center" }}>
        <Animated.View style={animatedStyle}>
          <ImageBackground source={{ uri }} style={styles.image} resizeMode="cover">
            <LinearGradient colors={["transparent", "rgba(47, 47, 146,1)"]} style={styles.gradient} />
            <Text style={styles.text}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </ImageBackground>
        </Animated.View>
      </View>
    );
  };

  const InfoBlock = () => (
    <Animated.View
      entering={FadeInDown.duration(800).delay(500)}
      style={styles.infoBlock}
    >
      <Text style={styles.infoText}>
        Uno de los grandes beneficios de esta app es que **no necesitas computador ni lector de códigos de barras**.
        Está diseñada para funcionar con los recursos mínimos, directamente desde tu celular.
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(47, 47, 146, 1)" }}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}>
        <View style={{ flex: 1, padding: 20, alignItems: "center" }}>
          <Animated.View
            entering={FadeInDown.duration(800).delay(100)}
            style={styles.welcomeCard}
          >
            <LinearGradient
              colors={["#5e5ce6", "#7a7add"]}
              style={styles.welcomeGradient}
            >
              <Text style={styles.welcomeText}>Bienvenido a My stock app</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(800).delay(300)}>
            <Text style={styles.subtitle}>
                Esta app ha sido diseñada como una herramienta de apoyo para gestionar de forma sencilla y eficiente la facturación y el inventario de tu tienda. Además, incluye funcionalidades adicionales que te encantarán. A continuación, te presentamos algunos de sus beneficios:
            </Text>
          </Animated.View>

          <InfoBlock />

          <AnimatedImageBlock
            uri="https://media-stockapp03042025.s3.us-east-2.amazonaws.com/staticFiles/Captura+de+pantalla+2025-08-01+185604.png"
            title="Zona Facturación"
            description="Podrás facturar y enviar la factura a tu cliente."
          />

          <AnimatedImageBlock
            uri="https://media-stockapp03042025.s3.us-east-2.amazonaws.com/staticFiles/Captura+de+pantalla+2025-08-01+185203.png"
            title="Catálogo"
            description="Tus clientes podrán ver los productos disponibles en tiempo real y realizar su pedido por WhatsApp."
          />

          <AnimatedImageBlock
            uri="https://media-stockapp03042025.s3.us-east-2.amazonaws.com/staticFiles/Captura+de+pantalla+2025-08-01+200218.png"
            title="Códigos de Barras"
            description="Generación de código de barras para cada producto."
          />

          <AnimatedImageBlock
            uri="https://media-stockapp03042025.s3.us-east-2.amazonaws.com/staticFiles/Captura+de+pantalla+2025-08-01+203230.png"
            title="Asignar Colaboradores"
            description="Asigna roles a cada trabajador y controla tu tienda de forma colaborativa."
          />

          <AnimatedImageBlock
            uri="https://media-stockapp03042025.s3.us-east-2.amazonaws.com/staticFiles/Captura+de+pantalla+2025-08-01+201223.png"
            title="Inventario y Facturación"
            description="Gestión de inventario y ventas con vista en tiempo real."
          />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 500,
    width: Dimensions.get("window").width >= 768 ? 600 : "100%",
    justifyContent: "flex-end",
    marginBottom: 30,
    overflow: "hidden",
    borderRadius: 12,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  text: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    paddingHorizontal: 10,
    fontWeight: "bold",
  },
  description: {
    paddingHorizontal: 10,
    color: theme.colors.textSecundary,
    ...theme.textNormal,
    paddingBottom: 20,
  },
  welcomeCard: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    ...theme.shadow,
    shadowColor: "white",
  },
  welcomeGradient: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    ...theme.textTitle,
    color: "white",
    fontWeight: "bold",
  },
  subtitle: {
    color: theme.colors.textSecundary,
    ...theme.textNormal,
    paddingVertical: 20,
  },
  infoBlock: {
    backgroundColor: "#ffffff10",
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#ffffff30",
    maxWidth: 600,
  },
  infoText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
