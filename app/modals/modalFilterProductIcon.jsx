import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import theme from "../../src/components/themeStyles/theme";
import { useEffect, useState } from "react";
import { router } from "expo-router";

export default function ModalIconFilter() {
  const [selectedIndex, setSelectedIndex] = useState(null); // Estado para almacenar el índice seleccionado

  const handlePress = (index) => {
    setSelectedIndex(index);
    // Actualizar el índice seleccionado
    const returnedValue = "Valor a regresar";

    router.replace({
      pathname: "/drawer/productsDrawer",
      params: { returnedValue: index },
    }); // Devuelve un valor al componente anterio
  };

  return (
    <ScrollView style={{ flex: 1, borderWidth: 1 }}>
      {[
        "Agotado",
        "Unidades disponibles (Mayor a Menor)",
        "Unidades disponibles (Menor a Mayor)",
        "Creación de Productos (Recientes a Antiguos)",
        "Creación de Productos (Antiguos a Recientes)",
        "A-Z orden",
      ].map((item, index) => (
        <Pressable
          key={index}
          onPress={() => {
            handlePress(index);
          }} // Manejar el evento de clic
          style={[
            styles.pressableStyle,
            selectedIndex === index && styles.selectedStyle, // Aplicar estilo si está seleccionado
          ]}
        >
          <Text>{item}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  pressableStyle: {
    ...theme.borderColorInput,
    height: 50,
    borderBottomWidth: 2,
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 10,
  },
  selectedStyle: {
    backgroundColor: "#d0d0d0",
  },
});
