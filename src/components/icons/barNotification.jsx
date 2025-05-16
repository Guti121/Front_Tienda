import React, { useState, useEffect } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import theme from "../themeStyles/theme";

export const BarNotification = ({ icon, message, color }) => {
  // Crear una referencia a la animación de la barra de carga
  const [progress] = useState(new Animated.Value(0)); // Empezamos con 0%

  // Función para animar la barra de carga
  const startLoading = () => {
    Animated.timing(progress, {
      toValue: 100, // Vamos a animar hasta el 100%
      duration: 1500, // La animación durará 5 segundos
      useNativeDriver: false, // No usar el controlador nativo para esta animación
    }).start();
  };

  useEffect(() => {
    startLoading(); // Iniciar la animación cuando el componente se monta
  }, []);

  return (
    <View style={styles.barContainer}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: color || "rgb(71, 207, 71)",
            width: progress.interpolate({
              inputRange: [0, 100], // Los valores de entrada
              outputRange: ["0%", "100%"], // Los valores de salida
            }),
          },
        ]}
      />
      <Text style={styles.staticText}>
        {icon} {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    width: "100%",
    height: 50,
    backgroundColor: "#e0e0e0", // Fondo de la barra
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center", // Centra el texto verticalmente.
    position: "relative", // Necesario para posicionar elementos absolutos dentro.
    ...theme.shadow, // Sombra personalizada.
  },
  progressBar: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute", // La barra no afecta al texto.
    top: 0,
    left: 0,
  },
  staticText: {
    position: "absolute", // Mantiene el texto fijo en el centro.
    width: "100%",
    textAlign: "center", // Centra el texto horizontalmente.
    justifyContent: "center",
    alignItems:'center',
    zIndex: 2, // Asegura que el texto esté por encima de la barra animada.
  },
});
