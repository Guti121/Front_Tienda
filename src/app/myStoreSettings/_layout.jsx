import { Stack } from "expo-router";

export default function MyStoreLayout (){
    return (
        <Stack>
            <Stack.Screen
            name="detailsMyStoreDrawer"
            options={{
                animation: "fade",
                title: "Informacion de la tienda",
                headerShown: true,
              }}
         />
       
            <Stack.Screen
            name="costsMyStoreDrawer"
            options={{
                animation: "fade",
                title: "Costos de la tienda",
                headerShown: true,
            }}
            />
            <Stack.Screen
            name="addUserCompanyDrawer"
            options={{
                animation: "fade",
                title: "Mis Aliados",
                headerShown: true,
            }}
            />
    </Stack>
    )
}