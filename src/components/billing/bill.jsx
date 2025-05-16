import { useCallback, useEffect, useState } from "react";
import {
  Text,
  TextInput,
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
  Modal,
  Alert,
  Platform,
  SafeAreaView,
} from "react-native";
import { handleListProductFilter } from "./axiosRequest";
import theme from "../themeStyles/theme";
import {
  checkIcon,
  iconBarCode,
  iconCar,
  iconMinus,
  iconPlus,
} from "../icons/icons";
import { useFocusEffect, useRouter } from "expo-router";
import Storage from "../token/localstorage";
import { expiredGetToken } from "../axios/generalAxiosRequest";
import { deleteTokenStorage } from "../token/token";
import { BarNotification } from "../icons/barNotification";
import { pesosFormat } from "../icons/functionFormat";
import { useUserCAWAuthRedirect } from "../../redux/viewsPermissions";

// Agregar un debounce
let timeout;

export default function Bill() {
  const [productFilter, setProductFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //hook para guardar la lista
  const [arrayProducts, setArrayProducts] = useState(null);
  //hook icon pressable
  const [productPressed, setProductPressed] = useState(null);
  const [nombreProductPressed, setNombreProductPressed] = useState(null);
  const [valorProductPressed, setValorProductPressed] = useState(null);
  const [detalles, setDetalles] = useState([]);
  //hook pressable car
  const [isPressed, setIsPressed] = useState(false);
  //hook notification
  const [notification, setNotification] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [emptyCar, setEmptyCar] = useState(false);

  //router modal

  const router = useRouter();

  const filterQuery = async () => {
    if (!productFilter) return; // Si el filtro está vacío, no hacer la solicitud

    try {
      setLoading(true);
      setError(null);
      const token = await expiredGetToken();
      console.log(token, "token nn");
      if (!token) {
        deleteTokenStorage();
        router.replace("/login");
        return;
      }
      let request = await handleListProductFilter(productFilter, token);
      console.log(request);
      if (!request) {
        setArrayProducts(null);
        setError("No se encontraron productos");
      } else {
        setArrayProducts(request);
      }
    } catch (error) {
      setArrayProducts(null);
      setError(error);
      console.error("desde error console:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        filterQuery();
      }, 500); // Espera 500ms después de que el usuario deje de escribir
      return () => clearTimeout(timeout); // Limpiar timeout si el componente se desmonta o `productFilter` cambia
    }, [productFilter]),
  );

  const onpressedIn = (id, nombre, valor) => {
    setProductPressed(id);
    setNombreProductPressed(nombre);
    setValorProductPressed(valor);
    setModalVisible(true);
    setTimeout(() => {
      setProductPressed(null); // Restablece el estado después de 5 ms
    }, 200);
  };

  const closeModal = () => {
    setModalVisible(false); // Cierra el modal
  };

  const onPressAddCar = (details) => {
    const producto = details.producto;
    const cantidad = details.cantidad;
    const valorPro = details.valorProducto;
    const nombrePro = details.nombre;
    if (cantidad > 0) {
      getArrayCar(producto, cantidad, valorPro, nombrePro);
      setModalVisible(false);
      setNotification(true);
      setTimeout(() => {
        setNotification(false);
      }, 1500);
    } else {
      Alert.alert("No se pudo agregar al carrito");
    }
  };
  const openModal = () => {
    router.push("/modals/modalBarCode");
  };

  // se realiza esta funcion para verificar si el carro esta vacio y asi saber si debe notificarse
  useFocusEffect(() => {
    empty();
  });
  // se realiza esta funcion para verificar si el carro esta vacio y asi saber si debe notificarse

  const empty = async () => {
    const result = await Storage.getItem("arrayCar");
    console.log(result, "empty car ?");
    if (result && JSON.parse(result).length > 0) {
      console.log("console log");
      setEmptyCar(true);
    } else {
      setEmptyCar(false);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          backgroundColor: { ...theme.backgroundColorPrincipal },
        }}
      >
        {notification && (
          <BarNotification
            icon={checkIcon()}
            message={`Producto agregado(s) con exitos`}
          />
        )}
        <View style={styles.containerFilter}>
          <View
            style={{
              
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TextInput
              style={styles.textInputProducts}
              value={productFilter}
              placeholder="Buscar Productos"
              placeholderTextColor="#454545"
              onChangeText={(text) => setProductFilter(text)}
            />
            <Pressable
              style={{
                ...theme.shadow,
                borderRadius: 50,
                margin: 5,
                padding: 10,
                backgroundColor: "rgba(0,0,0,0.05)",
              }}
              onPress={openModal}
            >
              {iconBarCode}
            </Pressable>
          </View>
        </View>

        {loading && <Text style={{ ...theme.textNormal }}>Cargando...</Text>}
        {error && (
          <Text style={{ ...theme.errorText, fontSize: 15 }}>{error}</Text>
        )}
        <FlatList
          style={styles.containerFlatlist}
          data={arrayProducts}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.containerProduct,
                productPressed === item.id && styles.productPressedStyle,
              ]}
              onPress={() => {
                onpressedIn(item.id, item.nombre, item.valor);
              }}
            >
              <Text style={styles.textProductsTitle}>{item.nombre}</Text>
              <View style={styles.containerProductText}>
                <View style={styles.containerText}>
                  <Text style={styles.textProductsSubTitle}>Unidades</Text>
                  <Text style={styles.textProducts}>
                    {item.unidades_disponibles}
                  </Text>
                </View>

                <View style={styles.containerText}>
                  <Text style={styles.textProductsSubTitle}>Color</Text>
                  <Text style={styles.textProducts}>{item.color}</Text>
                </View>

                <View style={styles.containerText}>
                  <Text style={styles.textProductsSubTitle}>Valor</Text>
                  <Text style={styles.textProducts}>
                    {pesosFormat(item.valor)}
                  </Text>
                </View>
              </View>
              <Text style={styles.textProductsSubTitle}>Tipo producto</Text>

              <Text style={styles.textProducts}>{item.tipo_producto}</Text>

              <Text style={{ ...theme.textNames }}>
                # {item.numero_producto}
              </Text>
            </Pressable>
          )}
          keyExtractor={(item) => item.id.toString()} // Convierte `id` en string si es un número
        />
        <Pressable
          style={isPressed ? styles.pressedCar : styles.pressableCar}
          onPressIn={() => {
            setIsPressed(true), router.push("/modals/modalCarDrawer");
          }}
          onPressOut={() => setIsPressed(false)}
        >
          {iconCar()}
          {emptyCar && (
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: "red",
                borderRadius: 50,
                position: "absolute",
                top: -5,
                right: 0,
                paddingHorizontal: 8,
                paddingVertical: 2,
                alignItems: "center",
                justifyContent: "center",
                ...theme.shadow,
              }}
            ></View>
          )}
        </Pressable>

        <ModalContainer
          idProduct={productPressed}
          nombreProductPress={nombreProductPressed}
          valorProductPressed={valorProductPressed}
          state={modalVisible}
          onClose={closeModal}
          onPressAdd={onPressAddCar}
        />
      </View>
    </SafeAreaView>
  );
}

