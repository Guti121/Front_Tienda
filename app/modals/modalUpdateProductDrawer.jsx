import { router, useLocalSearchParams } from "expo-router";
import { ModalUpdateProduct } from "../../src/components/colletion/product/modalUpdateProduct";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState } from "react";
import theme, { height, width } from "../../src/components/themeStyles/theme";
import { expiredGetToken } from "../../src/components/axios/generalAxiosRequest";
import { handleUpdateUnitsProduct } from "../../src/components/colletion/axiosRequest";
import { ModalConfirm } from "../../src/components/icons/modalConfirm";

export default function ModalUpdateProductDrawer() {
  const { product, event } = useLocalSearchParams();
  const [stateConfirmModal, setStateConfirmModal] = useState(false);
  const [messageConfirm, setMessageConfirm] = useState("");
  const parsedProduct = JSON.parse(product || "{}");
  const action = event;
  const { id, nombre, unidades_disponibles } = parsedProduct;

  const [nombreInput, setNombreInput] = useState(nombre);
  const [nuevasUnidadesDisponiblesInput, setNuevasUnidadesDisponiblesInput] =
    useState(String(unidades_disponibles));
  const [nuevasUnidades, setNuevasUnidades] = useState("0");

  //hook error
  const [error, setError] = useState(false);

  // trabajamos con el valor generado directamente del useLocalSearch por que este valor va mantener fijo
  //a diferencia de si trabajo con el hook , este sera cambiante
  const newUnits = () => {
    if (parseInt(typeof nuevasUnidades) > 0) {
      setError("Ingrese un valor numerico o mayor que 0");
    } else {
      const unidadesActuales = parseInt(unidades_disponibles, 10) || 0;
      const unidadesNuevas = parseInt(nuevasUnidades, 10) || 0;


      if (action === "agg") {
        if (unidadesNuevas > 0) {
          const newValue = unidadesActuales + unidadesNuevas;
          // Asegúrate de convertirlo a cadena si es necesario para mantener consistencia
          setNuevasUnidadesDisponiblesInput(String(newValue));
        } else {
          setError("El numero que ingresaste es menor que 0");
        }
      } else if (action === "decreased") {
        if (unidades_disponibles >= unidadesNuevas) {
          const newValue = unidadesActuales - unidadesNuevas;
          // Asegúrate de convertirlo a cadena si es necesario para mantener consistencia
          setNuevasUnidadesDisponiblesInput(String(newValue));
        } else {
          setError(
            "El numero ingresado supera las unidades disponibles en el stock",
          );
        }
      } else {
        setError("Ocurrio Un error!");
      }
    }
  };
  //request
  const handleUpdate = async () => {
    try {
      const token = await expiredGetToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        
        const request = await handleUpdateUnitsProduct(
          token,
          id,
          nuevasUnidadesDisponiblesInput,
        );
        if (request.status == 200) {
          router.back();
        }
      } catch (error) {
      }
    } catch {
      router.replace("/login");
    }
  };

  //-----------------------------ModalConfirm------
  //function active
  const confirm = (text) => {
    if (text === "agg") {
      setMessageConfirm(
        `¿Desea Agregar ${nuevasUnidades} unidades al stock?
        Stock Actual ${unidades_disponibles}

        Nuevo stock ${nuevasUnidadesDisponiblesInput}`,
      );
      setStateConfirmModal(true);
    } else if (text === "decreased") {
      setStateConfirmModal(true);
      setMessageConfirm(
        `¿Desea Eliminar ${nuevasUnidades} unidades al stock?
        Stock Actual ${unidades_disponibles}
        
        Nuevo stock ${nuevasUnidadesDisponiblesInput}`,
      );
    }
  };

  const onCloseBottomModal = () => {
    setStateConfirmModal(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, ...theme.backgroundColorPrincipal }}>
      <View style={styles.containerInputs}>
        <View style={styles.nameView}>
          <Text
            style={{
              color: "white",
              textTransform: "capitalize",
              ...theme.textTitle,
            }}
          >
            {nombre}
          </Text>
        </View>
        <View style={styles.unitsView}>
          {action == "decreased" && (
            <Text style={{ color: "red", ...theme.textTitle }}>
              ¡Recuerda que vas a eliminar unidades!
            </Text>
          )}
          <Text style={{ ...theme.textTitle }}>
            Unidades Disponibles en stock
          </Text>
          <Text style={styles.textUnitsAvailable}>{unidades_disponibles}</Text>
        </View>
        <View style={styles.aggView}>
          <Text style={{ ...theme.textTitle }}>Unidades</Text>
          {action === "agg" ? (
            <Text>
              Ingrese el numero de unidades que desea agregar al Stock
            </Text>
          ) : action == "decreased" ? (
            <Text>
              Ingrese el numero de unidades que desea Eliminar del Stock
            </Text>
          ) : null}
          <TextInput
            value={nuevasUnidades}
            onChangeText={(text) => {
              setNuevasUnidades(text);
              setNuevasUnidadesDisponiblesInput(unidades_disponibles);
              setError(false);
            }}
            keyboardType="numeric" // Sugerido para valores numéricos
            onBlur={newUnits}
            returnKeyType="done"
            style={styles.textInpuetStyle}
          />
          {error && <Text style={{ color: "red" }}>{error}</Text>}
        </View>
        {nuevasUnidadesDisponiblesInput != unidades_disponibles && (
          <View style={styles.newValueView}>
            <Text style={{ ...theme.textTitle }}>Su stock total seria:</Text>
            <Text
              style={[
                {
                  ...theme.textTitle,

                  fontSize: 30,
                },
                action == "decreased"
                  ? { color: "red" }
                  : { color: "rgb(60, 196, 60)" },
              ]}
            >
              {nuevasUnidadesDisponiblesInput}
            </Text>
          </View>
        )}
      </View>
      <View
        style={{
          height: height * 0.3,
          margin: 5,
          ...theme.backgroundColorPrincipal,
        }}
      >
        {action == "agg" ? (
          <Pressable
            onPressOut={() => {
              confirm("agg");
            }}
            style={styles.pressablesStyle}
            disabled={parseInt(nuevasUnidades) <= 0}
          >
            <Text style={{ color: "white" }}>Agregar</Text>
          </Pressable>
        ) : (
          action == "decreased" && (
            <Pressable
              disabled={parseInt(nuevasUnidades) <= 0}
              onPressOut={() => {
                confirm("decreased");
              }}
              style={styles.pressablesStyle}
            >
              <Text style={{ color: "red" }}>Eliminar</Text>
            </Pressable>
          )
        )}
      </View>
      <ModalConfirm
        state={stateConfirmModal}
        message={messageConfirm}
        handleIPositiveButton={handleUpdate}
        onClose={onCloseBottomModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerInputs: {
    ...theme.backgroundColorPrincipal,

    height: height * 0.7,
    margin: 5,
  },
  textInpuetStyle: {
    ...theme.textInputGlobal,
    height: 30,
    height: 30,
    width: width * 0.9,
    padding: 5, // Centra el texto dentro del TextInput
    textTransform: "capitalize",
    marginVertical: 5,
  },
  nameView: {
    ...theme.pressableColor,
    padding: 2,
    borderRadius: 30,
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    ...theme.borderColorInput,
  },
  unitsView: {
    marginBottom: 15,
    marginVertical: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  textUnitsAvailable: {
    ...theme.textTitle,
    fontSize: 30,
  },
  aggView: {},
  newValueView: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  pressablesStyle: {
    ...theme.pressable,
    width: "auto",
  },
  pressablesCancelStyle: {
    ...theme.pressableCancel,
    width: "auto",
    marginVertical: 5,
    borderRadius: 10,
    padding: 10,
    flexDirection: "column",
    alignItems: "center",
  },
});
