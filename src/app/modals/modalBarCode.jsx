import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  TextInput,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import theme from "../../components/themeStyles/theme";
import { filterCodeBar } from "../../components/billing/axiosRequest";
import { expiredGetToken } from "../../components/axios/generalAxiosRequest";
import { useRouter } from "expo-router";
import { deleteTokenStorage } from "../../components/token/token";
import { checkIcon, iconCar } from "../../components/icons/icons";
import { isWeb } from "../../components/token/localstorage";
import { getArrayCar } from "../../components/billing/bill";
import { BarNotification } from "../../components/icons/barNotification";

export default function ModalBarCode() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  //almacen de codigo de barras
  const [barCode, setBarCode] = useState("");
  //hook redirect
  const router = useRouter();
  //hook estado de modal
  const [stateModal, setStateModal] = useState(false);

  //hook almacen de respuesta de request
  const [requestData, setRequestData] = useState(null);

  //hook error
  const [error, setError] = useState(false);

  //hook pressable BuscarProducto
  const [searchProduct, setSearchProduct] = useState(false);
  const [notification, setNotification] = useState(false);
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  //hacemos la consulta del codigo de barras

  const handleFilter = async (data) => {
    console.log(data, "este es barcode");
    try {
      const token = await expiredGetToken();
      if (!token) {
        console.log("redirect");
        await deleteTokenStorage();
        router.replace("/login");
        return;
      }
      const result = await filterCodeBar(data, token);
      if (result) {
        setRequestData(result);
        setStateModal(true);
      } else {
        setError(true);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleBarcodeScanned = async ({ type, data }) => {
    setScanned(true);
    await handleFilter(data);
  };

  //Cierre de modal
  const closeModal = () => {
    setStateModal(false);
    setRequestData(null);
  };

  const setNotificationFunction = () => {
    setNotification(true);
    setTimeout(() => {
      setNotification(false);
    }, 1500);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  // Tramos los datos del local storage para ingresar un nuevo producto al 'arrayCar' con la funcion definida con anterioridad "gerArrayCar()"
  return (
    <View style={styles.container}>
      {notification && (
        <BarNotification
          icon={checkIcon()}
          message={"Producto agregado con exito !"}
        />
      )}
      <TextInput
        style={{
          ...theme.textInputGlobal,
          width: width * 0.8,
          margin: 10,
          padding: 5,
        }}
        placeholder="Ingrese codigo de barras"
        value={barCode}
        onChangeText={(value) => {
          setBarCode(value);
          setError(false);
        }}
      />
      {error && <Text style={styles.textError}>¡Producto no encontrado!</Text>}
      <Pressable
        style={
          searchProduct || !barCode
            ? styles.pressedContainer
            : styles.pressableContainer
        }
        disabled={!barCode}
        onPressIn={() => {
          handleFilter(barCode), setSearchProduct(true);
        }}
        onPressOut={() => {
          setSearchProduct(false);
        }}
      >
        <Text style={styles.textPressable}>Buscar Producto</Text>
      </Pressable>
      <View style={styles.containerCamera}>
        <CameraView

          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: "ean13",
          }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      {scanned && (
        <Pressable
          style={styles.pressableContainer}
          onPress={() => {
            setScanned(false), setBarCode(null), setError(false);
          }}
        >
          <Text style={styles.textPressable}>Escanear de nuevo</Text>
        </Pressable>
      )}
      {stateModal && (
        <ModalProduct
          state={stateModal}
          productoItem={requestData}
          onClose={closeModal}
          setNotificationhook={setNotificationFunction}
        />
      )}
    </View>
  );
}

//modal agregar producto
function ModalProduct({ state, productoItem, onClose, setNotificationhook }) {
  //hook para saber si el boton es pressed
  const [pressedAgregar, setPressedAgregar] = useState(false);
  const [pressedCancelar, setPressedCancelar] = useState(false);
  console.log(productoItem, "producto item");

  //Verificamos si el producto buscado no fue encontrado
  console.log("isWeb", isWeb);

  const aggregateCar = () => {
    getArrayCar(
      productoItem.producto,
      1,
      productoItem.valor,
      productoItem.nombre,
    );
    setNotificationhook();
  };
  return (
    <Modal animationType="fade" transparent={true} visible={state}>
      <View style={styles.modalContainer}>
        <View
          style={{
            backgroundColor: "white",

            margin: 10,
            width: width * 0.8,
            height: isWeb ? "auto" : height * 0.3,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, width: "100%" }}>
            <View style={styles.containerTitleProduct}>
              <Text style={styles.productTextTitle}>Producto</Text>
            </View>
            {productoItem && (
              <View style={styles.containerDetailsProducts}>
                <Text style={styles.text}>{productoItem.nombre}</Text>
                <Text style={styles.text}>{productoItem.valor}</Text>
              </View>
            )}
          </View>

          <Pressable
            style={
              pressedAgregar
                ? styles.pressedContainer
                : styles.pressableContainer
            }
            onPressIn={() => {
              setPressedAgregar(true), aggregateCar();
              setTimeout(() => {
                onClose();
              }, 300);
            }}
            onPressOut={() => {
              setPressedAgregar(false);
            }}
          >
            <View style={{ flexDirection: "row" }}>
              {iconCar("white", 19)}

              <Text style={styles.textPressable}> Agregar </Text>
            </View>
          </Pressable>

          <Pressable
            style={
              pressedCancelar
                ? styles.pressedContainer
                : styles.pressableContainer
            }
            onPressIn={() => {
              setPressedCancelar(true),
                setTimeout(() => {
                  onClose();
                }, 300);
            }}
            onPressOut={() => {
              setPressedCancelar(false);
            }}
          >
            <Text style={styles.textPressable}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  containerCamera: {
    width: width * 0.8,
    height: height * 0.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro y semi-transparente
  },
  text: {
    ...theme.textNormal,
    fontSize: 22,
    margin: 5,
    color: "black", // Color blanco para el texto
  },
  textError: { fontSize: 15, color: "red" },
  containerTitleProduct: {
    marginTop: 5,
    marginBottom: 10,
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#d0d0d0",
  },
  productTextTitle: {
    ...theme.textTitle,
    fontSize: 23,
  },
  containerDetailsProducts: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pressableContainer: {
    ...theme.pressable,
    padding: 10,
    margin: 5,
    paddingHorizontal: 20,
  },
  pressedContainer: {
    ...theme.pressed,
    padding: 10,
    margin: 5,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  textPressable: { ...theme.textPressable, margin: 2 },
});
