import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { handleBarCode, handleDeleteProduct, handleRetrieveProduct } from "../axiosRequest";
import { Link, router, useFocusEffect } from "expo-router";
import { expiredGetToken } from "../../axios/generalAxiosRequest";
import theme, { height, width } from "../../themeStyles/theme";
import { pesosFormat } from "../../icons/functionFormat";
import { iconDelete, iconEdit, iconMinus, iconPlus } from "../../icons/icons";
import { ModalConfirm } from "../../icons/modalConfirm";
import { BarNotification } from "../../icons/barNotification";
import { isWeb } from "../../token/localstorage";
import html2pdf from 'html2pdf.js';

export default function DetailProduct({ id }) {
  //hook product
  const [product, setProduct] = useState([]);
  const [stateModalConfirm, setStateModalConfirm] = useState(false);
  const [stateBarNotification, setStateBarNotification] = useState(null);
  const [barcodeProduct,setBarCodeProduct] = useState(null)
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
          console.log(request.data)
          setProduct(request.data);
          const barcode =await handleBarCode(id,token);
          setBarCodeProduct(barcode.barcode)
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

  //Variable para renderizar imagen  
  const imageUri = barcodeProduct
              ? barcodeProduct
              : "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

  //print codigo de barras 
  // Agrega este fragmento dentro de tu componente DetailProduct, después de const [selectedSize...]
  // Hooks
const [showPrintSizeModal, setShowPrintSizeModal] = useState(false);
const [selectedSize, setSelectedSize] = useState("80");

const sizeOptions = ["58", "80", "100"];

const sizeConfig = {
  "58": {
    width: 58,
    height: 35,
    titleSize: 9,
    priceSize: 9,
    barcodeWidth: "50mm"
  },
  "80": {
    width: 80,
    height: 40,
    titleSize: 10,
    priceSize: 9,
    barcodeWidth: "70mm"
  },
  "100": {
    width: 100,
    height: 45,
    titleSize: 12,
    priceSize: 10,
    barcodeWidth: "85mm"
  }
};

const convertImageToBase64 = async (imageUrl) => {
  const response = await fetch(`${imageUrl}?t=${new Date().getTime()}`, {
    mode: 'cors',
    cache: 'no-store'
  });
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};
const generateHTML = (size = "80", base64Image = "", barcodeNumber = "") => {
  const config = sizeConfig[size] || sizeConfig["80"];
  console.log(config)

  return `
    <div style="
      width: ${config.width}mm;
      height: ${config.height}mm;
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: left;
      padding: 2mm;
      box-sizing: border-box;
    ">
      <div style="
        font-size: ${config.titleSize}pt;
        text-transform: uppercase;
        word-wrap: break-word;
        white-space: normal;
        overflow-wrap: break-word;
        max-width: 100%;
        font-weight: bold;
      ">${product.nombre}</div>
      <div style="
        font-size: ${config.priceSize}pt;
        font-weight: bold;
        margin-bottom: 1mm;
      ">${pesosFormat(product.valor)}</div>
      <img src="${base64Image}" alt="barcode" style="
        width: ${config.barcodeWidth};
        max-height: 18mm;
        object-fit: contain;
        padding: 2mm;
        margin-bottom: 0.5mm;
      "/>
      <div style="
        font-size: 10pt;
        font-family: 'OCR A', monospace;
        letter-spacing: 0.5px;
        word-break: break-all;
      ">${barcodeNumber}</div>
    </div>
  `;
};

const downloadBarcodePDF = async (size) => {
  if (!product || !product.nombre || !product.valor) {
    alert("El producto no está cargado correctamente.");
    return;
  }

  const config = sizeConfig[size] || sizeConfig["80"];
  console.log(config,"size")
  const base64Image = await convertImageToBase64(imageUri);
  const htmlContent = generateHTML(size, base64Image, product.codigo_barras || "");

  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  html2pdf()
    .from(container)
    .set({
      margin: 0,
      filename: `${product.nombre || 'codigo-de-barras'}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: 'mm',
        format: [config.height, config.width],
        orientation: 'landscape'
      }
    })
    .save()
    .then(() => {
      document.body.removeChild(container);
    });
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
           <Image
                source={{ uri:imageUri }}
                  style={{ width:300, height: 350, resizeMode: "cover" }}
              />
            <Text numberOfLines={2} style={styles.textName}>{product.nombre}</Text>
          </View>
          <View style={{flexDirection:'row',width:'100%'}}>

           <View
              style={{
                width:'50%'
              }}
              >
              <Text style={styles.textTitles}>Valor por mayor</Text>
              <Text style={{ ...styles.textDetail, fontSize: 15 }}>
                {pesosFormat(product.valor_mayor)}
              </Text>
            </View>
            <View
              style={{
                width:'50%', 
                backgroundColor: "rgb(225, 255, 191)",
              }}
              >
              <Text style={styles.textTitles}>Valor de venta</Text>
              <Text style={{ ...styles.textDetail, fontSize: 15 }}>
                {pesosFormat(product.valor)}
              </Text>
            </View>
          </View>
          <View style={styles.containerDetailsView}>
            <View style={styles.containerDetails}>
              <Text style={styles.textTitles}>Tipo de Producto</Text>
              <Text style={styles.textDetail}>{product.tipo_producto}</Text>
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
                <Text style={styles.textTitles}>Detalles</Text>
                <Text style={styles.textDetail}>{product.detalles}</Text>
              </View>
          </View>
          
          <View style={styles.nameView}>
            <Image
                  source={{ uri:imageUri }}
                  style={{ width:300, height: 250, resizeMode: "cover" }}
                  />
          <Pressable onPress={() => setShowPrintSizeModal(true)}>
            <Text style={{ color: 'green' }}>Descargar PDF</Text>
          </Pressable>

          {showPrintSizeModal && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 100,
            }}>
              <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: 250 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Seleccione el tamaño</Text>
                {sizeOptions.map((size) => (
                  <Pressable key={size} onPress={() => setSelectedSize(size)}>
                    <Text style={{
                      padding: 10,
                      backgroundColor: selectedSize === size ? '#ccc' : '#eee',
                      marginBottom: 5,
                      textAlign: 'center'
                    }}>{size} mm</Text>
                  </Pressable>
                ))}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                  <Pressable onPress={() => setShowPrintSizeModal(false)}>
                    <Text style={{ color: 'red' }}>Cancelar</Text>
                  </Pressable>
                  <Pressable onPress={() => {
                    setShowPrintSizeModal(false);
                    isWeb ? downloadBarcodePDF(selectedSize) : handlePrint(selectedSize);
                  }}>
                    <Text style={{ color: 'green' }}>Descargar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

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
    margin: 5,
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
    paddingHorizontal:10,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    ...theme.borderColorInput,
  },
  textName: {
    textAlign:'center',
    ...theme.textTitle,
    textTransform:'uppercase',
    margin: 1,
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
    textTransform: "uppercase",
    ...theme.textTitle,
    margin: 5,
    fontSize:15
  },
  textDetail: { textTransform: "capitalize", margin: 5, 
    ...theme.textNames,
    fontSize:15

  },

  pressableIconsUnits: {
    paddingHorizontal: 8,
    width: "33%",
    justifyContent: "center",
    alignItems: "center",
   
  },
});
