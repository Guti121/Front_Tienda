import {
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import theme, { width } from "../../themeStyles/theme";
import { useCallback, useEffect, useRef, useState } from "react";
import { expiredGetToken } from "../../axios/generalAxiosRequest";
import { router, useFocusEffect } from "expo-router";
import { handleListProductFilterAdmin } from "../axiosRequest";
import { pesosFormat } from "../../icons/functionFormat";
import { iconFilter } from "../../icons/icons";
import { useRoute } from "@react-navigation/native";

//Vista para Listar los productos

export default function ProductView() {
  const [listProducts, setListProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [nextPage, setNextPage] = useState(null);
  const debounceTimeoutRef = useRef(null);
  //hooks filter
  const route = useRoute();
  const [filter, setFilter] = useState("");
  //hook error
  const [error, setError] = useState(false);
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
    setNextPage(null)
    await fetchProducts(filterText, null, true);
  };

  const fetchProducts = async (filterText,nextPage,reset = false) => {
    try {
      const token = await expiredGetToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await handleListProductFilterAdmin(
        filterText,
        token,
        nextPage,
        filter,
      );
      if (response?.results?.length === 0) {
        setError("No hay resultados disponibles");
      }

      const products = reset
        ? response.results
        : [...listProducts, ...response.results];
      setListProducts(products);
      setNextPage(response.next); // Si `response.next` no es null, hay más páginas
    } catch (error) {
      setError(
        String(error).length > 100
          ? "Ocurrió un error inesperado. Inténtalo de nuevo."
          : String(error), // Convertir a string en caso de que sea un objeto o número
      );
    }
  };

  const handleLoadMore = () => {
    if (nextPage) {
      fetchProducts(searchText, nextPage);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Reiniciar estados al obtener el foco
      setSearchText("");
      setListProducts([]);
      setNextPage(null);

      if (route.params?.returnedValue) {
        setFilter(route.params.returnedValue);
        fetchProducts("", null);
      } else {
        // Llamar al API con los valores iniciales
        fetchProducts("", null);
      }
      // Cleanup function para cuando el componente pierde el foco
      return () => {
        setSearchText("");
        setListProducts([]);
        setNextPage(null);
        setError(false);
      };
    }, [filter]),
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.viewHeaderContainer}>
        <Text style={styles.textHeader}>Almacén de Productos</Text>
        <View style={styles.viewFilter}>
          <TextInput
            placeholder="Buscar Producto"
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
                router.push("modals/modalFilterProductIcon");
            }}
          >
            {iconFilter({
              color: stylePressableIconFilster && "#d0d0d0",
            })}
          </Pressable>
        </View>
        {error && <Text style={{ color: "red" }}>{error}</Text>}
      </View>
      <View style={styles.viewBody}>
        <FlatList
          data={listProducts}
          renderItem={({ item }) => {const imageUri = item?.image?.trim()
              ? item.image
              : "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";
              return(
            <Pressable
              onPress={() => {
                // Navega a la nueva página con el ID como parámetro
                router.push({
                  pathname: "/products/detailProduct",
                  params: { id: item.id },
                });
              }}
              style={
                item.unidades_disponibles != 0
                  ? styles.viewContainerFlatlist
                  : [
                      styles.viewContainerFlatlist,
                      { backgroundColor: "#ffdfd4" },
                    ]
              }
            >
              <Text  numberOfLines={1} style={styles.nameItemText}>{item.nombre}</Text>
              <Image
                source={{ uri:imageUri }}
    
                style={{ width:200, height: 250, resizeMode: "cover"}}
              />
              <View>
                <View style={styles.viewBodyContainerFlatlist}>
                  <View style={styles.viewDetailsFlatlist}>
                    <Text style={styles.textDetails}>valor</Text>
                    <Text style={styles.textItemsprops}>{pesosFormat(item.valor)}</Text>
                  </View>
                  
                  <View style={styles.viewDetailsFlatlist}>
                    <Text style={styles.textDetails}>unidades</Text>
                    <Text style={styles.textItemsprops}>{item.unidades_disponibles}</Text>
                  </View>
                </View>
                <View style={styles.viewDetailsFlatlist}>
                    <Text style={styles.textDetails}>Detalles</Text>
                    <Text
                    numberOfLines={1}
                    style={styles.textItemsprops}
                    >{item.detalles}</Text>
                  </View>
              </View>
              <Text style={{ ...theme.textNames }}>
                #{item.numero_producto}
              </Text>
              {item.unidades_disponibles == 0 && (
                <Text style={{ ...theme.textTitle, color: "red" }}>
                  Agotado
                </Text>
              )}
              
            </Pressable>
          )}}
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
    ...theme.shadow,
    padding: 5,
    margin: 5,
  },
  nameItemText: {
    margin:5,
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
    padding:5,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    ...theme.borderColorInput,
    flex: 1,
  },
  textDetails: {
    textTransform: "capitalize",
    fontSize:15
  },
  textItemsprops:{
    textTransform: "capitalize",
    ...theme.textNames,
    fontSize:15,

  },
  inputTextStyle: {
    ...theme.textInputGlobal,
    height: 30,
    width: width * 0.8,
    padding: 5, // Centra el texto dentro del TextInput
    textTransform: "capitalize",
  },
});
