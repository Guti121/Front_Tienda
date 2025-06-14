import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, useSegments } from "expo-router";

const CustomDrawerContent = (props) => {
  const { user, allowedScreens, navigation } = props;
  const router = useRouter();
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1]; // Obtiene la pantalla actual


  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}
    >
      {/* 🔹 Sección de usuario */}
      <Pressable
        style={styles.userInfoSection}
        onPress={() => {
          router.push("/profile");
        }}
      >
        <Text style={styles.username}>{user?.username || "Usuario"}</Text>
        <Text style={styles.userRole}>
          {user?.typeUser?.toUpperCase() || "SIN ROL"}
        </Text>
        <Text style={styles.userRole}>
          {user?.email?.toUpperCase() || "SIN CORREO"}
        </Text>
      </Pressable>

      {/* 🔹 Elementos de navegación */}
      {allowedScreens.length > 0 ? (
        allowedScreens.map(({ name, title, icon }) => {
          const isActive = currentScreen === name; // Comparar correctamente
          return (
            <DrawerItem
              key={name}
              label={title}
              onPress={() => navigation.navigate(name)}
              icon={icon ? () => icon({ size: 30 }) : undefined}
              style={{
                borderRadius: 15,
                backgroundColor: isActive ? "#454545" : "transparent", // Fondo activo
              }}
              labelStyle={{
                fontSize: 16,
                fontWeight: "bold",
                color: isActive ? "#fafbfd" : "#333", // Color del texto activo
              }}
            />
          );
        })
      ) : (
        <DrawerItem
          key="index"
          label="Inicio"
          onPress={() => navigation.navigate(index)}
          style={{
            borderRadius: 15,
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: "bold",
          }}
        />
      )}
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;

// 🌟 Estilos
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  userInfoSection: {
    padding: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  username: {
    textTransform: "capitalize",
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  userRole: {
    fontSize: 14,
    color: "#666",
  },
});