// Se realiza esta funcion para ingresar al localStorage los productos, se exporta ya que se debe utilizar en modalBarCode.jsx
export const getArrayCar = async (producto, cantidad, valorPro, nombrePro) => {
  try {
    const arrayResult = await Storage.getItem("arrayCar");
    console.log(arrayResult);
    const array = arrayResult ? JSON.parse(arrayResult) : [];
    const newDetails = [...array, { producto, nombrePro, cantidad, valorPro }];
    console.log(newDetails, "newDetails");
    await Storage.setItem("arrayCar", JSON.stringify(newDetails));
  } catch {
    console.error("Error al agregar detalle:", error);
  }
};

//modal para indicar la cantidad del producto que se desean agregar al arrayCar
function ModalContainer({
  idProduct,
  nombreProductPress,
  valorProductPressed,
  state,
  onClose,
  onPressAdd,
}) {
  // Hook modal state
  const [modalProduct, setModalProduct] = useState(state);
  //hook contador
  const [count, setCount] = useState(1);
  const [product, setProduct] = useState(null);
  const [nombreProduct, setNombreProduct] = useState(null);
  console.log(product);

  const details = {
    producto: product,
    nombre: nombreProduct,
    cantidad: count,
    valorProducto: valorProductPressed,
  };
  // Actualiza el estado cuando el prop `state` cambia
  useEffect(() => {
    setModalProduct(state);
    setProduct(idProduct);
    setNombreProduct(nombreProductPress);
    console.log(product);
  }, [state]);

  //funcion para incrementar el numero de productos en el modal
  const plusCount = () => {
    setCount((count) => count + 1);
  };
  const minusCount = () => {
    setCount((count) => (count > 0 ? count - 1 : 0));
  };

  return (
    <Modal animationType="fade" transparent={true} visible={modalProduct}>
      <View style={styles.modalStyle}>
        <View style={styles.modal}>
          <View style={styles.headModal}>
            <Text style={styles.textProductsTitle}>{nombreProduct}</Text>
            <Text style={styles.textProducts}>Cantidad</Text>
          </View>
          <View style={styles.containerCount}>
            <Pressable onPress={minusCount}>{iconMinus()}</Pressable>

            <Text style={styles.textCount}>{count}</Text>
            <Pressable onPress={plusCount}>{iconPlus()}</Pressable>
          </View>
          <View style={{ flexDirection: "row" }}>
            {count > 0 ? (
              <Pressable
                style={{
                  ...theme.pressable,
                  margin: 10,
                  paddingHorizontal: 20,
                }}
                onPress={() => {
                  onPressAdd(details), setCount(1);
                }}
              >
                <Text style={{ ...theme.textPressable }}>Agregar</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={{ ...theme.pressable, margin: 10, paddingHorizontal: 25 }}
              onPress={() => {
                onClose(), setCount(0);
              }}
            >
              <Text style={{ ...theme.textPressable }}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  //Views containers
  containerFilter: {
    ...theme.textInputGlobal,
    ...theme.backgroundColorPrincipal,
    ...theme.shadow,
    borderWidth: 1,
    margin: 5,
    height:'auto',
    width:'auto',
    alignItems: "center",
  },

  containerFlatlist: {
    padding: 10,
    height: "100%",
    width: width,
  },
  containerProduct: {
    ...theme.shadow,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    margin: 5,
    borderRadius: 10,

    ...theme.backgroundColorPrincipal,
  },
  containerProductText: {
    alignItems: "center",
    justifyContent: "center",

    margin: 5,
    padding: 5,

    flexDirection: "row",
  },
  containerText: {
    alignItems: "center",
    flexDirection: "column",
    margin: 5,
  },

  //Text
  textFilter: {
    ...theme.textNormal,

    margin: 5,
    fontSize: 18,
  },
  textProductsTitle: {
    ...theme.textTitle,
    marginTop: 5,
    padding: 2,
    fontSize: 25,
  },
  textProductsSubTitle: {
    ...theme.textTitle,
    marginTop: 5,
    padding: 2,
    fontSize: 15,
  },
  textProducts: {
    ...theme.textNormal,
    fontSize: 15,
    margin: 5,
  },

  textPressed: {
    ...theme.textPressable,
  },
  //TextInput
  textInputProducts: {
    ...theme.textInputGlobal,

    padding: 5,
    margin: 10,
    height: height * 0.05,
    width: width * 0.7,
  },

  //icons
  productPressedStyle: {
    borderColor: "#a6acaf",
    ...theme.shadow,
  },

  //-------------------------MODAL---------------------------
  modalStyle: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",

    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headModal: {
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    width: "100%",
    borderColor: "#d0d0d0",
  },
  containerCount: {
    ...theme.textInputGlobal,
    height:'auto',
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
  },
  textCount: {
    marginVertical: 5,
    marginHorizontal: 20,
  },

  //--------------------------CAR----------------------------------------
  pressableCar: {
    shadowColor: "#454545",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowRadius: 20,
    shadowOpacity: 0.9,
    backgroundColor: "rgba(0,0,0,0.05)",
    width: 70,
    height: 70,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: Platform.OS == "web" ? height * 0.76 : height * 0.76,
    left: Platform.OS == "web" ? width * 0.03 : width * 0.8,
    borderRadius: 50,
  },

  pressedCar: {
    shadowColor: "#454545",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowRadius: 20,
    shadowOpacity: 0.9,
    backgroundColor: "#a6acaf",
    width: 70,
    height: 70,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: Platform.OS == "web" ? height * 0.76 : height * 0.76,
    left: Platform.OS == "web" ? width * 0.03 : width * 0.8,
    borderRadius: 50,
  },
});
