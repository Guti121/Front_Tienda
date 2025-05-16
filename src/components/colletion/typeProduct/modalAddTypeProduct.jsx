import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import theme, { height, width } from "../../themeStyles/theme";
import { expiredGetToken } from "../../axios/generalAxiosRequest";
import { router } from "expo-router";
import { handleCreateTypeProduct } from "../axiosRequest";
import { useState } from "react";
import { BarNotification } from "../../icons/barNotification";
import { checkIcon } from "../../icons/icons";

export const ModalAddTypeProduct = () => {
  const [error, setError] = useState(false);
  const [nameTypeProduct, setNameTypeProduct] = useState("");
  const [stateBar, setStateBar] = useState(false);

  const handleRequest = async () => {
    try {
      const token = await expiredGetToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        if (!nameTypeProduct) {
          throw new Error("El nombre del tipo de producto es obligatorio"); // Rompe el try
        }
        const request = await handleCreateTypeProduct({
          token,
          nameTypeProduct,
        });
        console.log(request);
        if (request.status === 201) {
          setStateBar(true);
          setNameTypeProduct("");
          setTimeout(() => setStateBar(false), 3000);
        }
      } catch {
        setError("Error al Crear el tipo de producto");
      }
    } catch {
      router.replace("/login");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {stateBar && (
        <BarNotification
          icon={checkIcon()}
          message="Se creo Tipo de producto exitosamente"
          color="rgb(60, 196, 60)"
        />
      )}
      <ScrollView style={{ flex: 1, ...theme.backgroundColorPrincipal }}>
        <View style={{ flex: 1 }}>
          <View style={styles.containerHeader}>
            <Text style={styles.textHeader}>
              Ingrese los datos de Tipo de producto
            </Text>
          </View>
          <View style={styles.containerStyleInput}>
            <Text style={styles.textInputStyle}>
              Nombre de Tipo de Producto
            </Text>
            <TextInput
              placeholder="Ingrese Nombre del Tipo"
              value={nameTypeProduct}
              style={styles.inputStyle}
              onChangeText={(text) => {
                setNameTypeProduct(text);
                setError(false);
              }}
            />
            {error && <Text style={{ color: "red" }}>{error}</Text>}
          </View>

          <View style={styles.containerPressable}>
            <Pressable
              style={styles.pressableCreate}
              onPressOut={() => handleRequest()}
            >
              <Text style={{ color: "white" }}>Crear</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  containerHeader: {
    width: "100%",
    height: height * 0.1,
    alignItems: "center",
    justifyContent: "center",
  },
  textHeader: { ...theme.textTitle },
  containerStyleInput: {
    padding: 5,
    width: "100%",
    height: height * 0.5,
  },
  inputStyle: {
    ...theme.textInputGlobal,
    padding: 5,
    marginVertical: 5,
  },
  containerPressable: {
    width: "100%",
    height: height * 0.1,
    alignItems: "center",
    justifyContent: "center",
  },
  pressableCreate: {
    ...theme.pressable,
    minWidth: width * 0.3,
  },
});
