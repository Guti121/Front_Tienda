import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { handleDeleteCompany, handleListDetailStore, handleUpdateStore } from "../axiosRequest";
import { expiredGetToken } from "../../axios/generalAxiosRequest";
import { deleteTokenStorage } from "../../token/token";
import theme, { width } from "../../themeStyles/theme";
import { checkIcon, iconDelete, iconEdit, iconError } from "../../icons/icons";
import { BarNotification } from "../../icons/barNotification";
import { useSelector } from "react-redux";
import { ModalConfirm } from "../../icons/modalConfirm";


// En esta vista se realiza El update de los datos de una compañia, al mismo tiempo se realiza la visualizacion de los datos ya guardados

export default function DetailsMyStore() {
  
  const user = useSelector((state) => state.user.user);
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [editable, setEditable] = useState(false);
  const[error,setError] = useState(false)
  const[color,setColor]=useState(false)
  const[notification,setNotification]=useState(false)

  //Modal confirm
  const [stateModal,setStateModal]=useState(false)
  const [stateModalDelete,setStateModalDelete]=useState(false)

  

  const handleRequest = async () => {
    try {
      const token = await expiredGetToken();
      if (!token) {
        deleteTokenStorage();
        router.replace("/login");
        return;
      }
      let request = await handleListDetailStore(token);
      setFormData(request.data);
      setOriginalData(request.data);
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleRequest();
    }, [])
  );
//------------------------------------Update------------------------------------
  // Función para manejar cambios en los campos de entrada
  const handleChangeText = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Función para detectar los cambios y hacer el PATCH
  const handleSaveChanges = async () => {
    if (!editable){setEditable(true)}
    else if (stateModal){
        const token = await expiredGetToken();
        if (!token) {
        deleteTokenStorage();
        return;
        }

        // Filtrar solo los campos que cambiaron
        const updatedFields = Object.keys(formData).reduce((acc, key) => {
        if (formData[key] !== originalData[key]) {
            acc[key] = formData[key];
        }
        return acc;
        }, {});

        // Solo hacer la petición si hay cambios
        if (Object.keys(updatedFields).length > 0) {
        try {
            console.log(updatedFields)
            let request =await handleUpdateStore(token,updatedFields); // Llamada a la API
            setError('Se modificaron los campos'); 
            setColor('')
            errorBar()
            setOriginalData(request); // Actualiza los datos originales con los nuevos
        } catch (error) {
         
          console.log(error.message); 
          setError(error.message); 
          setColor('red')
          errorBar()
         
        }
      }
      
      setEditable(false);
    }else{
    
      setStateModal(true)
    }
  };



    //Delete Company 

    const deleteCompany = async ()=>{
      try{
        const token = await expiredGetToken();
          if (!token) {
            deleteTokenStorage();
            return;
          }
          let request =await handleDeleteCompany(token)
          console.log(request)
      }catch(error){
        console.log(error.message)
        setError(error.message)
        errorBar()
      }
    }


    const errorBar=()=>{

      setNotification(true);
      
      setTimeout(() => {
        setNotification(false);
      }, 1500);
    }


    //Modal Confim from Edit Company
    const onCloseModalUpdate=()=>{
      setStateModal(false),
      setEditable(false);
      handleRequest()
    }


    const onCloseModalDelete=()=>{
      setStateModalDelete(false)
    }
  return (
    <SafeAreaView style={{ flex: 1,...theme.backgroundColorPrincipal}}>
      <View style={{ flex: 1, margin: 10, padding: 10, borderRadius: 20 }}>
          {notification && (
                    <BarNotification
                      icon={iconError({size:20})}
                      message={error}
                      color={color}
                    />
                  )}
        <ScrollView style={{ flex: 1 }}>
          <View style={{ alignItems: "center", height: 100 }}>
            <Text>Photo Profile</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            {[
              { label: "Nit", key: "nit" },
              { label: "Compañia", key: "company" },
              { label: "Nombre", key: "name" },
              { label: "Celular o Teléfono", key: "phone" },
              { label: "Correo Electrónico", key: "email" },
              { label: "Dirección", key: "direction" },
              { label: "Municipio", key: "municipality" },
            ].map(({ label, key }) => (
              <View key={key} style={styles.viewTextInput}>
                <Text>{label}</Text>
                <TextInput
                  editable={editable}
                  style={[styles.textInput, !editable && { backgroundColor: "#ddd", color: "#888" }]}
                  value={formData?.[key] || ""}
                  onChangeText={(text) => handleChangeText(key, text)}
                />
              </View>
            ))}
            {user.typeUser === 'creator' &&
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 10 }}>
              <Pressable onPress={()=>handleSaveChanges()} style={{ marginHorizontal: 20 }}>
              {!editable ? iconEdit({ color: "black" }) : checkIcon()}
              </Pressable>
              {
               !editable &&(

                   <Pressable onPress={()=>setStateModalDelete()}
                style={{ marginHorizontal: 20 }}>{iconDelete("red")}</Pressable>
               ) 
              }
            </View>}
          </View>
        </ScrollView>
      </View>
      <ModalConfirm state={stateModal}
      message={'¿Quieres modificar los datos de la compañias?'}
      handleIPositiveButton={handleSaveChanges}
      onClose={()=>{onCloseModalUpdate()}}/>


      <ModalConfirm state={stateModalDelete}
     message={
      "¿Quiere eliminar tu compañía? " +
      "Si eliminas la compañía, no podrás recuperar tus datos. " +
      "Todos los datos asociados a tu tienda desaparecerán de nuestro sistema."
    }
    
      handleIPositiveButton={()=>deleteCompany()}
      onClose={()=>{onCloseModalDelete()}}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  viewTextInput: { margin: 5 },
  textInput: {
    ...theme.textInputGlobal,
    height: 40,
    marginBottom: 10,
    width: width * 0.8,
    padding: 5,
    textTransform: "capitalize",
  },
});
