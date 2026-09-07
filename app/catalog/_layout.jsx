import { Stack } from "expo-router";
import { CartProvider } from "../../src/components/catalog/CartContext";
export default function ProductsLayout() {
  return (
    <CartProvider>
      <Stack>
        <Stack.Screen
          name="productDetail"
          options={{
            presentation: "card",
            animation: "default",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="car"
          options={{
            presentation: "card",
            animation: "default",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="[myCatalog]"
          options={{
            headerShown: false,
            animation: "default",
            presentation: "card",
            title: "Catalogo",
          }}
        />
      </Stack>
    </CartProvider>
  );
}
