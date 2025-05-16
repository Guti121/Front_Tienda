import { useEffect, useState } from "react";
import { expiredGetToken } from "../axios/generalAxiosRequest";
import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { handleDeleteBill, handleFilterBillsRequest } from "./axiosReques";
import theme from "../themeStyles/theme";
import { pesosFormat } from "../icons/functionFormat";
import { iconDelete } from "../icons/icons";
import { deleteTokenStorage } from "../token/token";
import { Route } from "expo-router/build/Route";
import { router } from "expo-router";
import { ModalConfirm } from "../icons/modalConfirm";
import * as Print from 'expo-print';


export function BillGenerateDetail({ id }) {
  const [response, setResponse] = useState([]);
  const [time, setTime] = useState();
  const [date, setDate] = useState();
  const [error, setError] = useState(false);

  //State for modal delete
  const [deleteState,setDeleteState]=useState(false)

  useEffect(() => {
    if (id) {
      handleDetailBill();
    }
  }, []);

  const handleDetailBill = async () => {
    const token = await expiredGetToken();
    if (!token) {
        await deleteTokenStorage();
        return;
      }
          

    console.log(token);
    try {
      const request = await handleFilterBillsRequest({
        token,
        selectedData: false,
        number: id,
      });
      console.log(request.data);
      if (request.data) {
        // Formateamos las horas para meterla en un hook
        const fechaObjeto = new Date(request.data.fecha);

        const fecha = fechaObjeto.toISOString().split("T")[0]; // "2025-02-10"
        const hora = fechaObjeto.toTimeString().split(" ")[0]; // "22:22:52"
        setTime(hora);
        setDate(fecha);
        setResponse(request.data);
      }
    } catch (error) {
      setError(String(error));
      console.log(error);
    }
    console.log(response);
  };

  const FlatlistData = () => {
    return error ? (
      <View>
        <Text>{error}</Text>
      </View>
    ) : (
      <FlatList
        data={response.detalles}
        keyExtractor={(item, index) => index.toString()} // Asegúrate de que sea un string único
        renderItem={({ item }) => (
          <View style={styles.containerFlatlist}>
            <Text>#{item.id}</Text>
            <View style={styles.containerInfFlatlist}>
              <Text>Nombre Producto</Text>
              <Text>{item.nombre_producto}</Text>
            </View>
            <View style={styles.containerInfFlatlist}>
              <Text>Cantidad</Text>
              <Text>{item.cantidad}</Text>
            </View>
            <View style={styles.containerTotalFlatlist}>
              <View style={styles.totalsFlatlist}>
                <Text>Valor Unitario</Text>
                <Text>{pesosFormat(item.valor_und)}</Text>
              </View>
              <View style={styles.totalsFlatlist}>
                <Text>Sub Total</Text>
                <Text>{item.subtotal_cop}</Text>
              </View>
            </View>
          </View>
        )} // Ejemplo de renderizado
      />
    );
  };



  //Function Bills delete 
  const billDelete = async (id)=>{

    const token = await expiredGetToken();
    if (!token) {
        await deleteTokenStorage();
        return;
      }

    try{
      const request= handleDeleteBill(token,id)
      console.log(request.data)
      router.back()
    }catch(error)
    {
      console.error(error.message)
    }
  }

  

  //View to print

  const generateHTML = () => {
    const detallesHTML = response.detalles?.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.nombre_producto}</td>
        <td>${item.cantidad}</td>
        <td>${pesosFormat(item.valor_und)}</td>
        <td>${item.subtotal_cop}</td>
      </tr>
    `).join("");

    return `
      <html>
        <body>
          <h2 style="text-align: center;">${response.tienda_nombre}</h1> 
          <h3 style="text-align: center;">Factura #${id}</h2>
          <p style="text-align: center;">Fecha: ${date} Hora: ${time}</p>
          <p style="text-align: center;">Vendedor: ${response.creado_por_full_name}</p>

          <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Valor Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${detallesHTML}
            </tbody>
          </table>
          <h3 style="text-align: right;">Total: ${response.total_cop}</h3>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    const html = generateHTML();
    await Print.printAsync({ html });
  };


  // const handleExportToPDF = async () => {
  //   const html = generateHTML();
  //   const { uri } = await Print.printToFileAsync({ html });
  //   console.log("PDF saved to:", uri);
  //   // Optionally share it with expo-sharing
  // };


  return (
    <SafeAreaView style={{ flex: 1, ...theme.backgroundColorPrincipal }}>
      <View
        style={{
          flex: 1,
          margin: 10,
          ...theme.shadow,
          ...theme.backgroundColorPrincipal,
        }}
      >
        <View style={styles.containerDate}>
          <Text style={{ ...theme.textTitle }}>Factura</Text>
          <Text>#{id}</Text>
          <Text>{response.tienda_nombre}</Text>
          <Text>{response.creado_por_full_name}</Text>

          <Text>Fecha y hora</Text>
          <Text>{date}</Text>
          <Text>{time}</Text>
        </View>
        <FlatlistData style={{ borderWidth: 1 }} />
        <View style={styles.containerTotal}>
          <Text>Total Pagado</Text>
          <Text>{response.total_cop}</Text>
        </View>
        <View style={{width:'100%',height:'auto',alignItems:'center',justifyContent:'center'}}>
                <Pressable style={{width:'auto',height:'auto',padding:10}}
                  onPressOut={()=>{setDeleteState(true)}}>
                  {iconDelete()}
                </Pressable>
          </View>
          
          <View style={{width:'100%',height:'auto',alignItems:'center',justifyContent:'center'}}>
            <Pressable
              style={{
                ...theme.pressable,
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8
              }}
              onPress={handlePrint}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Imprimir o compartir</Text>
            </Pressable>
          </View>
         
        
      </View>
      <ModalConfirm state={deleteState} message='¿Deseas eliminar esta factura?' handleIPositiveButton={()=>{billDelete(id),setDeleteState(false)}} onClose={()=>{setDeleteState(false)}} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerDate: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  containerTotal: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  containerFlatlist: {
    borderWidth: 1,
    padding: 10,
    margin: 5,
    ...theme.borderColorInput,
  },
  containerInfFlatlist: {
    padding: 10,
  },
  containerTotalFlatlist: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  totalsFlatlist: {
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});


