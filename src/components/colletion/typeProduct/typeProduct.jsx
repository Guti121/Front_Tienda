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
import { handleDeleteTypeProduct, handleTypeProductFilter } from "../axiosRequest";
import { pesosFormat } from "../../icons/functionFormat";
import { iconDelete, iconFilter, iconPlusAgg } from "../../icons/icons";
import { useRoute } from "@react-navigation/native";
import { ModalConfirm } from "../../icons/modalConfirm";

// Esta vista lista los tipos de productos en el drawer ProductsDrawer
export default function TypeProductView() {
  const [listProducts, setListProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [nextPage, setNextPage] = useState(null);
  const debounceTimeoutRef = useRef(null);
  //hooks error
  const [error, setError] = useState(false);
  //hooks filter
  const route = useRoute();
  //hooks modalConfirm
  const [modalConfirm, setModalConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // Guarda el item a eliminar
  //iconFilter
  const [stylePressableIconFilster, setStylePressableIconFilter] =useState(false);



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
    await fetchProducts(filterText, null, true);
  };


  //Consulta de type products
  const fetchProducts = async (filterText, currentPage, reset = false) => {
    try {
      const token = await expiredGetToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      
      const response = await handleTypeProductFilter(
        {value:filterText,
        url:currentPage,
        token:token}

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

  //delete typroduct
  const deleteTypeProduct= async(id)=>{
    try {
      const token = await expiredGetToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      let request = await handleDeleteTypeProduct(token,id)
      // Recargar productos después de eliminar
      setSearchText("");
      setListProducts([]);
      setNextPage(null)
      await fetchProducts ("",null,true)

   
    }catch(error){
    }
  }

 //use Effect 
  useFocusEffect(
    useCallback(() => {
      // Reiniciar estados al obtener el foco
      setSearchText("");
      setListProducts([]);
      setNextPage(null)
      // Llamar al API con los valores iniciales
      fetchProducts();

      // Cleanup function para cuando el componente pierde el foco
      return () => {
        setSearchText("");
        setListProducts([]);
        setNextPage(null)
        setError(false);
      };
    },[]),
  );



  //Modal confirm
  const confirmDelete = (item) => {
    setSelectedProduct(item);
    setModalConfirm(true);
  };

  const handleDeleteConfirmed = () => {
    if (selectedProduct) {
      deleteTypeProduct(selectedProduct);
      setSelectedProduct(null);
      setModalConfirm(false);
    }
  };
//-----------------------------------------------------------------------

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
            <View style={styles.viewContainerFlatlist}>
              <View style={styles.viewDetailsFlatlist}>
                <Text  numberOfLines={2} ellipsizeMode="tail"
                style={{ ...theme.textTitle, height:'100%' }}>{item.tipo_producto}</Text>
              </View>
                 <Pressable style={{padding:10}} onPress={()=>confirmDelete(item.id)}> 
                  {iconDelete("red")}
                  </Pressable> 
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={handleLoadMore} // Detecta el final del scroll
          onEndReachedThreshold={0.5} // Umbral para disparar la carga de más datos
        />
        <ModalConfirm 
            state={modalConfirm}
            message="¿Deseas eliminar este tipo de producto?"
            handleIPositiveButton={handleDeleteConfirmed}
            onClose={() => setModalConfirm(false)}
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
  textHeader: { ...theme.textTitle, },
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
    alignItems:'center',
    ...theme.shadow
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
    borderBottomWidth: 1,
    padding:10,

    width:"90%",
    ...theme.borderColorInput,
    flex: 1,
  },
  textDetails: {
    textTransform: "capitalize",
    width:'100%'
  },
  inputTextStyle: {
    ...theme.textInputGlobal,
    height: 30,
    width: width * 0.8,
    padding: 5, // Centra el texto dentro del TextInput
    textTransform: "capitalize",
  },
});
