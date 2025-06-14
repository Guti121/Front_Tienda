import { Camera, CameraView } from "expo-camera";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";


//Scanear QrCode
export default function QrCodeAddUserCompany(){
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned ,setScanned] = useState(false)
    
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

    return(
    <View style={{flex:1}}>
        
        {scanned ?
        <View>
            <Text>Codigo escaneado</Text>
            <Pressable style={{flex:1}} onPressOut={()=>setScanned(false)}>
                <Text>Escanear de nuevo</Text>
            </Pressable>
        </View>: 
        <View style={{flex:1}}>
            <CameraView
                    onBarcodeScanned={(scannedData)=>{scanned ? undefined :
                    setScanned(true)}}
                    barcodeScannerSettings={
                        {barcodeTypes:["qr"]}
                    }
                    style={StyleSheet.absoluteFillObject}
                    />
        </View>}
    </View>)
}