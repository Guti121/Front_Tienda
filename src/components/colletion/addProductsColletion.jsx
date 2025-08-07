import {
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
  Modal,
  Platform,
  Switch,
} from "react-native";
import { expiredGetToken } from "../axios/generalAxiosRequest";
import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  handleCreateProduct,
  handleSuggestedRetailPrice,
} from "./axiosRequest";
import theme, { height, width } from "../themeStyles/theme";
import { ScrollView } from "react-native";
import { cleanNumber, formatToCOP, pesosFormat, pesosformat } from "../icons/functionFormat";
import { ModalConfirm } from "../icons/modalConfirm";
import { BarNotification } from "../icons/barNotification";
import { checkIcon, iconInfo, iconSearch } from "../icons/icons";
import ModalTypeProduct from "./modalAddProductColletion";
import ImagePickerWeb from "./componentWebimage";
import AnimatedButton from "../catalog/stylesCatalogo/buttonAnimate";
import { isWeb } from "../token/localstorage";

// Esta vista viene de el drawer addProductsDrawer y tiene como funcion renderizar el formulario
// Y añadir los nuevos producto a el almacen o stock

export function AddProductsColletion() {
  //hook inputs

  const [datesProducts, setDatesProducts] = useState([
    {
      nombre: "",
      tipo_producto:"",
      detalles: "",
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
  const [productImages, setProductImages] = useState([]); // <- plural

  const [modalState, setModalState] = useState(false);
  const [typeProductList, setTypeProductList] = useState([]);
  //hook modal create product
  const [stateModalCreate, setStateModalCreate] = useState(false);
  const [messageModalCreate, setMessageModalCreate] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [percent,setPercent] = useState(0)
  const [isPublic, setIsPublic] = useState(false);

  const [valorMayor,setValorMayor]= useState(0)
  const [valor,setValor]= useState(0)

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
      token = await expiredGetToken();
      if (!token) {
        router.replace("login/");
      }
      if (which === "SRP") {
        try{
          const request = await handleSuggestedRetailPrice(
          datesProducts[0].valor_mayor,
          token,
          percent
        );

        setMessageSuggested(request.data);
        }
        catch(error){
          setErrorParams(error?.response?.data?.error ||'Error al Buscar Datos')
        }
      }
      // Si which es HTP significa que estamos consultando los tipos de productos existentes
      if (which === "HTP") {
        setModalState(true);
      }

      if (which === "CreateProduct") {
        try {
          const data = datesProducts[0];
          const formData = new FormData();

          // Agregar automáticamente todos los campos excepto la imagen
          for (const key in data) {
            if (data[key] !== undefined && key !== "image") {
              formData.append(key, data[key]);
            }
          }

          // Adjuntar múltiples imágenes
          if (productImages?.length > 0) {
              productImages.forEach((img, index) => {
                if (img.file) {
                  // Web or platforms that provide a File object
                  formData.append("imagenes", img.file);
                } else if (img.uri) {
                  // Mobile: build the file manuall
                  // y
                  const uriParts = img.uri.split(".");
                  const fileType = uriParts[uriParts.length - 1];
                  formData.append("imagenes", {
                    uri: img.uri,
                    name: `image_${index}.${fileType}`,
                    type: `image/${fileType}`,
                  });
                }
              });
            }


          setStateModalCreate(false);
          const request = await handleCreateProduct(token,formData);
          
          setMessageModalCreate(true);
          setTimeout(() => {
            setMessageModalCreate(false);
            if (request?.data?.id){
            router.push({
                  pathname: "/products/detailProduct",
                  params: { id: request.data.id },
                });
          }
          }, 1500);  
          
          clearForm()
        
          
        } catch (error) {
          const errorMessage =
            error.response?.data?.error?.error ||
            error.response?.data?.error || // Si existe error.response.data.error, úsalo
            error.response?.data?.detail || // Si no, usa error.response.data.detail
            error.response?.data?.detalles ||
            error.response?.datas || // Si tampoco, usa error.response.data completo
            "Error desconocido";
          setErrorMessage(
            typeof errorMessage === "string" && errorMessage.length > 100 || errorMessage == "This field may not be blank."
              ? "Ocurrió un error inesperado,verifica los campos y inténtalo de nuevo."
              : String(errorMessage) // Convertir a string en caso de que sea un objeto o número
          );
        }
      }
    } catch (error) {
      if (error.response.data.error) {
        setErrorParams(error.response.data.error);
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
    } 
  };
  //-----------------------------------------------------------------------
  //resivimos el item seleccionado en el modal
  const typeProductSelect = (item) => {
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
    detalles: 
    ${product.detalles}\n
    Valor Mayor: 
    ${pesosFormat(product.valor_mayor)}\n
    Valor Costos Fijos: 
    ${pesosFormat(product.valor_costos_fijos)}\n
    Valor: 
    ${pesosFormat(product.valor)}\n
    Unidades Disponibles: 
    ${product.unidades_disponibles}
    `;
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
        detalles: "",
        valor_mayor: 0,
        valor_costos_fijos:0,
        valor: 0,
        unidades_disponibles: 0,
        publicar: false,
      },
    ]);
    setIsPublic(false)
    setPercent(0)
    setValorMayor(0)
    setValor(0)
    setProductImages([]);;
    setTypeProductList([]);
    setErrorMessage(false);
    setErrorParams(false);
    setIsChecked(false)
    setMessageSuggested([])
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
      <View style={styles.viewContainerInfo}>
          <Text style={{ color: "white", textAlign: "left" }}>
            Todos los campos son obligatorios
          </Text>
      </View>
      <ScrollView>
        <View style={styles.containerInf}>
          <View
            style={styles.viewTextInput}
          >
            <Text>Nombre del Producto*</Text>
          </View>
          <TextInput
            style={styles.inputInf}
            value={datesProducts[0].nombre}
            onChangeText={(text) => {
              addTolist("nombre", text);
            }}
          />
          <View
            style={styles.viewTextInput}
          >
            <Text>Detalles*</Text>
          </View>
          <TextInput
            value={datesProducts[0].detalles}
            onChangeText={(text) => addTolist("detalles", text)}
            style={[styles.inputInf, { height: 100, textAlignVertical: 'top' ,textTransform:"none"}]} // Ajusta el estilo para multiline
            multiline
          />
          <View
            style={styles.viewTextInput}
          >
            <Text>Valor por mayor*</Text>
          </View>
          
          <TextInput
              placeholder="$"
              style={styles.inputInf}
              value={valorMayor}
              keyboardType="numeric"
              onChangeText={(text) => {
                setIsChecked(false)
                addTolist('valor_costos_fijos',0)
                addTolist("valor_mayor", cleanNumber(text) );
                setValorMayor(formatToCOP(text))
                setMessageSuggested([]);
                setErrorParams(false);
                setErrorMessage(false);
                isNum(text);
              }}
          />
          <View style={styles.priceSuggestionBox}>
              <Text style={styles.sectionTitle}>📈 Precio sugerido de venta</Text>
               {!percent && (
                <Text style={{ fontSize: 12, color: '#bbb', marginVertical: 4 }}>
                  * Si no asignas un %, se usará el porcentaje configurado en los costos fijos.
                </Text>
              )}
              <View style={styles.row}>
                <TextInput
                  placeholder="% ganancia"
                  style={styles.percentInput}
                  keyboardType="numeric"
                  value={percent.toString()}
                  onChangeText={(text) => setPercent(text)}
                />
                <Pressable
                  onPress={() => handleRequest("SRP")}
                  style={styles.calcButton}
                >
                  <Text style={styles.calcButtonText}>Calcular</Text>
                </Pressable>
              </View>
             
              <Text style={styles.helpText}>
                Se calcula el precio sugerido sumando tus costos fijos y el porcentaje de ganancia.
              </Text>
              
              {errorParams && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorParams}</Text>
                  <Link
                    style={styles.linkText}
                    href="/myStoreSettings/costsMyStoreDrawer"
                  >
                    Configurar costos fijos...
                  </Link>
                </View>
              )}

              {messageSuggested && Object.keys(messageSuggested).length > 0 && (
                <View style={styles.resultBox}>
                  <Text style={styles.resultText}>
                    💰 Precio sugerido de venta: {pesosFormat(messageSuggested.Precio_sugerido_Unidad)}
                  </Text>
                  <Text style={styles.resultText}>
                    🧮 Valor con CFs: {pesosFormat(messageSuggested.ValorXmayor_CF
                  )}
                  </Text>
                  <Text style={styles.resultText}>
                    📊 Ganancia estimada: {Math.round(messageSuggested.Margen * 100)}%
                  </Text>

                  <View style={styles.switchRow}>
                    <Text style={{ color: "#fff" }}>¿Agregar CFs al producto?</Text>
                    <Switch
                      value={isChecked}
                      onValueChange={(newValue) => {
                        setIsChecked(newValue);
                        let valorConCFs =
                          messageSuggested.ValorXmayor_CF - datesProducts[0].valor_mayor;
                        const valorRedondeado = parseFloat(valorConCFs.toFixed(2));
                        addTolist("valor_costos_fijos", newValue ? valorRedondeado : 0);
                      }}
                    />
                  </View>
                </View>
              )}
            </View>


          <View
            style={styles.viewTextInput}
          >
            <View
              style={{
                alignItems: "flex-start",
                justifyContent: "flex-start",
                width: width * 0.8,
              }}
            >
              <Text>Valor*</Text>
            </View>
          </View>
          <TextInput
            placeholder="$"
            style={styles.inputInf}
            value={valor}
            keyboardType="numeric"
            onChangeText={(text) => {
              addTolist("valor", cleanNumber(text) );
              setValor(formatToCOP(text))
            }}
         
          />
          <View
            style={styles.viewTextInput}
          >
            <View
              style={{
                alignItems: "flex-start",
                justifyContent: "flex-start",
                width: width * 0.8,
              }}
            >
              <Text>Unidades*</Text>
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
            style={styles.viewTextInput}
          >
            <Text>Tipo de producto*</Text>
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
           <View
            style={styles.viewTextInput}
          >
            <Text>Publicar*</Text>
          <Switch 
                  value={isPublic} 
                  onValueChange={(newValue)=>{setIsPublic(newValue)
                    if(newValue){
                      addTolist('publicar',newValue)
                    }else{
                      addTolist('publicar',false)
                    }
                 }} />
          </View>
          {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}
          <ImagePickerWeb images={productImages} setImages={setProductImages} />
        </View>
        <View style={styles.containerPressable}>
          <AnimatedButton
            title="Crear Producto"
            style={styles.pressables}
            textStyle={styles.TextPressables}
            onPress={() => setStateModalCreate(true)}
          />
           <AnimatedButton
            title="Limpiar Formulario"
            onPress={() => {
              clearForm();
            }}
            style={styles.pressables}
            textStyle={styles.TextPressables}
          />
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
  containerPrincipal: { flex: 1, padding: 10, ...theme.backgroundColorPrincipal },
  containerHeader: { margin: 10, marginEnd: 20, alignItems: "flex-start" },
  titleHeader: { ...theme.textTitle },
  infoBox: { alignItems: "center", marginVertical: 10, padding: 10, borderRadius: 10, ...theme.pressableColor },
  infoText: { color: "white", textAlign: "center" },
  scrollForm: { paddingHorizontal: 20, paddingBottom: 30 },
  label: { fontWeight: "bold", marginBottom: 5 },
  inputInf: { ...theme.textInputGlobal, height: 45, borderRadius: 10, borderWidth: 1, borderColor: "#ccc", paddingHorizontal: 10, backgroundColor: "#fff" },
  rowInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 },
  percentInput: { width: 50, height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 5 },
  calcButton: { ...theme.pressable, width: '60%', marginRight: 10 },
  linkText: { color: 'blue', textDecorationLine: 'underline' },
  errorText: { color: 'red', marginTop: 10 },
  containerPressable: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  pressables: { ...theme.pressable, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  TextPressables: { ...theme.textPressable },
  viewTextInput:{alignItems: "flex-start",justifyContent: "flex-start",width: width * 0.8,paddingTop:5},
  priceSuggestionBox: {
  backgroundColor: "#1e1e2f",
  padding: 15,
  borderRadius: 12,
  marginVertical: 15,
  borderColor: "#5e5ce6",
  borderWidth: 1,
},

sectionTitle: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
  marginBottom: 10,
},

row: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 10,
},

percentInput: {
  width: 80,
  height: 40,
  backgroundColor: "#fff",
  borderRadius: 8,
  paddingHorizontal: 10,
  color: "#000",
},

calcButton: {
  backgroundColor: "#5e5ce6",
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
},

calcButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 14,
},

helpText: {
  color: "#bbb",
  fontSize: 12,
  marginBottom: 10,
},

errorBox: {
  backgroundColor: "#2a2a2a",
  padding: 10,
  borderRadius: 8,
  marginTop: 10,
},

errorText: {
  color: "red",
  fontSize: 13,
  marginBottom: 5,
},

linkText: {
  color: "#5e5ce6",
  fontSize: 13,
  textDecorationLine: "underline",
},

resultBox: {
  marginTop: 10,
  backgroundColor: "#2d2d3d",
  padding: 10,
  borderRadius: 8,
},

resultText: {
  color: "#eee",
  fontSize: 14,
  marginVertical: 2,
},

switchRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 10,
},

});