import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import theme from "../themeStyles/theme";
import {
  iconBroom,
  iconDelete,
  iconExclamationCircle,
  iconInvoice,
  iconMinus,
  iconPlus,
} from "../icons/icons";
import Storage from "../token/localstorage";
import { BarNotification } from "../icons/barNotification";
import { expiredGetToken } from "../axios/generalAxiosRequest";
import { deleteTokenStorage } from "../token/token";
import { handleInvoice } from "./axiosRequest";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ModalConfirm } from "../icons/modalConfirm";
import { pesosFormat } from "../icons/functionFormat";

export default function ModalCar() {
  const [productsList, setProductList] = useState([]); // Inicializar como array vacío
  const [numProducts, setNumProducts] = useState(0);
  const [countT, setCountT] = useState(0);
  const [priceT, setPriceT] = useState(0);
  const [notification, setNotification] = useState(false);

  //Hook error en la query de facturacion
  const [errorInvoice, setErrorInvoice] = useState(false);
  const [errorProductoNombre, setErrorProductoNombre] = useState(false);
  const [errorQuantity, setErrorQuantity] = useState(false);
  const [errorProductoId, setErrorProductoId] = useState(false);

  //hook modalConfirm
  const [modalConfirm, setModalConfirm] = useState(false);

  //Funcion para buscar productos en localStorage y listarlos en el carrito
  const findArraysProducts = async () => {
    try {
      const products = await Storage.getItem("arrayCar");
      const parsedProducts = products ? JSON.parse(products) : [];
      console.log(products);
      setProductList(parsedProducts);
      countsValuesTotal(parsedProducts); // Calcular el total al cargar productos
    } catch (error) {
      console.error("Error al recuperar productos:", error);
    }
  };

  useEffect(() => {
    findArraysProducts();
  }, []);
  console.log(
    errorInvoice,
    errorProductoNombre,
    errorProductoId,
    errorQuantity,
  );
  //Funcion para obtener la cuenta de los producto añadidos en el carrito , sin importar si son del mismo tipo , se cuenta como unidad
  const countsValuesTotal = (products) => {
    const totalAmount = products
      .map((producto) => producto.cantidad * producto.valorPro)
      .reduce((acc, valor) => acc + valor, 0);
    setPriceT(totalAmount);

    const totalProducts = products
      .map((producto) => producto.cantidad)
      .reduce((acc, cantidad) => acc + cantidad, 0);
    setNumProducts(totalProducts);
  };

  //Funcion para realizar eliminar una unidad del carrito
  //se realiza una copia de los priductos actuales del carrito , se toma el id del producto que se desea extraer
  //y se crea una nueva lista sin la unidad del producto selecionado
  //posterior a esto se llama la funcion que formatea el local storage
  const deleteProductCar = (index) => {
    console.log("entro deleteProductCar");
    setProductList((prevData) => {
      const newData = [...prevData];
      newData.splice(index, 1);

      deleteProductStorage(newData);
      setNotification(true);
      setTimeout(() => {
        setNotification(false);
      }, 1500);
      countsValuesTotal(newData); // Recalcular el total después de eliminar

      return newData;
    });
  };
  //En esta funcion aumentamos las unidades de los productos ya agregados (No tiene limite)
  const sumProduct = (index) => {
    setProductList((prevData) => {
      const newData = [...prevData];
      newData[index].cantidad += 1;

      deleteProductStorage(newData);
      countsValuesTotal(newData); // Recalcular el total después de eliminar

      return newData;
    });
  };

  //En esta funcion se resta la cantidad por unidad de un producto ya agregado, sin permitir que llegue a 0
  const minProduct = (index) => {
    setProductList((prevData) => {
      const newData = [...prevData];
      const catidadProduct = newData[index].cantidad;
      if (catidadProduct > 1) {
        newData[index].cantidad -= 1;
        deleteProductStorage(newData);
        setNotification(true);
        setTimeout(() => {
          setNotification(false);
        }, 1500);
        countsValuesTotal(newData); // Recalcular el total después de eliminar
      }

      return newData;
    });
  };

  //Esta funcion elimina todos los elementos del carrito
  const cleanAllProducts = async () => {
    const newDataNull = [];
    try {
      await deleteProductStorage(newDataNull);
      setNotification(true);
      setTimeout(() => {
        setNotification(false);
      }, 1500);
      await findArraysProducts();
    } catch {
      console.log("error al limpiar carrito");
    }
  };

  //Funcion para hacer el delecte del producto en el localStorage
  const deleteProductStorage = async (updatedProductsList) => {
    //añadimos una verificacion adicional en caso de que exista un producto sin stock suficiente
    console.log(updatedProductsList, "producto delete list ");
    if (errorInvoice) {
      console.log("entre en delete error", errorProductoId);
      const item = updatedProductsList.filter(
        (item) => item.producto == errorProductoId,
      );
      console.log(item);

      itemQuantity = item
        .map((item) => item.cantidad)
        .reduce((acc, cantidad) => acc + cantidad, 0);
      console.log(itemQuantity);
      if (itemQuantity <= errorQuantity) {
        setErrorInvoice(false);
      }
      console.log("el item tiene", { itemQuantity }, " y en stock hay ", {
        errorQuantity,
      });
    }
    try {
      await Storage.removeItem("arrayCar");
      await Storage.setItem("arrayCar", JSON.stringify(updatedProductsList));
    } catch (error) {
      console.error("Error al guardar en almacenamiento:", error);
    }
  };

  // se realiza una funcion para generar una factura en el sistema

  const Invoice = async () => {
    try {
      const token = await expiredGetToken();
      if (!token) {
        console.log("redirect");
        await deleteTokenStorage();
        router.replace("/login");
        return;
      }
      const result = await handleInvoice(productsList, token);
      if (result.data.factura_id) {
        deleteProductStorage([]);
        router.replace(
          `/billsGenerate/billsGenerateDetailDrawer?value=${result.data.factura_id}`,
        );
      }
    } catch (error) {
      console.log(error.error || error, "error desde catch modal car");
      setErrorInvoice(error.error || error);

      //En caso de que el error JSON no contenga los siguientes, van a permanecer en falso
      if (error.producto_nombre && error.stock && error.producto_id) {
        setErrorProductoNombre(error.producto_nombre);
        setErrorQuantity(error.stock);
        setErrorProductoId(error.producto_id);
      }
      console.log(errorInvoice);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, overflow: "visible" }}>
        <View style={styles.generalContainer}>
          {notification && (
            <BarNotification
              icon={iconDelete("black", 20)}
              message={"Producto(s) eliminado con exito"}
              color={"red"}
            />
          )}
          <FlatList
            data={productsList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.containerFlatlist}>
                <View style={styles.containerDetailsProducts}>
                  <Text style={styles.textProductsStyle}>{item.nombrePro}</Text>

                  <Text style={styles.textProductsStyle}>{item.cantidad}</Text>

                  <Text style={styles.textProductsStyle}>
                    {pesosFormat(item.valorPro)}
                  </Text>

                  <Pressable
                    onPress={() => deleteProductCar(index)}
                    style={styles.pressableIconDelete}
                  >
                    {iconDelete()}
                  </Pressable>
                </View>
                <View style={styles.containerPlusMinus}>
                  <Pressable
                    onPress={() => minProduct(index)}
                    style={styles.pressableIconsPlusMinus}
                  >
                    {iconMinus("white")}
                  </Pressable>
                  <Pressable
                    onPress={() => sumProduct(index)}
                    style={styles.pressableIconsPlusMinus}
                  >
                    {iconPlus("white")}
                  </Pressable>
                </View>
              </View>
            )}
          />
        </View>
        <View
          style={
            errorInvoice ? styles.containerError : styles.containerPressables
          }
        >
          {errorInvoice ? (
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                padding: 5,
              }}
            >
              <View>{iconExclamationCircle("red", 20)}</View>
              <Text style={styles.errorText}>{errorInvoice}</Text>
              {errorProductoNombre && (
                <Text style={styles.errorText}>{errorProductoNombre}</Text>
              )}
              {errorQuantity && (
                <Text style={styles.errorText}>
                  Stock disponible: {errorQuantity}
                </Text>
              )}
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 5,
              }}
            >
              <Pressable
                disabled={productsList.length === 0}
                style={styles.pressableIcons}
                onPress={() => cleanAllProducts()}
              >
                {iconBroom}
              </Pressable>
              <View style={{ alignItems: "center", flex: 1, padding: 5 }}>
                <Text style={{ ...theme.textTitle }}>Totales</Text>
                <Text style={{ ...theme.textNormal, fontSize: 18 }}>
                  # Productos
                </Text>
                <Text
                  style={{
                    ...theme.textNormal,
                    fontSize: 18,
                    color: "rgb(60, 196, 60)",
                  }}
                >
                  {numProducts}
                </Text>

                <Text style={{ ...theme.textNormal, fontSize: 18 }}>
                  Valor a Pagar
                </Text>
                <Text
                  style={{
                    ...theme.textNormal,
                    fontSize: 18,
                    color: "rgb(60, 196, 60)",
                  }}
                >
                  {pesosFormat(priceT)}
                </Text>
              </View>
              <Pressable
                disabled={productsList.length === 0}
                style={styles.pressableIcons}
                onPressIn={() => {
                  setModalConfirm(true);
                }}
              >
                {iconInvoice()}
              </Pressable>
            </View>
          )}
        </View>
      </View>
      <ModalConfirm
        state={modalConfirm}
        message={"¿Deseas realizar la Facturacion?"}
        handleIPositiveButton={Invoice}
        onClose={() => setModalConfirm(false)}
      />
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  generalContainer: {
    flex: 1,
    borderWidth: 3,
    margin: 10,
    alignItems: "center",
    justifyItems: "center",
    borderRadius: 10,
    borderColor: "#d0d0d0",
  },
  containerFlatlist: {
    ...theme.shadow,
    borderRadius: 10,
    ...theme.backgroundColorPrincipal,
    alignContent: "center",
    margin: 10,
    width: width * 0.87,
    maxHeigth: height * 0.5,
    padding: 10,
  },
  containerDetailsProducts: {
    flex: 1,
  },
  containerPlusMinus: {
    width: "100%",
    height: "auto",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#454545",
    borderRadius: 10,
  },
  containerPressables: {
    margin: 7,
    borderWidth: 3,
    borderRadius: 10,
    borderColor: "#d0d0d0",
  },
  containerError: {
    backgroundColor: "rgb(255, 228, 228)",
    margin: 7,
    borderWidth: 3,
    borderRadius: 10,
    borderColor: "#d0d0d0",
    padding: 10,
  },
  textProductsStyle: {
    flex: 1,
    ...theme.textTitle,
    padding: 10,
    margin: 5,
    textAlign: "center", // Centrado vertical en el contenedor, si flex es 1 y ocupa todo el espacio
  },
  pressableIconDelete: {
    flex: 1,
    padding: 10,
    margin: 5,
    alignItems: "center",
  },
  pressableIconsPlusMinus: {
    alignItems: "center",
    marginHorizontal: 20,
    padding: 5,
    marginVertical: 10,
  },
  pressableIcons: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    ...theme.pressable,
  },
  pressed: {
    ...theme.pressed,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});
