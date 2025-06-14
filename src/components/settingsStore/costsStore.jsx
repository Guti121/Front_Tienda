import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ModalConfirm } from "../icons/modalConfirm";
import theme, { width } from "../themeStyles/theme";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { checkIcon, iconDelete, iconEdit, iconError } from "../icons/icons";
import { handleCostsStore, handleCreateCostsStore, handleDeleteCostsStore } from "./axiosRequest";
import { useFocusEffect } from "expo-router";
import { expiredGetToken } from "../axios/generalAxiosRequest";
import { deleteTokenStorage } from "../token/token";
import { BarNotification } from "../icons/barNotification";
import { format } from "prettier";
import { cleanNumber, formatToCOP, pesosFormat } from "../icons/functionFormat";

export function CostsStore(){
    const user = useSelector((state) => state.user.user);
      const [formData, setFormData] = useState({});
      const [originalData, setOriginalData] = useState({});
      const [editable, setEditable] = useState(false);
      const[error,setError] = useState(false)
      const[color,setColor]=useState(false)
      const[notification,setNotification]=useState(false)

      
      // Estados individuales por campo
      const [costosFijos, setCostosFijos] = useState("");
      const [margenGanancia, setMargenGanancia] = useState("");
      const [promedioProductosVendidos, setPromedioProductosVendidos] = useState("");

      //Modal confirm
      const [stateModal,setStateModal]=useState(false)
      const [stateModalDelete,setStateModalDelete]=useState(false)


    //Handle Request start render
        const handleRequest = async () => {
          try {
            const token = await expiredGetToken();
            if (!token) {
              deleteTokenStorage();
              router.replace("/login");
              return;
            }
            let request = await handleCostsStore(token);
              // Asignar valores a cada estado
            setCostosFijos(request.data?.costos_fijos || "");
            setMargenGanancia(request.data?.margen_ganancia || "");
            setPromedioProductosVendidos(request.data?.promedio_productos_vendidos || "");

           
            setEditable(false)
          } catch (error) {
            if (error?.message ==='No se encontró ninguna configuracion disponible.'){
              setCostosFijos('')
              setMargenGanancia('')
              setPromedioProductosVendidos('')
              setEditable(true)
            }
          }
        };
      
        useFocusEffect(
          useCallback(() => {
            handleRequest();
          }, [])
        );
    //-----------------------------------------------------------
    //Save changes 
    // Guardar cambios
    const handleSaveChanges = async () => {
      if (stateModal) {
        const token = await expiredGetToken();
        if (!token) {
          deleteTokenStorage();
          return;
        }
        try {
          const formData = {
            costos_fijos: cleanNumber(costosFijos),
            margen_ganancia: margenGanancia,
            promedio_productos_vendidos: promedioProductosVendidos
          };

          await handleCreateCostsStore(token, formData);
          setError("Se modificaron los campos");
          setColor("");
          errorBar()
          handleRequest()
        } catch (error) {
          setError("Error al guardar los datos");
          setColor("red");
          errorBar()
        }
      } else {
        setStateModal(true);
      }
    };



     // Función para manejar cambios en los campos de entrada
    const handleChangeTextFormat = (value) => {
      const formattedValue = formatToCOP(value); // Aplicar formato COP
      setCostosFijos( formattedValue);
    };

    

    //Modal confir from delete config costs Company 
    const deleteConfigCostCompany = async ()=>{
      try{
          const token = await expiredGetToken();
          if (!token) {
            deleteTokenStorage();
            return;
            }
            let request =await handleDeleteCostsStore(token)
            setError(request.data.message)
            errorBar()
            handleRequest()
          }catch(error){
              setError(error.message)
              setColor('red')
              errorBar()
            }
          }
    
          
    const onCloseModalDelete=()=>{
      setStateModalDelete(false)
    }


    //error bar 
    const errorBar=()=>{

      setNotification(true);
      
      setTimeout(() => {
        setNotification(false);
      }, 1500);
    }

  return (<SafeAreaView style={{ flex: 1,
          backgroundColor: theme.backgroundColorPrincipal.backgroundColor }}>
      <View style={{ flex: 1, margin: 10, padding: 10, borderRadius: 20 }}>
        {notification && <BarNotification icon={iconError({ size: 20 })} message={error} color={color} />}
        
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.viewContainerInfo}>
            <Text style={{ color: "white", ...theme.textTitle }}>Opcional</Text>
            <Text style={{ color: "white", textAlign: "left" }}>
              Estos datos te ayudarán a tener una perspectiva de un valor sugerido para cada producto:{"\n\n"}
              Teniendo en cuenta el promedio de productos vendidos en un mes, el porcentaje de ganancia que deseas 
              para los productos y los costos fijos, el sistema podrá hacer cálculos a la hora de ingresar un producto.
            </Text>
            <Text style={{color:'red',fontWeight:'bold'}}>ADVERTENCIA: No asignes valores al azar</Text> 
          </View>

          <View style={{ alignItems: "center" }}>
            {/* Costos Fijos */}
            <View style={styles.viewTextInput}>
              <Text>Costos Fijos</Text>
              <TextInput
                editable={editable}
                style={[styles.textInput, !editable && { backgroundColor: "#ddd", color: "#888" }]}
                value={editable ? costosFijos : pesosFormat(costosFijos)}
                keyboardType="numeric"
                onChangeText={(text)=>handleChangeTextFormat(text)}
              />
            </View>

            {/* Margen de Ganancia */}
            <View style={styles.viewTextInput}>
              <Text>Margen de Ganancia (%)</Text>
              <TextInput
                editable={editable}
                style={[styles.textInput, !editable && { backgroundColor: "#ddd", color: "#888" }]}
                value={margenGanancia}
                keyboardType="numeric"
                onChangeText={setMargenGanancia}
              />
            </View>

            {/* Promedio Productos Vendidos */}
            <View style={styles.viewTextInput}>
              <Text>Promedio de productos mensuales vendidos</Text>
              <TextInput
                editable={editable}
                style={[styles.textInput, !editable && { backgroundColor: "#ddd", color: "#888" }]}
                value={String(promedioProductosVendidos)}
                keyboardType="numeric"
                onChangeText={setPromedioProductosVendidos}
              />
            </View>
            

            {/* Botones de acción */}
            {user.typeUser === "creator" && (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 10 }}>
                <Pressable onPress={handleSaveChanges} style={{ marginHorizontal: 20 }}>
                  {editable && checkIcon()}
                </Pressable>
                {!editable && <Pressable onPress={() => setStateModalDelete(true)} style={{ marginHorizontal: 20 }}>
                  {iconDelete("red")}
                </Pressable>}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <ModalConfirm
        state={stateModal}
        message={"¿Quieres modificar los datos de costos fijos?"}
        handleIPositiveButton={handleSaveChanges}
        onClose={() => setStateModal(false)}
      />

      
      <ModalConfirm state={stateModalDelete}
          message={
            "¿Estas seguro de eliminar estos datos? " 
          }
          
            handleIPositiveButton={()=>deleteConfigCostCompany()}
            onClose={()=>{onCloseModalDelete()}}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  viewTextInput: { margin: 5 },
   textInput: {
          ...theme.textInputGlobal,
          height: 40,
          width: width * 0.9,
          paddingHorizontal: 10,
          backgroundColor: "#fff",
          borderRadius: 8,
      },
  viewContainerInfo: { 
    alignItems: "center", 
    height: "auto", 
    margin: 5,
    ...theme.pressableColor,
    padding: 10,
    borderRadius: 20,
  },
});