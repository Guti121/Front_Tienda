import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  SafeAreaView,
} from "react-native";
import theme, { height, width } from "../../components/themeStyles/theme";
import { useState } from "react";
import ProductView from "../../components/colletion/product/product";
import TypeProductView from "../../components/colletion/typeProduct/typeProduct";
import { useUserCAAuthRedirect } from "../../redux/viewsPermissions";

// En esta vista se renderizan las dos opciones , producto y tipo de producto

export default function ProductsDrawer() {
  //hook bottoms
  const [pressedBottomProducts, setPressedBottomProducts] = useState(true);
  useUserCAAuthRedirect();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, ...theme.backgroundColorPrincipal }}>
        <View style={{ alignItems: "center" }}>
          <View style={styles.viewContainer}>
            <Pressable
              style={[
                styles.pressableBottomHeader,
                pressedBottomProducts && theme.pressed,
              ]}
              onPress={() => setPressedBottomProducts(true)}
            >
              <Text style={{ color: "white" }}>Producto</Text>
            </Pressable>

            <Pressable
              style={[
                styles.pressableBottomHeader,
                !pressedBottomProducts && theme.pressed,
              ]}
              onPress={() => setPressedBottomProducts(false)}
            >
              <Text style={{ color: "white" }}>Tipo de producto</Text>
            </Pressable>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            // Ajusta el tamaño al contenedor padre
          }}
        >
          {pressedBottomProducts ? <ProductView /> : <TypeProductView />}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  //style HeaderBottoms
  viewContainer: {
    width: Platform.OS === "web" ? '60%' : '90%',
    padding: 5,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#d0d0d0",
    flexDirection: "row",
    backgroundColor: "#fafbfd",
    ...theme.shadow,

    //alineamos los items internos

    justifyContent: "center",
  },
  pressableBottomHeader: {
    ...theme.pressable,
    flex: 1,
    alignItems:'center',
    justifyContent:'center',
    marginHorizontal: 1,
  },
});
