import { Stack } from "expo-router";

export default function LayoutBillsGenerate() {
  return (
    <Stack>
      <Stack.Screen
        name="billsGenerateDetailDrawer"
        options={{ title: "Detalle de Factura" }}
      />
    </Stack>
  );
}
