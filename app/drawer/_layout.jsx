import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Text, View } from "react-native";
import { iconEye, iconQrCode, iconStore } from "../../src/components/icons/icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import CustomDrawerContent from "../../src/components/customDrawer";
import theme from "../../src/components/themeStyles/theme";

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
      name: "stocktaking",
      title: "Inventario",
      allowed: ["creator"],
    },
     {
      name: "catalog",
      title: "Catalogo",
      allowed: ["creator", "admin", "worker"],
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
            drawerItemStyle: styles.drawerItemStyle,
            drawerActiveTintColor: "#ffffff",
            drawerActiveBackgroundColor: "#5e5ce6",
            headerTintColor: theme.colors.textSecundary,
            headerStyle: {
              backgroundColor:theme.colors.backgroundColor, 
              ...theme.shadow,
              shadowColor: theme.colors.primary,

            },
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
                ? () => screen.icon({ size: 24 }) // ✅ Icono del Drawer
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
    flex: 1,
    backgroundColor: "#ffffff", // fondo general
  },
  drawerContentStyles: {
    flex: 1,
    backgroundColor: "#f0f0f0", // fondo del drawer
  },
  drawerLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e1e1e",
  },
  drawerItemStyle: {
    borderRadius: 10,
    marginVertical: 4,
  },
});




const screenStyleCustoms = () => ({
  drawerItemStyle: { borderRadius: 15 },
  drawerActiveBackgroundColor: "#454545",
  drawerActiveTintColor: "#fafbfd",
  drawerLabelStyle: { fontSize: 16, fontWeight: "bold" },
});
