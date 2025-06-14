import { Stack } from "expo-router";
import { Dimensions, Platform } from "react-native";


const isIpad = Platform.OS === 'ios' && Dimensions.get('window').width >= 768;

export default function ModalsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="modalQrCodeAddUserCompany"
        options={{
          presentation:"fullScreenModal",
          animation: "fade",
          title: "Codigo Qr",
          headerShown: true,
          
        }}
      />
      <Stack.Screen
        name="modalGenerateQrCodeAddUserCompany"
        options={{
          presentation: isIpad ? "fullScreenModal": "modal", // pantalla completa en iPad,
          animation: "fade",
          title: "Agregar Aliado",
          headerShown: true,
          
        }}
      />
      <Stack.Screen
        name="modalCarDrawer"
        options={{
          presentation: "modal",
          animation: "fade",
          title: "Productos Añadidos",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="modalBarCode"
        options={{
          presentation: "modal",
          animation: "default",
          title: "Codigo Barras",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="modalFilterProductIcon"
        options={{
          presentation: "modal",
          animation: "fade",
          title: "Filtros de producto",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="modalUpdateProductDrawer"
        options={{
          presentation: "modal",
          animation: "fade",
          title: "Actualizar Producto",
        }}
      />
      <Stack.Screen
        name="modalAddTypeProductDrawer"
        options={{
          presentation: "modal",
          animation: "fade",
          title: "Crear Tipo de Producto",
        }}
      />
    </Stack>
  );
}
