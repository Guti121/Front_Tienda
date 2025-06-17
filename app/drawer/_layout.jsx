import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Text, View } from "react-native";
import { iconEye, iconQrCode, iconStore } from "../../src/components/icons/icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import CustomDrawerContent from "../../src/components/customDrawer";

// 🔥 Filtrar pantallas según el tipo de usuario
export const getAllowedScreens = (user) => {
  if (!user || !user.typeUser) return []; // Si no hay usuario, no hay pantallas

  const role = user.typeUser;

  const screens = [
    {
      name: "index",
      title: "Principal",
      allowed: ["creator", "admin", "worker", "cliente"],
    },
    {
      name: "billDrawer",
      title: "Facturar",
      allowed: ["creator", "admin", "worker"],
    },
    {
      name: "addProductsColletionDrawer",
      title: "Ingreso de producto",
      allowed: ["creator"],
    },
    {
      name: "productsDrawer",
      title: "Productos",
      allowed: ["creator", "admin"],
    },
    {
      name: "billsGenerateDrawer",
      title: "Ver Facturas",
      icon: iconEye,
      allowed: ["creator","admin"],
    },
    {
      name: "settingsStoreDrawer",
      title: "Mi tienda",
      icon: iconStore,
      allowed: ["creator",'admin'],
    },
    {
      name: "addToCompanyDrawer",
      title: "Qr Aliado",
      icon: iconQrCode,
      allowed: ["cliente"],
    },
  ];

  const filteredScreens = screens.filter((screen) =>
    screen.allowed.includes(role)
  );


  return filteredScreens;
};

export default function Layout() {
  const router = useRouter();
  const user = useSelector((state) => state.user.user);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Indica que el componente ya montó
  }, []);

  useEffect(() => {
    if (isMounted && !user) {
      router.replace("/login");
    }
  }, [user]);
  const allowedScreens = getAllowedScreens(user);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Drawer
        screenOptions={{
          drawerContentStyle: styles.drawerContentStyles,
          drawerLabelStyle: styles.drawerLabel,
        }}
        drawerContent={(props) => (
          <CustomDrawerContent
            {...props}
            user={user}
            allowedScreens={allowedScreens}
          />
        )} // ✅ Aquí debe ir el CustomDrawerContent
      >
        {allowedScreens.map((screen) => (
          <Drawer.Screen
            key={screen.name}
            name={screen.name}
            options={{
              title: screen.title, // ✅ Título en la barra superior (Header)
              drawerLabel: screen.title, // ✅ Título en el Drawer
              drawerIcon: screen.icon
                ? () => screen.icon({ size: 30 })
                : undefined, // ✅ Icono opcional
            }}
          />
        ))}
      </Drawer>
    </GestureHandlerRootView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    flex: 1,
  },
  drawerContentStyles: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

const screenStyleCustoms = () => ({
  drawerItemStyle: { borderRadius: 15 },
  drawerActiveBackgroundColor: "#454545",
  drawerActiveTintColor: "#fafbfd",
  drawerLabelStyle: { fontSize: 16, fontWeight: "bold" },
});
