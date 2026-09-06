import { Stack } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import { persistor, store } from "../src/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect } from "react";
import { getUser } from "../src/auth/session";
import { setUser } from "../src/redux/userSlice";

// Rehidrata el usuario desde storage a redux UNA sola vez al arrancar (fallback
// por si redux-persist aún no rehidrató). Antes el useEffect dependía de
// `userRedux` y podía re-ejecutarse en bucle.
const LoadUser = () => {
  const dispatch = useDispatch();
  const hasUser = useSelector((state) => !!state.user.user);

  useEffect(() => {
    if (hasUser) return;
    getUser().then((u) => {
      if (u) dispatch(setUser(u));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            name="catalog"
            options={{ presentation: "card", headerShown: false }}
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
          <Stack.Screen
            name="stockTaking"
            options={{ presentation: "card", headerShown: false }}
          />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
