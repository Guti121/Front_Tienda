import {
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import { expiredGetToken } from "../axios/generalAxiosRequest";
import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  handleCreateProduct,
  handleSuggestedRetailPrice,
  handleTypeProduct,
} from "./axiosRequest";
import theme, { height, width } from "../themeStyles/theme";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { pesosFormat, pesosformat } from "../icons/functionFormat";
import { ModalConfirm } from "../icons/modalConfirm";
import { BarNotification } from "../icons/barNotification";
import { checkIcon, iconInfo, iconSearch } from "../icons/icons";
import ModalTypeProduct from "./modalAddProductColletion";

// Esta vista viene de el drawer addProductsDrawer y tiene como funcion renderizar el formulario
// Y añadir los nuevos producto a el almacen o stock

export function AddProductsColletion() {
  //hook inputs

  const [datesProducts, setDatesProducts] = useState([
    {
      nombre: "",
      tipo_producto: "",
      color: "",
      valor_mayor: 0,
      valor_costos_fijos: 0,
      valor: 0,
      unidades_disponibles: 0,
    },
  ]);
  const [modalMessage, setModalMessage] = useState("");
  //Hook message price suggested
  const [messageSuggested, setMessageSuggested] = useState([]);
  const [errorParams, setErrorParams] = useState(false);

  //Hook modal typeProduct
  const [modalState, setModalState] = useState(false);
  const [typeProductList, setTypeProductList] = useState([]);
  //hook modal create product
  const [stateModalCreate, setStateModalCreate] = useState(false);
  const [messageModalCreate, setMessageModalCreate] = useState(false);

  //Error
  const [errorMessage, setErrorMessage] = useState(false);

  // Establecemos la funcion que va a mostrarnos el precio sugerido
  useFocusEffect(
    useCallback(() => {
      clearForm(); // Llama a la función cuando la pantalla se enfoque
    }, []) // Dependencias vacías para ejecutarlo solo cuando la pantalla se enfoca
  );

  const handleRequest = async (which) => {
    try {
      console.log("entre a handle", which);
      token = await expiredGetToken();
      if (!token) {
        router.replace("login/");
      }
      console.log("token", token);
      if (which === "SRP") {
        console.log("entre al if");
        try{
          const request = await handleSuggestedRetailPrice(
          datesProducts[0].valor_mayor,
          token
        );

        console.log("request desde component", request);
        setMessageSuggested(request.data);
        console.log(messageSuggested);
        }
        catch(error){
          setErrorParams(error?.response?.data?.error ||'Error al Buscar Datos')
          console.log('error',error)
        }
      }
      // Si which es HTP significa que estamos consultando los tipos de productos existentes
      if (which === "HTP") {
        console.log("entre");
        setModalState(true);
      }

      if (which === "CreateProduct") {
        try {
          console.log(datesProducts[0]);
          setStateModalCreate(false);
          const request = await handleCreateProduct(token, datesProducts[0]);
          setMessageModalCreate(true);
          setTimeout(() => {
            setMessageModalCreate(false);
          }, 1500);
        } catch (error) {
          const errorMessage =
            error.response?.data?.error?.error ||
            error.response?.data?.error || // Si existe error.response.data.error, úsalo
            error.response?.data?.detail || // Si no, usa error.response.data.detail
            error.response?.data || // Si tampoco, usa error.response.data completo
            "Error desconocido";
          console.log("Estoy en ERROR:", error);
          setErrorMessage(
            typeof errorMessage === "string" && errorMessage.length > 100
              ? "Ocurrió un error inesperado. Inténtalo de nuevo."
              : String(errorMessage) // Convertir a string en caso de que sea un objeto o número
          );
        }
      }
    } catch (error) {
      console.log("error desde componente ", error);
      if (error.response.data.error) {
        setErrorParams(error.response.data.error);
        console.log("error Debes ingresar un monto valido");
      }
    }
  };
  const addTolist = (key, value) => {
    setDatesProducts((prev) => {
      const updatePrev = { ...prev[0] };
      updatePrev[key] = value;

      //devuelve el nuevo estado
      return [{ ...updatePrev }];
    });
  };

  //verificamos si el dato es valido
  const isNum = (num) => {
    if (isNaN(parseInt(num))) {
      setErrorMessage("Verificar los Valores numericos!");
    } else {
      console.log("es un numero", parseInt(num));
    }
  };
  //-----------------------------------------------------------------------
  //resivimos el item seleccionado en el modal
  const typeProductSelect = (item) => {
    console.log(item, "este es el item");
    setTypeProductList(item);
    setModalState(false);
    addTolist("tipo_producto", item.id);
  };

  //closeModal
  const closeModalTP = () => {
    setModalState(false);
  };
  //CloseModal Create Product
  const closeModalCP = () => {
    setStateModalCreate(false);
  };

  //Formulamos el mensaje del modalConfirm
  const messageGenerate = () => {
    const product = datesProducts[0]; // Accede al primer objeto en el array
    const message = `Deseas confimar la creacion del siguiente producto?\n 
    Nombre Producto: 
    ${product.nombre}\n
    Tipo Producto: 
    ${typeProductList.tipo_producto}\n
    Color: 
    ${product.color}\n
    Valor Mayor: 
    ${pesosFormat(product.valor_mayor)}\n
    Valor Costos Fijos: 
    ${pesosFormat(product.valor_costos_fijos)}\n
    Valor: 
    ${pesosFormat(product.valor)}\n
    Unidades Disponibles: 
    ${product.unidades_disponibles}
    `;
    console.log(message);
    return message;
  };

  useEffect(() => {
    if (stateModalCreate) {
      setModalMessage(messageGenerate()); // Only runs when modal opens
    }
  }, [stateModalCreate]);

  //se agrega una funcion para limpiar el formulario
  const clearForm = () => {
    setDatesProducts([
      {
        nombre: "",
        tipo_producto: "",
        color: "",
        valor_mayor: 0,
        valor_costos_fijos: 0,
        valor: 0,
        unidades_disponibles: 0,
      },
    ]);
    setTypeProductList([]);
    setErrorMessage(false);
    setErrorParams(false);
  };

  return (
    <View style={styles.containerPrincipal}>
      {messageModalCreate && (
        <BarNotification
          icon={checkIcon()}
          message={"Producto Creado de manera exitosa"}
        />
      )}
      <View style={styles.containerHeader}>
        <Text style={styles.titleHeader}>Datos del Producto</Text>
      </View>
      <ScrollView>
        <View style={styles.containerInf}>
          <View
            style={{
              alignItems: "flex-start",
              justifyContent: "flex-start",
              width: width * 0.8,
            }}
          >
            <Text>Nombre del Producto</Text>
          </View>
          <TextInput
            style={styles.inputInf}
            value={datesProducts[0].nombre}
            onChangeText={(text) => {
              addTolist("nombre", text);
            }}
          />
          <View
            style={{
              alignItems: "flex-start",
              justifyContent: "flex-start",
              width: width * 0.8,
            }}
          >
            <Text>Color</Text>
          </View>
          <TextInput
            value={datesProducts[0].color}
            onChangeText={(text) => addTolist("color", text)}
            style={styles.inputInf}
          />
          <View
            style={{
              alignItems: "flex-start",
              justifyContent: "flex-start",
              width: width * 0.8,
            }}
          >
            <Text>Valor por mayor</Text>
          </View>
          <View style={{ ...theme.viewTextInputIcon }}>
            <TextInput
              placeholder="$"
              style={{ ...theme.textInputIcon }}
              value={datesProducts[0].valor_mayor}
              keyboardType="numeric"
              onChangeText={(text) => {
                addTolist("valor_mayor", text);
                setMessageSuggested([]);
                setErrorParams(false);
                setErrorMessage(false);
                isNum(text);
              }}
            />
            <Pressable
              style={{ ...theme.pressableInputIcon }}
              onPressIn={() => {
                handleRequest("SRP");
              }}
            >
              <Text style={styles.TextPressables}>
                {iconInfo({ size: 19 })}
              </Text>
            </Pressable>
          </View>
          {errorParams && (
            <View>
              <Text>{errorParams}.</Text>
              <Link style={{ color: 'blue', textDecorationLine: 'underline' }}  href="/myStoreSettings/costsMyStoreDrawer">Configurar Costos...</Link>
            </View>
          )}
          {messageSuggested && (
            <View>
              {Object.values(messageSuggested).map((value, index) => (
                <Text key={index}>
                  {index == 0
                    ? `Valor Sugerido: ${pesosFormat(value)}`
                    : index == 2
                      ? `% ganacia: ${value * 100}%`
                      : `Valor con CFs: ${pesosFormat(value)}`}
                </Text>
              ))}
            </View>
          )}
          <View
            style={{
              alignItems: "flex-start",
              justifyContent: "flex-start",
              width: width * 0.8,
            }}
          >
            <View
              style={{
                alignItems: "flex-start",
                justifyContent: "flex-start",
                width: width * 0.8,
              }}
            >
              <Text>Valor </Text>
            </View>
          </View>
          <TextInput
            placeholder="$"
            style={styles.inputInf}
            value={datesProducts[0].valor}
            keyboardType="numeric"
            onChangeText={(text) => {
              setErrorMessage(false);
              addTolist("valor", text);
              isNum(text);
            }}
            onBlur={() => pesosFormat(datesProducts[0].valor)}
          />
          <View
            style={{
              alignItems: "flex-start",
              justifyContent: "flex-start",
              width: width * 0.8,
            }}
          >
            <View
              style={{
                alignItems: "flex-start",
                justifyContent: "flex-start",
                width: width * 0.8,
              }}
            >
              <Text>Unidades</Text>
            </View>
          </View>
          <TextInput
            style={styles.inputInf}
            value={datesProducts[0].unidades_disponibles}
            keyboardType="numeric"
            onChangeText={(text) => {
              addTolist("unidades_disponibles", text);
              setErrorMessage(false);
              isNum(text);
            }}
          />
          <View
            style={{
              alignItems: "flex-start",
              justifyContent: "flex-start",
              width: width * 0.8,
            }}
          >
            <Text>Tipo de producto</Text>
          </View>
          <View style={{ ...theme.viewTextInputIcon }}>
            <TextInput
              editable={false}
              style={{ ...theme.textInputIcon }}
              value={typeProductList.tipo_producto}
            />
            <Pressable
              style={{ ...theme.pressableInputIcon }}
              onPressOut={() => {
                setTypeProductList([]);
                handleRequest("HTP");
              }}
            >
              {iconSearch({ size: 16 })}
            </Pressable>
          </View>
          {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}
        </View>
        <View style={styles.containerPressable}>
          <Pressable
            style={styles.pressables}
            onPress={() => setStateModalCreate(true)}
          >
            <Text style={styles.TextPressables}>Crear Producto</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              clearForm();
            }}
            style={styles.pressables}
          >
            <Text style={styles.TextPressables}>Limpiar Formulario</Text>
          </Pressable>
        </View>
      </ScrollView>
      <ModalTypeProduct
        state={modalState}
        data={typeProductList}
        itemPressed={typeProductSelect}
        close={closeModalTP}
      />
      <ModalConfirm
        state={stateModalCreate}
        message={modalMessage}
        handleIPositiveButton={() => handleRequest("CreateProduct")}
        onClose={closeModalCP}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  containerPrincipal: {
    flex: 1,
    margin: 10,
    borderRadius: 30,
    ...theme.backgroundColorPrincipal,
  },
  containerHeader: { margin: 10, marginEnd: 20, alignItems: "center" },
  titleHeader: { ...theme.textTitle },
  containerInf: { margin: 10, alignItems: "center" },
  inputInf: {
    ...theme.textInputGlobal,
    height: 40,
    marginBottom: 10,
    width: width * 0.8,
    padding: 5, // Centra el texto dentro del TextInput
    textTransform: "capitalize",
  },
  containerPressable: { alignItems: "center", margin: 20 },
  pressables: { ...theme.pressable, margin: 5, width: 200 },
  TextPressables: { ...theme.textPressable },

  //Modal Styles
  modalcontainerPrincipal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalViewPrincipalContainer: {
    ...theme.backgroundColorPrincipal,
    maxWidth: width * 0.8,
    minWidth: width * 0.5,
    height: height * 0.5,
    borderRadius: 10,
  },
  modalHeaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderBottomWidth: 1,
    borderColor: "#d0d0d0",
  },
  modalTextHeader: {
    ...theme.textTitle,
  },
  modalFlatlistView: {
    margin: 5,
    padding: 2,
    borderColor: "#d0d0d0",
    borderWidth: 1,
    borderRadius: 10,
  },
  modalFlatlistText: { textTransform: "capitalize" },
  modalPressableClose: {
    ...theme.pressableCancel,
    padding: 10,
  },
  modalPressedClose: {
    ...theme.pressedCancel,
    padding: 10,
  },
});
