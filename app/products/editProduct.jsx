import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Platform
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { expiredGetToken } from "../../src/components/axios/generalAxiosRequest";
import { handlePatchProduct } from "../../src/components/colletion/axiosRequest";
import theme from "../../src/components/themeStyles/theme";
import { cleanNumber, formatToCOP } from "../../src/components/icons/functionFormat";
import ImagePickerWeb from "../../src/components/colletion/componentWebimage";
import { isWeb } from "../../src/components/token/localstorage";
import { asCalendarConsumer } from "react-native-calendars";

export default function ModalEditProductDrawer() {
  const { product } = useLocalSearchParams();
  const parsedProduct = JSON.parse(product);
  const valorProduct = Number.isInteger(+parsedProduct.valor) ? +parsedProduct.valor : 0;
  
  const [valor, setValor] = useState(formatToCOP(String(valorProduct)));

  const [nombre, setNombre] = useState(parsedProduct.nombre || "");
  const [detalles, setDetalles] = useState(parsedProduct.detalles || "");
  const [publicar, setPublicar] = useState(Boolean(parsedProduct.publicar));
  const [productImages, setProductImages] = useState([]);


  const handleSave = async () => {
  try {
    const numericValor = cleanNumber(valor);

    if (!numericValor || parseInt(numericValor) === 0) {
      alert("El valor del producto no puede ser 0.");
      return;
    }

    const token = await expiredGetToken();
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("valor", numericValor);
    formData.append("detalles", detalles);
    formData.append("publicar", publicar);

   
    if (productImages?.length > 0) {
        productImages.forEach((img, index) => {
          if (img?.file instanceof File) {
            // Web o navegador móvil
            formData.append("imagenes", img.file);
            const { name, type, size } = img.file;
            alert(`Nombre: ${name}\nTipo: ${type}\nTamaño: ${size} bytes`);
          } else if (img?.uri) {
            alert(img?.uri)
            // Solo para apps móviles (Expo nativo)
            const uriParts = img.uri.split(".");
            const fileType = uriParts[uriParts.length - 1];

            formData.append("imagenes", {
              uri: img.uri,
              name: `image_${index}.${fileType}`,
              type: `image/${fileType}`,
            });
          }
        });
      }


    const response = await handlePatchProduct(parsedProduct.id, formData, token);
    router.back();
  } catch (e) {
    alert("Error al actualizar el producto:", e.error || e.message || e);
  }

};



  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Editar Producto</Text>
      
      <Text style={{ marginTop: 10 }}>Nombre</Text>
      <TextInput
        value={nombre}
        onChangeText={setNombre}
        style={{
          borderBottomWidth: 1,
          borderColor: "#ccc",
          marginBottom: 15,
          padding: 5,
        }}
      />

      <Text>Valor</Text>
      <TextInput
        value={valor}
        onChangeText={(text) => {
          setValor(formatToCOP(text));
        }}
        keyboardType="numeric"
        style={{
          borderBottomWidth: 1,
          borderColor: "#ccc",
          marginBottom: 15,
          padding: 5,
        }}
      />


      <Text>Detalles</Text>
      <TextInput
        value={detalles}
        onChangeText={setDetalles}
        multiline
        numberOfLines={4}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 20,
          textAlignVertical: "top",
        }}
      />

      {/* Switch publicar */}
      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
        <Text style={{ marginRight: 10 }}>¿Publicar?</Text>
        <Pressable
          onPress={() => setPublicar((prev) => !prev)}
          style={{
            width: 50,
            height: 30,
            borderRadius: 15,
            backgroundColor: publicar ? "#5e5ce6" : "gray",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 25,
              height: 25,
              borderRadius: 12.5,
              backgroundColor: "white",
              marginLeft: publicar ? 22 : 2,
            }}
          />
        </Pressable>
      </View>

      {/* 📸 Vista previa imágenes */}
      <ScrollView horizontal style={{ marginBottom: 15 }}>
        {productImages.map((img, i) => (
          <Image
            key={i}
            source={{ uri: img.uri }}
            style={{ width: 100, height: 100, marginRight: 10, borderRadius: 10 }}
          />
        ))}
      </ScrollView>
      <ImagePickerWeb images={productImages} setImages={setProductImages} />
        
     

      {/* Guardar */}
      <Pressable
        onPress={handleSave}
        style={{
          backgroundColor: theme.colors.primary,
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Guardar Cambios</Text>
      </Pressable>
    </ScrollView>
  );
}
