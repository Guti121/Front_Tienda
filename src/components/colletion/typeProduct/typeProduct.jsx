import {
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import theme, { height, width } from "../../themeStyles/theme";
import { useCallback, useEffect, useRef, useState } from "react";
import { expiredGetToken } from "../../axios/generalAxiosRequest";
import { router, useFocusEffect } from "expo-router";
import { handleTypeProductFilter } from "../axiosRequest";
import { pesosFormat } from "../../icons/functionFormat";
import { iconFilter, iconPlusAgg } from "../../icons/icons";
import { useRoute } from "@react-navigation/native";

// Esta vista lista los tipos de productos en el drawer ProductsDrawer
export default function TypeProductView() {
  const [listProducts, setListProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debounceTimeoutRef = useRef(null);
  //hooks error
  const [error, setError] = useState(false);
  //hooks filter
  const route = useRoute();
  //Pressables

  //iconFilter
  const [stylePressableIconFilster, setStylePressableIconFilter] =
    useState(false);

  const handleChangeText = (text) => {
    setSearchText(text);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      resetAndFetchProducts(text);
    }, 500);
  };

  const resetAndFetchProducts = async (filterText) => {
    setPage(1);
    setHasMore(true);
    await fetchProducts(filterText, 1, true);
  };

  const fetchProducts = async (filterText, currentPage, reset = false) => {
    try {
      const token = await expiredGetToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      console.log("este es el token", token);
      const response = await handleTypeProductFilter(
        filterText,
        token,
        currentPage,
      );
      console.log(response, "response.data");
      if (response?.results?.length === 0) {
        setError("No hay resultados disponibles");
      }

      const products = reset
        ? response.results
        : [...listProducts, ...response.results];
      setListProducts(products);
      setHasMore(!!response.next); // Si `response.next` no es null, hay más páginas
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setError(
        String(error).length > 100
          ? "Ocurrió un error inesperado. Inténtalo de nuevo."
          : String(error), // Convertir a string en caso de que sea un objeto o número
      );
    }
  };

  const handleLoadMore = () => {
    if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(searchText, nextPage);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Reiniciar estados al obtener el foco
      setSearchText("");
      setListProducts([]);
      setPage(1);
      setHasMore(true);

      // Llamar al API con los valores iniciales
      fetchProducts("", 1);

      // Cleanup function para cuando el componente pierde el foco
      return () => {
        setSearchText("");
        setListProducts([]);
        setPage(1);
        setHasMore(true);
        setError(false);
      };
    }, []),
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.viewHeaderContainer}>
        <Text style={styles.textHeader}>Tipo de Productos</Text>
        <View style={styles.viewFilter}>
          <TextInput
            placeholder="Buscar Tipo de Producto"
            value={searchText}
            onChangeText={(text) => {
              setError(false);
              handleChangeText(text);
            }}
            style={styles.inputTextStyle}
          />
          <Pressable
            onPressIn={() => {
              setStylePressableIconFilter(true);
            }}
            onPressOut={() => {
              setStylePressableIconFilter(false),
                router.push("modals/modalAddTypeProductDrawer");
            }}
          >
            {iconPlusAgg({
              color: stylePressableIconFilster && "#d0d0d0",
            })}
          </Pressable>
        </View>
        {error && <Text style={{ color: "red" }}>{error}</Text>}
      </View>
      <View style={styles.viewBody}>
        <FlatList
          data={listProducts}
          renderItem={({ item }) => (
            <Pressable style={styles.viewContainerFlatlist}>
              <Text style={styles.textDetails}>Tipo de producto</Text>
              <View style={styles.viewDetailsFlatlist}>
                <Text style={{ ...theme.textTitle }}>{item.tipo_producto}</Text>
              </View>
            </Pressable>
          )}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={handleLoadMore} // Detecta el final del scroll
          onEndReachedThreshold={0.5} // Umbral para disparar la carga de más datos
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewHeaderContainer: {
    alignItems: "center",
    justifyContent: "center",

    borderBottomWidth: 1,
    ...theme.borderColorInput,
    padding: 5,
    marginHorizontal: 10, // Ajuste en márgenes
  },
  viewFilter: {
    justifyContent: "center",
    alignItems: "center",
    height: 35,
    padding: 2,
    width: width * 0.9,
    flexDirection: "row",
  },
  textHeader: { ...theme.textTitle },
  viewBody: {
    flex: 1, // Permitir que el cuerpo ocupe el espacio restante
    marginHorizontal: 10,
  },
  //flatlist styles
  viewContainerFlatlist: {
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 10,
    ...theme.borderColorInput,
    padding: 2,
    margin: 5,
  },
  nameItemText: {
    ...theme.textTitle,
    textTransform: "capitalize",
  },
  viewBodyContainerFlatlist: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  viewDetailsFlatlist: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    ...theme.borderColorInput,
    flex: 1,
  },
  textDetails: {
    textTransform: "capitalize",
  },
  inputTextStyle: {
    ...theme.textInputGlobal,
    height: 30,
    width: width * 0.8,
    padding: 5, // Centra el texto dentro del TextInput
    textTransform: "capitalize",
  },
});
