import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { Keyboard } from "react-native";
import theme from "./themeStyles/theme";

const CustomDrawerContent = (props) => {
  const { user, allowedScreens, navigation } = props;
  const router = useRouter();
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1]; // Obtiene la pantalla actual


  useEffect(() => {
  const unsubscribe = navigation?.addListener?.('drawerClose', () => {
    if (typeof document !== 'undefined') {
      document.activeElement?.blur();
    }
    Keyboard.dismiss();
  });

  return unsubscribe;
}, [navigation]);



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
          const isActive = currentScreen === name // Comparar correctamente

          return (
            <DrawerItem
              key={name}
              label={title}
              onPress={() => navigation.navigate(name)}
              icon={icon ? () => icon({ size: 20, color:"white" }) : undefined}
              style={{
                borderRadius: 15,
                backgroundColor: isActive ? theme.colors.primary : "transparent", // Fondo activo
              }}
              labelStyle={{
                fontSize: 16,
                fontWeight: "bold",
                color: isActive ? "#fafbfd" : theme.colors.textSecundary, // Color del texto activo
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
                backgroundColor: "transparent", // Fondo activo
              }}
              labelStyle={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#fafbfd"  // Color del texto activo
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
    backgroundColor: theme.colors.backgroundColor,
  },
  userInfoSection: {
    padding: 5,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: theme.colors.backgroundColorSecondary,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 10,
  },
  username: {
    textTransform: "capitalize",
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
  userRole: {
    fontSize: 14,
    color: theme.colors.textSecundary,
  },
});
