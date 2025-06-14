import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { iconError } from "../src/components/icons/icons";
import theme from "../src/components/themeStyles/theme";
import { router } from "expo-router";

export default function BadRequest() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.viewContainer}>
        <View style={styles.containerTextError}>
          <Text style={styles.textError}>Ocurrio un error </Text>
        </View>
        <View style={styles.viewContainerIcon}>
          <Text style={styles.textDetail}>
            Es problable que esta vista no este disponible para este tipo de
            usuario
          </Text>
          {iconError({ size: 100, color: "rgb(227, 62, 62)" })}
        </View>

        <View style={styles.viewContainerPressble}>
          <Pressable
            onPress={() => router.replace("drawer")}
            style={styles.PressableBack}
          >
            <Text style={{ color: "white", fontSize: 20 }}>Ir a Inicio</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  textError: { ...theme.textTitle },
  PressableBack: {
    padding: 10,
    ...theme.pressable,
  },
  containerTextError: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    ...theme.shadow,
  },
  textError: {
    ...theme.textTitle,
    color: "rgb(227, 62, 62)",
    margin: 10,
    fontSize: 28,
  },
  textDetail: {
    margin: 10,
    fontSize: 20,
    color: "white",
    textAlign: "center",
  },
  viewContainerIcon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewContainerPressble: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
