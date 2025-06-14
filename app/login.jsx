import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FormLogin from "../src/components/sesion/loginView";
import theme, { width } from "../src/components/themeStyles/theme";
import { useState } from "react";
import FormRegister from "../src/components/sesion/registerView";
import { useSelector } from "react-redux";

export default function Login() {
  const [isPressedLoginWindow, setIsPressedLoginWindow] = useState(true);
  const [isPressedRegisterWindow, setIsPressedRegisternWindow] =
    useState(false);
  const user = useSelector((state) => state.user.user);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.containerPrincipal}>  
        <View style={styles.selectWindow}>
          <Pressable
            style={[
              styles.selectWindowPressable,
              ,
              isPressedLoginWindow ? theme.pressed : null, // Aplica estilo adicional si está presionado
            ]}
            onPressIn={() => setIsPressedLoginWindow(true)} // Cambia el estado a verdadero cuando se presiona
            onPressOut={() => {
              setTimeout(() => {
                setIsPressedRegisternWindow(false);
              }, 50);
            }}
          >
            <Text
              style={[
                isPressedLoginWindow ? styles.textPressed : theme.textPressable,
              ]}
            >
              Iniciar Sesión
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.selectWindowPressable,
              isPressedRegisterWindow ? theme.pressed : null, // Aplica estilo adicional si está presionado
            ]}
            onPressIn={() => setIsPressedRegisternWindow(true)} // Cambia el estado a verdadero cuando se presiona
            onPressOut={() => {
              setTimeout(() => {
                setIsPressedLoginWindow(false);
              }, 5);
            }}
          >
            <Text
              style={[
                isPressedRegisterWindow
                  ? styles.textPressed
                  : theme.textPressable,
              ]}
            >
              Registrase
            </Text>
          </Pressable>
        </View>
        <View style={{ flex: 1, width: "100%" }}>
          {!isPressedRegisterWindow ? <FormLogin /> : <FormRegister />}
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  containerPrincipal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    ...theme.backgroundColorPrincipal,
  },
  selectWindow: {
    width: Platform.OS === "web" ? 350 : width * 0.9,
    padding: 5,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#d0d0d0",
    flexDirection: "row",
    backgroundColor: "#fafbfd",
    ...theme.shadow,
    margin: 20,
    //alineamos los items internos

    justifyContent: "center",
  },
  selectWindowPressable: {
    ...theme.pressable,
    flex: 1,
    marginHorizontal: 1,
  },
  textPressed: {
    ...theme.textPressable,
    color: "black",
  },
});
