import { router, Stack, useRouter } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import { persistor, store } from "../redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect } from "react";
import Storage from "../components/token/localstorage";
import { setUser } from "../redux/userSlice";

//hacemos un funcion para recuperar el tipo de usuario y almacenarlo en redux

// Recuperar usuario almacenado

const LoadUser = () => {
  const dispatch = useDispatch(); // 🔹 useDispatch debe estar aquí, fuera de funciones asíncronas
  const userRedux = useSelector((state) => state.user.user);

  useEffect(() => {
    const loadU = async () => {
      try {
        const storedUser = await Storage.getItem("user");
        console.log("Usuario en Storage:", storedUser);

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("entre a renovacion", parsedUser);
          // 🔹 Solo actualizar Redux si el usuario es diferente al actual
          if (
            !userRedux ||
            JSON.stringify(userRedux) !== JSON.stringify(parsedUser)
          ) {
            console.log("entre a If renovacion");
            dispatch(setUser(parsedUser));
          }
        }
      } catch (error) {
        console.log(error, "error de layout cambio de storage");
        router.replace("/login");
      }
    };

    loadU();
  }, [dispatch, userRedux]); // Dependencia: solo se ejecuta si `userRedux` cambia

  return null;
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LoadUser />
        <Stack>
          {/* Pantalla principal de la aplicación */}
          <Stack.Screen
            name="index"
            options={{ headerShown: false, title: "Inicio" }}
          />

          {/* Pantalla de Login */}
          <Stack.Screen
            name="login"
            options={{ headerShown: false, title: "Login" }}
          />
          <Stack.Screen
            name="badRequest"
            options={{ headerShown: false, title: "Bad" }}
          />
          <Stack.Screen
            name="profile"
            options={{ headerShown: true, title: " Mi Perfil" }}
          />

          {/* Rutas dentro del drawer */}
          <Stack.Screen name="drawer" options={{ headerShown: false }} />

          <Stack.Screen
            name="modals"
            options={{ presentation: "modal", headerShown: false }}
          />

          <Stack.Screen
            name="products"
            options={{ presentation: "card", headerShown: false }}
          />
          <Stack.Screen
            name="myStoreSettings"
            options={{ presentation: "card", headerShown: false }}
          />

          <Stack.Screen
            name="billsGenerate"
            options={{ presentation: "card", headerShown: false }}
          />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
