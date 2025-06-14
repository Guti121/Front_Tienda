import { View, StyleSheet } from "react-native";
import ModalCar from "../../src/components/billing/modalCar"; // Asegúrate de que la ruta sea correcta
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function ModalCarDrawer() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ModalCar />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  principalContainer: {
    flex: 1,
    backgroundColor: "white", // Fondo del contenido principal
  },
});
