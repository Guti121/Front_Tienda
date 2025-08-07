import { Dimensions } from "react-native";

const defaultFont = {
  fontFamily: "",
};
const pressableColorDefault = {
  backgroundColor: "#5e5ce6",
};

const pressableColorCancel = {
  backgroundColor: "rgb(255, 228, 228)",
};
export const { width, height } = Dimensions.get("window");

export default {

  colors: {
    primary: "#5e5ce6", // o el color que tú uses
    secondary: "#FF4081",
    textPrimary:"#ffffff",
    textSecundary:"#cccccc",
    textTerciary:"#888",
    backgroundColorWarning:"#1e1e2f",
    backgroundColor:"#121212",
    backgroundColorSecondary: "#2c2c2e",
  },
  //new button styles
  button: {
    marginTop: 5,
    backgroundColor: "#5e5ce6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "stretch",
    alignItems: "center",
 
  },
  textButton: { color: "#fff",
    fontWeight: "bold",
    fontSize: 16,},
  borderColorInput: {
    borderColor: "#d0d0d0",
  },
  backgroundColorPrincipal: {
    backgroundColor: "#fafbfd",
  },
  //Text
  textTitle: {
    fontWeight: "bold",
    fontSize: 18,
    ...defaultFont,
  },
  textNames: {
    ...defaultFont,
    fontSize: 15,
    fontWeight: "bold",
    color: "rgb(155, 155, 155)",
  },
  textNormal: {
    ...defaultFont,

    fontSize: 15,
  },
  errorText: {
    color: "red",
    ...defaultFont,
    marginTop: 10,
  },
  //TextInput
  textInputGlobal: {
    height: 40,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderColor: "#d0d0d0",
    
  },

  //bottom
  pressableColor: {
    ...pressableColorDefault,
  },
  pressable: {
     ...pressableColorDefault,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    //


    // borderWidth: 1,
    // borderRadius: 10,
    // padding: 10,
    // ...pressableColorDefault,
    // flexDirection: "column",
    // alignItems: "center",
    // borderColor: "#d0d0d0",
  },
  pressed: {
    backgroundColor: "#a6acaf",
    borderColor: "white",
  },
  textPressable: {
    ...defaultFont,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#ff4d4f',
    paddingVertical: 6, 
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  shadow: {
    shadowColor: "black",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowRadius: 10,
    shadowOpacity: 0.5,

    // Android
    elevation: 5,
  },

  //bottom cancel
  pressableCancel: {
    margin: 2,
    alignItems: "center",
    justifyContent: "center",
    borderBlockColor: "red",
    backgroundColor: "rgb(255, 228, 228)",
    borderRadius: 10,
  },
  pressedCancel: {
    margin: 2,
    alignItems: "center",
    justifyContent: "center",
    borderBlockColor: "red",
    backgroundColor: "red",
    borderRadius: 10,
  },
  //Text Input Icon
  viewTextInputIcon: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    width: width * 0.8,
  },
  textInputIcon: {
    flex: 1,
    borderWidth: 1,
    height: 40,
    borderWidth: 1,
    borderTopStartRadius: 10,
    borderEndStartRadius: 10,
    borderColor: "#d0d0d0",
    padding: 5,
  },
  pressableInputIcon: {
    padding: 10,
    height: 40,
    width: 40,
    borderTopEndRadius: 10,
    borderEndEndRadius: 10,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    alignItems: "center",
    justifyContent: "center",
  },
  pressableColorCancel: { ...pressableColorCancel },
};
