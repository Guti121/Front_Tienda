import { View, Text, StyleSheet, Pressable } from "react-native";
import { iconLogout } from "../components/icons/icons";
import theme from "../components/themeStyles/theme";
import { handleLogout } from "../components/sesion/axiosRequest";
import { useDispatch } from "react-redux";
import { router } from "expo-router";
import { logout, setUser } from "../redux/userSlice";
import { persistor } from "../redux/store";

export default function Profile() {
  const dispatch = useDispatch();
  const logoutSesion = async () => {
    try {
      const response = await handleLogout();
      console.log(response);
      dispatch(logout());

      //router.replace("/login");
    } catch (error) {
      console.log(error);
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
