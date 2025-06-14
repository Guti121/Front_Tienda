import { FlatList, Pressable } from "react-native-gesture-handler";

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import theme, { height } from "../themeStyles/theme";
import { iconCalendar } from "../icons/icons";
import { ModalCalendar } from "../themeStyles/modalsCalendar";
import { expiredGetToken } from "../axios/generalAxiosRequest";
import { router, useFocusEffect } from "expo-router";
import { handleFilterBillsRequest } from "./axiosReques";
import { useUserCAWAuthRedirect } from "../../redux/viewsPermissions";
import { useSelector } from "react-redux";

export default function BillsGenerate() {
  const [inputValue, setInputValue] = useState("");
  //hook modal calendar
  const [stateCalentar, setStateCalendar] = useState(false);
  const [selectedData, setSelectedData] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [bills, setBills] = useState();

  const [error, setError] = useState(false);

  const closeCalendar = (data) => {
    setSelectedData(data);
    setStateCalendar(false);
  };

  useFocusEffect(
    useCallback(() => {
      handleFilterBills();

      return setError(false);
    }, [selectedData]),
  );

  const handleFilterBills = async (number) => {
    const token = await expiredGetToken();

    try {
      if (number) {
        const request = await handleFilterBillsRequest({
          token,
          selectedData: false,
          number: inputValue,
        });
        setBills({ facturas: [request.data] });
        console.log(bills);
        setError(false);
      } else {
        const request = await handleFilterBillsRequest({
          token,
          selectedData,
        });
        setBills(request.data);
        console.log(bills);

        setError(false);
      }
    } catch (error) {
      setError(
        String(error).length > 30
          ? "Ocurrió un error inesperado. Inténtalo de nuevo."
          : String(error), // Convertir a string en caso de que sea un objeto o número
      );
    }
  };

  const detailBills = (index) => {
    console.log(index);
    router.push(`/billsGenerate/billsGenerateDetailDrawer?value=${index}`);
  };
  return (
    <SafeAreaView style={{ flex: 1, ...theme.backgroundColorPrincipal }}>
      <View style={styles.containerHeader}>
        <Text style={styles.textHeader}>Mis Facturas {selectedData}</Text>

        <View style={styles.containerInputandIcon}>
          <TextInput
            style={styles.textInputStyles}
            value={inputValue}
            onChangeText={(text) => {
              setInputValue(parseInt(text) || "");
              !parseInt(text) && setError("Error tipo de dato");
            }}
            onBlur={() => {
              handleFilterBills(true);
            }}
            returnKeyType="done"
            placeholder="Ingrese Número de factura"
            keyboardType="numeric"
          />
          <Pressable
            onPressOut={() => setStateCalendar(true)}
            style={styles.iconPressableCalendar}
          >
            {iconCalendar({ size: 30, color: "black" })}
          </Pressable>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.containerCountsBills}
        >
          <Text style={styles.textCountsBills}>
            Número de facturas: <Text>{bills?.numero_de_facturas || 0}</Text>
          </Text>
          <Text style={styles.textCountsBills}>
            Total productos:
            <Text>{bills?.total_cantidad_de_procuctos || 0}</Text>
          </Text>
          <Text style={styles.textCountsBills}>
            Total Facturas: <Text>{bills?.total_facturas || 0}</Text>
          </Text>
        </ScrollView>

        {error && (
          <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        )}

        <FlatList
          style={{ height: "90%" }}
          data={bills?.facturas || []}
          renderItem={({ item }) => {
              const fechaObjeto = new Date(item.fecha);
              const fecha = fechaObjeto.toISOString().split("T")[0]; // "2025-02-10"
              const hora = fechaObjeto.toTimeString().split(" ")[0]; // "22:22:52"
            return(
            <Pressable
              onPress={() => {
                detailBills(item.id);
              }}
              style={styles.containerPressableFlatlist}
            >
              <View style={styles.containerDetails}>
                <View style={styles.containerId}>
                  <Text style={{ ...theme.textNames }}>#:{item.id}</Text>
                </View>
                <Text style={styles.textFlatlist}>Fecha</Text>
                <Text>{fecha}</Text>
                <Text>{hora}</Text>
              </View>
              <View style={styles.containerDetails}>
                <Text style={styles.textFlatlist}>Total</Text>
                <Text
                  style={[styles.textFlatlist, { color: "rgb(60, 196, 60)" }]}
                >
                  {item.total_cop}
                </Text>
              </View>
            </Pressable>
          )}}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      <ModalCalendar state={stateCalentar} onClose={closeCalendar} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  containerHeader: {
    borderBottomWidth: 1,
    margin: 5,
    paddingBottom: 10,
    ...theme.borderColorInput,
  },
  textHeader: {
    ...theme.textTitle,
    marginBottom: 10,
  },
  containerInputandIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  textInputStyles: {
    ...theme.textInputGlobal,
    height: 40,
    flex: 1,
    marginRight: 10,
  },
  iconPressableCalendar: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  containerCountsBills: {
    flexDirection: "row",
    backgroundColor: "black",
  },
  textCountsBills: {
    ...theme.textNames,
    color: "white",
    margin: 10,
  },
  containerPressableFlatlist: {
    ...theme.shadow,
    ...theme.backgroundColorPrincipal,
    borderRadius: 20,
    margin: 10,
    padding: 15,
    minHeight: 150,
  },
  containerDetails: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  textFlatlist: {
    ...theme.textTitle,
  },
  containerId: {
    width: "100%",
    alignItems: "flex-end",
  },
});
