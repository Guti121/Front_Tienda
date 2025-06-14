import { Stack } from "expo-router";

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen name="addTypeProductDrawer"
        options={{
          presentation: "card",
          animation: "default",
          title: "Crear Tipo de Producto",
          headerShown: true,
        }} />

      <Stack.Screen
        name="detailProduct"
        options={{
          presentation: "card",
          animation: "default",
          title: "Detalles del Producto",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
