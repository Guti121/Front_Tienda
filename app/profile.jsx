import { View, Text, StyleSheet, Pressable } from "react-native";
import { iconLogout } from "../src/components/icons/icons";
import theme from "../src/components/themeStyles/theme";
import { handleLogout } from "../src/components/sesion/axiosRequest";
import { useDispatch } from "react-redux";
import { logout } from "../src/redux/userSlice";
import { deleteTokenStorage } from "../src/components/token/token";
import { showSessionAlert } from "../src/components/themeStyles/alerts";
import { router } from "expo-router";

export default function Profile() {
  const dispatch = useDispatch();
  const logoutSesion = async () => {
    try {
      const response = await handleLogout();
      dispatch(logout());
      deleteTokenStorage()
    } catch (error) {
      showSessionAlert(
              "Error",
              "Tu sesión no se pudo cerrar.",
              () => router.replace("/drawer")
            );
    }
  };
  return (
    <View>
      <Pressable
        style={styles.logoutButton}
        onPress={() => {
          logoutSesion();
        }}
      >
        {iconLogout({ size: 20, color: "red" })}
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#D9534F",
    borderRadius: 10,
    alignSelf: "center",
    ...theme.pressableColorCancel,
  },
  logoutText: {
    marginHorizontal: 5,
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
});
