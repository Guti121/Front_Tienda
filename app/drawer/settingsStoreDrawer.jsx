import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import theme from "../../src/components/themeStyles/theme";
import {
  iconInfo,
  iconPersonPlus,
  iconSettingsBlack,
  iconSignalMoney,
} from "../../src/components/icons/icons";
import { router } from "expo-router";
import { useUserCAAuthRedirect } from "../../src/redux/viewsPermissions";

export default function SettingsStoreDrawer() {
  useUserCAAuthRedirect()
  const redirectDetailsMyStore=()=>{
    router.push('/myStoreSettings/detailsMyStoreDrawer')
  }

  const redirectCostsMyStore=()=>{
    router.push('/myStoreSettings/costsMyStoreDrawer')
  }

  const redirectAddUserCompany=()=>{
    router.push('/myStoreSettings/addUserCompanyDrawer')
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            padding: 10,
            width: "100%",
            height: 55,
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          {iconSettingsBlack({ size: 30 })}
          <Text style={{ paddingHorizontal: 10, ...theme.textTitle }}>
            Configuración
          </Text>
        </View>
        <Pressable onPressOut={()=>redirectAddUserCompany()}style={styles.pressableStyles}>
          {iconPersonPlus({ size: 30, color: "gray" })}
          <Text style={styles.textStyles}>Ver/Agregar colaborador</Text>
        </Pressable>
        <Pressable style={styles.pressableStyles}
          onPressOut={()=>redirectDetailsMyStore()}>
          {iconInfo({ size: 30, color: "gray" })}
          <Text style={styles.textStyles}>Detalles de mi tienda</Text>
        </Pressable>
        <Pressable style={styles.pressableStyles}
            onPressOut={()=>redirectCostsMyStore()}>
          {iconSignalMoney({ size: 30, color: "gray" })}
          <Text style={styles.textStyles}>Mis costos fijos</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  //Se realizan los estilos de los contenedores Pressable Para las opciones
  pressableStyles: {
    margin: 5,
    padding: 5,
    borderRadius: 15,
    backgroundColor: "white",
    alignItems: "center",
    width: "auto",
    height: 55,
    ...theme.shadow,
    flexDirection: "row",
  },
  textStyles: { ...theme.textTitle, fontSize: 15, paddingHorizontal: 10 },
});
