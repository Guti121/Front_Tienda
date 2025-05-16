import { Stack } from "expo-router";

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen name="addTypeProductDrawer" />
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
