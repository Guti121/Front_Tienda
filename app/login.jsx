import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FormLogin from "../src/components/sesion/loginView";
import theme, { width } from "../src/components/themeStyles/theme";
import { useState } from "react";
import FormRegister from "../src/components/sesion/registerView";
import { useSelector } from "react-redux";
import IndexAppInfo from "../src/components/staticFile/indexAPP";
import { iconArrowLeft, iconArrowTop } from "../src/components/icons/icons";

export default function Login() {
  const [isPressedLoginWindow, setIsPressedLoginWindow] = useState(false);
  const [isPressedRegisterWindow, setIsPressedRegisternWindow] = useState(false);
  const [views,setViews] = useState(false)
  const user = useSelector((state) => state.user.user);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.containerPrincipal}>  
        <View style={styles.selectWindow}>
          <Pressable
            style={[
              styles.selectWindowPressable,
              ,
              isPressedLoginWindow ? theme.pressed : null, 
            ]}
            onPressIn={() =>{setIsPressedLoginWindow(true); setViews(true); }} 
            onPressOut={() => {
              setTimeout(() => {
                setIsPressedRegisternWindow(false);
              }, 50);
            }}
          >
            <Text
              style={[
                isPressedLoginWindow ? styles.textPressed : theme.textPressable,
              ]}
            >
              Iniciar Sesión
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.selectWindowPressable,
              isPressedRegisterWindow ? theme.pressed : null, // Aplica estilo adicional si está presionado
            ]}
            onPressIn={() => {setIsPressedRegisternWindow(true), setViews(true)}} // Cambia el estado a verdadero cuando se presiona
            onPressOut={() => {
              setTimeout(() => {
                setIsPressedLoginWindow(false);
              }, 5);
            }}
          >
            <Text
              style={[
                isPressedRegisterWindow
                  ? styles.textPressed
                  : theme.textPressable,
              ]}
            >
              Registrase
            
            </Text>
          </Pressable>
        </View>
          {views && <View style={{ flex: 1, width: "100%" }}>
            {!isPressedRegisterWindow ? <FormLogin /> : <FormRegister />}
               <Pressable style={{width:'100%',alignItems:'center', backgroundColor:theme.colors.backgroundColor}}
                  onPress={()=>setViews(false)}
                  >
                      {iconArrowTop({size:60,color:theme.colors.primary})}
                </Pressable>
          </View>
          }
     
      </View>
        <IndexAppInfo/>
        


    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  containerPrincipal: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:theme.colors.backgroundColor,
  },
  selectWindow: {
    width: Platform.OS === "web" ? 350 : width * 0.9,
    padding: 5,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: theme.colors.primary,
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundColorSecondary,
    ...theme.shadow,
    shadowColor:theme.colors.primary,
    margin: 20,
    //alineamos los items internos

    justifyContent: "center",
  },
  selectWindowPressable: {
    ...theme.pressable,
    paddingHorizontal: 10,
    flex: 1,
    marginHorizontal: 1,
  },
  textPressed: {
    ...theme.textPressable,
    textAlign:'center',
    color: "black",
  },
});
