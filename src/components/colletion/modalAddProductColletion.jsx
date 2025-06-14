import React, { useState, useCallback } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  Modal,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { handleTypeProduct } from "./axiosRequest";
import { expiredGetToken } from "../axios/generalAxiosRequest";
import theme, { height, width } from "../themeStyles/theme";
import { Link, router, useFocusEffect } from "expo-router";

function ModalTypeProduct({ state, itemPressed, close }) {
  const [stateModal, setStateModal] = useState(state);
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga
  const [stateBottomCancel, setStateBottomCancel] = useState(false);
  // Paginación
  const [products, setProducts] = useState([]); // Datos acumulados
  const [nextPage, setNextPage] = useState(null); // Control de fin de datos
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setStateModal(state);

      if (state) {
        setNextPage(null);
        setProducts([]);
        fetchData(); // Solo cuando el modal está abierto y se reinicia la paginación

      }
      return () => {
        setNextPage(null);
      };
    }, [state]),
  ); // Asegúrate de incluir dependencias relevantes

  const fetchData = async (nextPage) => {
    if (loading) return; // Prevenir múltiples llamadas
    setLoading(true);

    try {
      const token = await expiredGetToken();
      const response = await handleTypeProduct(token, nextPage); // Función que soporta paginación
      if (response.data.results) {
        setProducts((prev) => [...prev, ...response.data.results]);
        setNextPage(response.data.next); // Revisar si hay más páginas
      }
      
    } catch (error) {
      setError(
        String(error).length > 30
          ? "Ocurrió un error inesperado. Inténtalo de nuevo."
          : String(error), // Convertir a string en caso de que sea un objeto o número
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEndReached = () => {
    // Controla que solo se carguen más productos si hay más páginas y no está en carga
    if (nextPage && !loading) {
      fetchData(nextPage); // Llamar a fetchData con la página actualiza
    }
  };

  return (
    <Modal transparent={true} animationType="fade" visible={state}>
      <TouchableWithoutFeedback onPressOut={() => close()}>
        <View style={styles.modalcontainerPrincipal}>
          <View style={styles.modalViewPrincipalContainer}>
            <View style={styles.modalHeaderContainer}>
              <Text style={styles.modalTextHeader}>Tipo de Productos</Text>
            </View>

            <FlatList
              data={products}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalFlatlistView}
                  onPress={() => {
                    itemPressed(item);
                  }}
                >
                  <Text style={styles.modalFlatlistText}>
                    {item.tipo_producto}
                  </Text>
                </Pressable>
              )}
              keyExtractor={(item) => item.id.toString()}
              onEndReached={() => handleEndReached()}
              onEndReachedThreshold={0.9}
              ListFooterComponent={
                loading ? (
                  <ActivityIndicator size="small" color="black" />
                ) : null
              }
              ListEmptyComponent={() =>
                !loading && (
                  <View style={{ margin: 5 }}>
                    <Text style={{ textAlign: "center", marginVertical: 20 }}>
                      No hay productos disponibles.
                    </Text>
                    <Pressable
                      onPress={() => {
                        close()
                        router.push("/products/addTypeProductDrawer");
                      }}
                    >
                      <Text style={{ color: "blue", textAlign: "center" }}>
                        Crear tipo de productos
                      </Text>
                    </Pressable>
                  </View>
                )
              }
              scrollEnabled={true}
              contentContainerStyle={{
                flexGrow: 2, // Esto asegura que ocupa el espacio disponible
                justifyContent: products.length === 0 ? "center" : "flex-start",
              }}
            />
            {error && <Text style={{ color: "red" }}>{String(error)}</Text>}
            <Pressable
              onPressIn={() => {
                setStateBottomCancel(true);
              }}
              onPressOut={() => {
                close();
                setStateBottomCancel(false);
              }}
              style={
                stateBottomCancel
                  ? styles.modalPressedClose
                  : styles.modalPressableClose
              }
            >
              <Text
                style={
                  stateBottomCancel ? { color: "white" } : { color: "red" }
                }
              >
                Cerrar
              </Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// Estilos básicos
const styles = StyleSheet.create({
  //Modal Styles
  modalcontainerPrincipal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalViewPrincipalContainer: {
    ...theme.backgroundColorPrincipal,
    maxWidth: width * 0.8,
    minWidth: width * 0.5,
    height: height * 0.5,
    borderRadius: 10,
  },
  modalHeaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderBottomWidth: 1,
    borderColor: "#d0d0d0",
  },
  modalTextHeader: {
    ...theme.textTitle,
  },
  modalFlatlistView: {
    margin: 5,
    padding: 2,
    height: 40,
    justifyContent: "center",
    borderColor: "#d0d0d0",
    borderWidth: 1,
    borderRadius: 10,
  },
  modalFlatlistText: { textTransform: "capitalize" },
  modalPressableClose: {
    ...theme.pressableCancel,
    padding: 10,
  },
  modalPressedClose: {
    ...theme.pressedCancel,
    padding: 10,
  },
});

export default ModalTypeProduct;
