// Visor de imagen a pantalla completa para el detalle de producto (admin).
// Vivía en `src/components/catalog/stylesCatalogo/` — se movió aquí al sacar el
// catálogo público a su propia mini-app web.
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Text,
  Image,
  useWindowDimensions,
} from "react-native";

export default function ImageModal({ visible, imageUri, onClose }) {
  const { width: screenWidth } = useWindowDimensions();

  if (!imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.8)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={onClose}
          style={{ position: "absolute", top: 30, right: 30, zIndex: 2 }}
        >
          <Text style={{ color: "white", fontSize: 18 }}>✕ Cerrar</Text>
        </Pressable>

        <Image
          source={{ uri: imageUri }}
          style={{
            width: screenWidth > 600 ? 500 : screenWidth * 0.9,
            height: screenWidth > 600 ? 600 : screenWidth * 1.2,
            borderRadius: 15,
            resizeMode: "contain",
          }}
        />
      </View>
    </Modal>
  );
}
