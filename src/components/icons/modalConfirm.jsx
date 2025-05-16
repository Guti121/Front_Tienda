import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import theme from "../themeStyles/theme";
import { useState } from "react";

export const ModalConfirm = ({
  state,
  message,
  handleIPositiveButton,
  onClose,
}) => {
  //hook pressable
  const [statePressableCancel, setStatePressableCancel] = useState(false);
  const [statePressablePositive, setStatePressablePositive] = useState(false);
  return (
    <Modal animationType="fade" transparent={true} visible={state} >
      <TouchableWithoutFeedback onPress={onClose}>

      <View style={styles.containerPrincipal}>
        <View style={styles.containerModal}>
          <View style={styles.containerHeader}>
            <Text style={styles.textHeader}>Mensaje</Text>
          </View>
          <View style={styles.containerMessage}>
            <ScrollView>
              <Text style={styles.textMessage}>{message}</Text>
            </ScrollView>
          </View>
          <View style={styles.pressableContainer}>
            <Pressable
              onPressIn={() => setStatePressableCancel(true)}
              onPressOut={() => {
                onClose(), setStatePressableCancel(false);
              }}
              style={
                statePressableCancel
                ? styles.pressedCancel
                : styles.pressableCancel
              }
              >
              <Text
                style={
                  statePressableCancel
                    ? { ...theme.textTitle, color: "white" }
                    : styles.textCancel
                }
              >
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPressIn={() => {
                setStatePressablePositive(true);
              }}
              onPressOut={() => {
                handleIPositiveButton();
                onClose();
                setStatePressablePositive(false);
              }}
              style={statePressablePositive ? styles.pressed : styles.pressable}
            >
              <Text style={styles.textPositive}>Aceptar</Text>
            </Pressable>
          </View>
        </View>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  containerPrincipal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  containerModal: {
    backgroundColor: "white",
    maxWidth: width * 0.8,
    minWidth: width * 0.5,
    maxHeight: height * 0.5,
    borderRadius: 10,
  },
  containerMessage: {
    minHeight: height * 0.05,
    maxHeight: height * 0.3,
    margin: 5,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  containerHeader: {
    height: 50,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#d0d0d0",
    borderBottomWidth: 1,
  },

  pressableContainer: {
    flexDirection: "row",
    maxHeight: 60,
    minHeight: 40,
  },
  pressableCancel: {
    flex: 1,
    margin: 2,
    alignItems: "center",
    justifyContent: "center",
    borderBlockColor: "red",
    backgroundColor: "rgb(255, 228, 228)",
    borderRadius: 10,
  },
  pressedCancel: {
    flex: 1,
    margin: 2,
    alignItems: "center",
    justifyContent: "center",
    borderBlockColor: "red",
    backgroundColor: "red",
    borderRadius: 10,
  },
  pressed: {
    flex: 1,
    ...theme.pressed,
    margin: 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },

  pressable: {
    flex: 1,
    ...theme.pressableColor,
    margin: 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  textHeader: {
    ...theme.textTitle,
  },
  textMessage: {
    textAlign: "center",
    alignSelf: "center",
  },
  textCancel: {
    ...theme.textTitle,
    color: "red",
    textAlign: "center",
    alignSelf: "center",
  },
  textPositive: {
    color: "white",
    textAlign: "center",
    alignSelf: "center",
  },
});
