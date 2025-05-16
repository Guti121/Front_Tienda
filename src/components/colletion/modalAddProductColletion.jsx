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
import { Link, useFocusEffect } from "expo-router";

function ModalTypeProduct({ state, itemPressed, close }) {
  const [stateModal, setStateModal] = useState(state);
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga
  const [stateBottomCancel, setStateBottomCancel] = useState(false);
  // Paginación
  const [products, setProducts] = useState([]); // Datos acumulados
  const [page, setPage] = useState(1); // Página actual
  const [hasNextPage, setHasNextPage] = useState(true); // Control de fin de datos
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log("useEffect activado");
      setStateModal(state);

      if (state) {
        setHasNextPage(true);
        console.log("Reseteando productos y paginación...");
        setProducts([]);
        fetchData(1); // Solo cuando el modal está abierto y se reinicia la paginación

        setPage(1); // Se activará el useEffect que llama a fetchData
      }
      return () => {
        console.log("useEffect desactivado");
        setHasNextPage(true);
      };
    }, [state]),
  ); // Asegúrate de incluir dependencias relevantes

  const fetchData = async (page) => {
    if (loading || !hasNextPage) return; // Prevenir múltiples llamadas
    setLoading(true);

    try {
      const token = await expiredGetToken();
      console.log("token", token);
      console.log("páge", page);
      const response = await handleTypeProduct(token, page); // Función que soporta paginación
      console.log(response, "response");
      if (response.data.results) {
        setProducts((prev) => [...prev, ...response.data.results]);
        setHasNextPage(!!response.data.next); // Revisar si hay más páginas
      }
    } catch (error) {
      console.log("Error fetching data:", error);
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
    if (hasNextPage && !loading) {
      console.log("este es el valor de set Page", page);
      setPage((prev) => {
        const nextPage = prev + 1;
        fetchData(nextPage); // Llamar a fetchData con la página actualizada
        return nextPage;
      });
    }
  };

  return (
    <Modal transparent={true} animationType="fade" visible={stateModal}>
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
                  <View style={{borderWidth:1}}>
                  <Text style={{ textAlign: "center", marginVertical: 20 }}>
                    No hay productos disponibles.
                  </Text>
                  <Link href="/myStoreSettings/costsMyStoreDrawer">Configurar Costos</Link>;
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
                console.log(products);
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
