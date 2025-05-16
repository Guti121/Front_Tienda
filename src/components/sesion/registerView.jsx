import React, { useState } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  Text,
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { handleRegister } from "./axiosRequest";
import theme from "../themeStyles/theme";

export default function FormRegister() {
  // Estados para errores
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  // Estados para los inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Estados adicionales
  const [isPressed, setIsPressed] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [validate, setValidate] = useState("");

  // Función para limpiar errores
  const cleanErrors = () => {
    setEmailError(false);
    setUsernameError(false);
    setError("");
  };

  // Validación de correo
  const validateEmail = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setError("Correo inválido. Debe contener una '@' y al menos un '.'");
    } else {
      setError("");
    }
  };

  // Validación de contraseña
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

  // Manejo de cambio de contraseña
  const handlePasswordChange = (password) => {
    setPassword(password);
    if (!validatePassword(password)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial."
      );
    } else {
      cleanErrors();
    }
  };

  // Registro de usuario
  const registerUser = async () => {
    try {
      const data = {
        username,
        email,
        password,
        password_verify: passwordConfirm,
        last_name: lastName,
        first_name: name,
      };
      const request = await handleRegister(data);
      if (request.status === 201) {
        setValidate("¡Usuario creado con éxito!");
      }
    } catch (error) {
      console.log(error);
      setUsernameError(error.response?.data?.username || false);
      setEmailError(error.response?.data?.email || false);
      setError("Verifique los datos ingresados");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.containerPrincipal}>
          <View style={styles.form}>
            <View style={[styles.container, theme.shadow]}>
              <View style={styles.containerTextPresentation}>
                <Text style={styles.textTitle}>Sistema De Inventario</Text>
                <Text style={styles.textNames}>Crear Usuario</Text>
              </View>
              <View style={styles.containerInputs}>
                <Text style={styles.textNormal}>Correo:</Text>
                <TextInput
                  style={styles.TextInputUsername}
                  value={email}
                  onChangeText={validateEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
                {emailError && (
                  <Text style={{ color: "red" }}>{emailError}</Text>
                )}

                <Text style={styles.textNormal}>Username:</Text>
                <TextInput
                  style={styles.TextInputUsername}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    cleanErrors();
                  }}
                  autoCapitalize="none"
                />
                {usernameError && (
                  <Text style={{ color: "red" }}>{usernameError}</Text>
                )}

                <Text style={styles.textNormal}>Nombre:</Text>
                <TextInput
                  style={styles.TextInputUsername}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    cleanErrors();
                  }}
                  autoCapitalize="characters"
                />
                <Text style={styles.textNormal}>Apellidos:</Text>
                <TextInput
                  style={styles.TextInputUsername}
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    cleanErrors();
                  }}
                  autoCapitalize="characters"
                />

                <Text style={styles.textNormal}>Contraseña:</Text>
                <TextInput
                  style={styles.TextInput}
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!isPasswordVisible}
                />

                <Text style={styles.textNormal}>Confirma tu Contraseña:</Text>
                <TextInput
                  style={styles.TextInput}
                  value={passwordConfirm}
                  onChangeText={(text) => {
                    setPasswordConfirm(text);
                    if (password !== text) {
                      setError("Las contraseñas no coinciden.");
                    } else {
                      cleanErrors();
                    }
                  }}
                  secureTextEntry={!isPasswordVisible}
                />
              </View>
              {error && <Text style={{ color: "red" }}>{error}</Text>}
              {validate && <Text style={{ color: "green" }}>{validate}</Text>}

              <Pressable
                disabled={!!error}
                style={[theme.pressable, isPressed || (error && theme.pressed)]}
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}
                onPress={registerUser}
              >
                <Text style={theme.textPressable}>Registrarse</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Dimensiones de la pantalla
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  containerPrincipal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    ...theme.backgroundColorPrincipal,
  },
  form: {
    flex: 1,
    width: Platform.OS === "web" ? 350 : width * 0.8,
    marginTop: 30,
    alignItems: "center",
    backgroundColor: "#fafbfd",
  },
  container: {
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    backgroundColor: "#fafbfd",
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
  textTitle: {
    ...theme.textTitle,
    fontSize: 20,
  },
  textNames: {
    ...theme.textNames,
    fontSize: 15,
  },
  textNormal: {
    ...theme.textNormal,
    fontSize: 15,
  },
});
