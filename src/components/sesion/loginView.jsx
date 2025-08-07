import React, { useEffect, useState } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
} from "react-native";
import { handleLogin } from "./axiosRequest";
import theme from "../themeStyles/theme";
import { router } from "expo-router";
import { deleteTokenStorage } from "../token/token";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/userSlice";
import Storage from "../token/localstorage";
import AnimatedButton from "../catalog/stylesCatalogo/buttonAnimate";

export default function FormLogin() {
  //Estados de los input para el form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  //Estado pressable
  const [isPressed, setIsPressed] = useState(false);
  //Estado de error
  const [error, setError] = useState(null);
  //oculata contraseña
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  //Hook para reenvio de vista
  const [callComponent, setCallComponent] = useState(false);

  //Hook redux
  const dispatch = useDispatch();

  //Funcion para hacer el llamado axios y posterio al backend
  const login = async () => {
    try {
      const request = await handleLogin(username, password);
      dispatch(setUser(request));
      setCallComponent(true);
    } catch (error) {
      await Storage.removeItem("time");
      await Storage.removeItem("username");
      await Storage.removeItem("token");
      await Storage.removeItem("Refreshtoken");
      await Storage.removeItem("user");
      dispatch(setUser(null));
      setError("Verifique las credenciales enviadas");
    }
  };

  //cambio de estado para realizar el reenvio a vista
  useEffect(() => {
    if (callComponent) {
      router.replace("/drawer");
    }
  }, [callComponent]);
  return (
    <View style={styles.containerPrincipal}>
      <View style={styles.form}>
        <View style={[styles.container, theme.shadow]}>
          <View style={styles.containerTextPresentation}>
            <Text style={styles.textTitle}>Sistema De Inventario</Text>
            <Text style={styles.textNames}>My stock app</Text>
          </View>
          <View style={styles.containerInputs}>
            <Text style={styles.textNormal}>Correo:</Text>
            <TextInput
              style={styles.TextInputUsername}
              value={username}
              onChangeText={(username) => {
                setUsername(username), setError(null);
              }}
              autoCapitalize="none"
            />
            <Text style={styles.textNormal}> Contraseña:</Text>
            <TextInput
              style={styles.TextInput}
              value={password}
              onChangeText={(password) => {
                setPassword(password), setError(null);
              }}
              secureTextEntry={!isPasswordVisible}
            />
          </View>
          {error ? <Text style={theme.errorText}>{error}</Text> : null}
          <AnimatedButton
            title={"Iniciar Sesión"}
            style={{...theme.button}}
            textStyle={theme.textPressable}
            onPress={() => login()}
          />
           
        </View>
      </View>
    </View>
  );
}

//Dimenciones de la pantalla
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  //Estilos de gradient

  //------------------------------------
  containerPrincipal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor:theme.colors.backgroundColor,
  },
  form: {
    flex: 1,
    marginTop: 30,
    alignItems: "center",

  },
  container: {
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    backgroundColor: "#fafbfd", // Asegúrate de que el fondo sea blanco o el color deseado
    borderRadius: 10,
  },
  containerTextPresentation: {
    margin: 5,
  },
  containerInputs: {
    margin: 5,
    flexDirection: "column",
    alignItems: "start",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d0d0d0",
    borderRadius: 10,
  },
  TextInput: {
    ...theme.textInputGlobal,
    marginBottom: 10,
    width: Platform.OS === "web" ? 300 : width * 0.7,
    height: 40,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  TextInputUsername: {
    ...theme.textInputGlobal,
    marginBottom: 10,
    width: Platform.OS === "web" ? 300 : width * 0.7,
    height: 40,
    paddingVertical: 10,
    paddingHorizontal: 10,
    textTransform: "lowercase",
  },
  approvedText: {
    color: "green",
    marginTop: 10,
  },

  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    maxHeight: "80%", // Limita la altura del modal
  },
  textTitle: {
    ...theme.textTitle,
    ...Platform.select({
      android: { fontSize: 20 },
      ios: { fontSize: 20 },
    }),
  },
  textNames: {
    ...theme.textNames,
    ...Platform.select({
      android: { fontSize: 15 },
      ios: { fontSize: 15 },
    }),
  },
  textNormal: {
    ...theme.textNormal,
    ...Platform.select({
      android: { fontSize: 15 },
      ios: { fontSize: 15 },
    }),
  },
  textBussines: {
    ...theme.textNames,
    fontSize: 12,
  },

  circle: {
    width: 80, // Ancho del círculo
    height: 80, // Altura del círculo
    borderRadius: 100,
    resizeMode: "stretch",
  },
  textPressed: {
    ...theme.textPressable,
    color: "black",
  },
});
