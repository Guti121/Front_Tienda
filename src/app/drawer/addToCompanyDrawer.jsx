import { Camera, CameraView } from "expo-camera";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { expiredGetToken } from "../../components/axios/generalAxiosRequest";
import { deleteTokenStorage } from "../../components/token/token";
import { handleReadQrCode } from "../../components/settingsStore/axiosRequest";
import theme from "../../components/themeStyles/theme";
import { router } from "expo-router";


//Scanear QrCode
export default function AddToCompanyDrawer(){
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned ,setScanned] = useState(false)
    const [requestVerification,setRequestVerification] = useState(false)
    const [error,setError] = useState(false)
    
    useEffect(()=>{
        const getCameraPermissions = async() =>{
            const {status} = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status ==="granted");
        }
        getCameraPermissions()
    },[])
    
    //Revisamos Si hay un permiso aprovado
    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
      }
      if (hasPermission === false) {
        return <Text>No access to camera</Text>;
      }

    
    const handleScannedData = async (scannedData) => {
        try {
          const token = await expiredGetToken();
          if (!token) {
            deleteTokenStorage();
            router.replace("/login");
          }
      
          // 1. Parse the QR content (data is a JSON string)
          const parsedData = JSON.parse(scannedData.data); // <- This is key!
          const qrToken = parsedData.token;
      
      
          // 2. Send it to your backend
          let request = await handleReadQrCode(token, qrToken);
          setRequestVerification(request.data.message);
          setTimeout(()=>{
            deleteTokenStorage();
            router.replace("/login")
          },500)

        } catch (error) {
          setError(error?.message || 'Ocurrio un error con el QR')
        }
      };
      
    return(
    <View style={{flex:1}}> 
        {requestVerification && <View style={{backgroundColor:"rgb(60, 196, 60)" ,width:'100%',height:'auto', justifyContent:'center',alignItems:'center',padding:10}}> <Text style={styles.buttomText}>{requestVerification}</Text></View>}
        {error && 
        <View style={{backgroundColor:"rgb(60, 196, 60)" ,width:'100%',height:'auto', justifyContent:'center',alignItems:'center',padding:10}}>
          <Text style={styles.buttomText}>{error}</Text>  
        </View>}
        {scanned ?
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <Pressable style={styles.pressableScanned} onPressOut={()=>{setScanned(false),setError(false),setRequestVerification(false)}}>
                <Text style={styles.buttomText}>Escanear de nuevo</Text>
            </Pressable>
        </View>:
        <View style={{flex:1}}>
            <CameraView
                    onBarcodeScanned={(scannedData)=>{scanned ? undefined :
                    (handleScannedData(scannedData),setScanned(true))}}
                    barcodeScannerSettings={
                        {barcodeTypes:["qr"]}
                    }
                    style={StyleSheet.absoluteFillObject}
                    />
        </View>}
    </View>)
}

const styles= StyleSheet.create({
  pressableScanned:{
     
    ...theme.pressable
  },
  buttomText:{
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  }
})