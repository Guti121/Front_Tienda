import { Stack } from "expo-router";


export default function StockTakingLayout(){
    return(
        <Stack>
            <Stack.Screen
                name="dailyStockTakingDrawer"
                options={{
                    presentation: "modal",
                    animation: "fade",
                    title: "Inventario Diario",
                    headerShown: true,
                }}
            />
        </Stack>
    )
}