import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { handleDeleteProduct, handleRetrieveProduct } from "../axiosRequest";
import { router, useFocusEffect } from "expo-router";
import { expiredGetToken } from "../../axios/generalAxiosRequest";
import theme, { height, width } from "../../themeStyles/theme";
import { pesosFormat } from "../../icons/functionFormat";
import { iconDelete, iconEdit, iconMinus, iconPlus } from "../../icons/icons";
import { ModalConfirm } from "../../icons/modalConfirm";
import { BarNotification } from "../../icons/barNotification";

export default function DetailProduct({ id }) {
  //hook product
  const [product, setProduct] = useState([]);
  const [stateModalConfirm, setStateModalConfirm] = useState(false);
  const [stateBarNotification, setStateBarNotification] = useState(null);

  //hook Pressable

  //colors
  const [colorIconDelete, setColorIconDelete] = useState("red");
  const [colorIconMinus, setColorIconMinus] = useState("red");
  const [colorIconPlus, setColorIconPlus] = useState("black");
  useFocusEffect(
    useCallback(() => {
      handlesProduct();

      // Función de limpieza
      return () => {
        setProduct([]);
      };
    }, []), // Dependencias vacías para que solo se ejecute al enfocar la pantalla
  );

  const handlesProduct = async (query = "retrieve") => {
    try {
      const token = await expiredGetToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        if (query == "retrieve") {
          const request = await handleRetrieveProduct(id, token);
          setProduct(request.data);
        }
        if (query === "delete") {
          await handleDeleteProduct({ id, token });
          barNotificationfunction(
            iconDelete("black"),
            "Producto Eliminado con Exito",
            "red",
          );
          setTimeout(() => {
            router.back();
          }, 3000);
        }
      } catch (error) {
        console.error(error);
      }
    } catch {
      router.replace("/login");
    }
  };
  //-----------------------------------Modals --------------------------
  //------------------------ modalConfirm
  //funcion para cerrar el modal confirm
  const closeModalConfirm = () => {
    setStateModalConfirm(false);
  };

  //-------------------------Bar Notifications ----------------------------

  const barNotificationfunction = (icon, message, color) => {
    setStateBarNotification({ icon, message, color });
    setTimeout(() => setStateBarNotification(null), 3000);
  };
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
      <View style={styles.principalView}>
        {stateBarNotification && (
          <BarNotification
            icon={stateBarNotification.icon}
            message={stateBarNotification.message}
            color={stateBarNotification.color}
          />
        )}
        <ScrollView
          style={{
            flex: 1,
          }}
        >
          <View style={styles.containerNumeroProducto}>
            <Text style={{ ...theme.textNames }}>
              #{product.numero_producto}
            </Text>
          </View>
          <View style={styles.nameView}>
            <Text style={styles.textName}>{product.nombre}</Text>
          </View>
          <View style={styles.containerDetailsView}>
            <View style={styles.containerDetails}>
              <Text style={styles.textTitles}>Color</Text>
              <Text style={styles.textDetail}>{product.color}</Text>
            </View>

            <View style={styles.containerDetails}>
              <Text style={styles.textTitles}>Unidades Disponibles</Text>
              <View
                style={{
                  width: "100%",
                  height: "auto",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 20,
                  ...theme.borderColorInput,
                }}
              >
                <Pressable
                  style={styles.pressableIconsUnits}
                  onPressIn={() => {
                    setColorIconMinus("black");
                    setTimeout(() => {
                      setColorIconMinus("red"), 500;
                    });
                  }}
                  onPressOut={() => {
                    router.push({
                      pathname: "modals/modalUpdateProductDrawer",
                      params: {
                        product: JSON.stringify(product),
                        event: "decreased",
                      },
                    });
                  }}
                >
                  {iconMinus(colorIconMinus)}
                  <Text>Disminuir</Text>
                </Pressable>
                <Text
                  style={[
                    styles.textDetail,
                    { width: "33%", textAlign: "center" },
                  ]}
                >
                  {product.unidades_disponibles}
                </Text>
                <Pressable
                  style={styles.pressableIconsUnits}
                  onPressIn={() => {
                    setColorIconPlus("#a6acaf");
                    setTimeout(() => {
                      setColorIconPlus("black"), 1000;
                    });
                  }}
                  onPressOut={() => {
                    router.push({
                      pathname: "modals/modalUpdateProductDrawer",
                      params: {
                        product: JSON.stringify(product),
                        event: "agg",
                      },
                    });
                  }}
                >
                  {iconPlus(colorIconPlus)}
                  <Text>Aumentar</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.containerDetails}>
              <Text style={styles.textTitles}>Tipo de Producto</Text>
              <Text style={styles.textDetail}>{product.tipo_producto}</Text>
            </View>
            <View
              style={{
                ...styles.containerDetails,
              }}
            >
              <Text style={styles.textTitles}>Valor por mayor</Text>
              <Text style={{ ...styles.textDetail, fontSize: 20 }}>
                {pesosFormat(product.valor_mayor)}
              </Text>
            </View>
            <View
              style={{
                ...styles.containerDetails,
                backgroundColor: "rgb(60, 196, 60)",
              }}
            >
              <Text style={styles.textTitles}>Valor a vender</Text>
              <Text style={{ ...styles.textDetail, fontSize: 20 }}>
                {pesosFormat(product.valor)}
              </Text>
            </View>
          </View>
        </ScrollView>
        <View
          style={{
            height: 50,
            borderRadius: 30,
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            bottom: 0,

            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 5,
          }}
        >
          <Pressable
            onPressIn={() => {
              setColorIconDelete("black"),
                setTimeout(() => setColorIconDelete("red"), 100);
            }}
            onPressOut={() => setStateModalConfirm(true)}
            style={{ paddingHorizontal: 30 }}
          >
            {iconDelete(colorIconDelete)}
          </Pressable>
        </View>
      </View>
      <ModalConfirm
        state={stateModalConfirm}
        message={"Deseas Eliminar el Producto ?"}
        handleIPositiveButton={() => handlesProduct("delete")}
        onClose={closeModalConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  principalView: {
    height: height * 0.8,
    margin: 10,
    borderRadius: 30,
    padding: 10,
    backgroundColor: "white",
    ...theme.shadow,
  },
  containerNumeroProducto: {
    alignItems: "flex-end",
    height: 40,
    justifyContent: "center",
    padding: 5,
  },
  nameView: {
    ...theme.pressableColor,
    padding: 2,
    borderRadius: 30,
    width: "100%",
    height: 40,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    ...theme.borderColorInput,
  },
  textName: {
    ...theme.textTitle,
    textTransform: "capitalize",
    margin: 1,
    color: "white",
  },
  containerDetailsView: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  containerDetails: {
    borderBottomWidth: 1,
    ...theme.borderColorInput,
    padding: 5,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  textTitles: {
    textTransform: "capitalize",
    ...theme.textTitle,
    margin: 5,
  },
  textDetail: { textTransform: "capitalize", margin: 5 },

  pressableIconsUnits: {
    paddingHorizontal: 8,
    width: "33%",
    justifyContent: "center",
    alignItems: "center",
  },
});
