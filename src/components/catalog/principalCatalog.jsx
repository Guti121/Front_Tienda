import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { catalogRequest, companyInfoRequest, typeProductRequest } from "./axiosRequest";
import { useEffect, useRef, useState } from "react";
import { CompanyInfoRequest } from "./infCompany";
import { pesosFormat } from "../icons/functionFormat";
import ProductTypeFilter from "./componentsPrincipalView/filterPView";
import { iconCar } from "../icons/icons";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import { setEmpresa } from "../../redux/userSlice";
import { showSessionAlert } from "../themeStyles/alerts";

export default function PrincipalCatalog({ name }) {
  const [catalogData, setCatalogData] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const { width } = useWindowDimensions();
  const [showTypes, setShowTypes] = useState(false);
  const [productTypes, setProductTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const flatListRef = useRef(null);
  const [nextPage, setNextPage] = useState(null);
  const [nextPageType, setNextPageType] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const dispatch = useDispatch(); // Asegúrate de importar useDispatch desde react-redux


  const requestCompanyInfo = async (name) => {
    try {
      const response = await companyInfoRequest(name);
      setCompanyInfo(response.data);
      dispatch(setEmpresa(response.data)); // Guarda la info de la empresa en el estado global
    } catch (error) {
      console.error("Error fetching company info:", error);
    }
  };

    const requestCatalog = async (nameParam, tipoId = null, reset = false, nextUrl = null) => {
    try {
        const response = nextUrl
        ? await fetch(nextUrl)
        : await catalogRequest(nameParam, tipoId);

        const data = await response.json?.() || response.data;
        const products = reset ? data.results : [...(catalogData || []), ...data.results];
        setCatalogData(products);
        setNextPage(data.next);
    } catch{
    }
    };


    const handleLoadMore = async () => {
    if (nextPage && !loadingMore) {
        setLoadingMore(true);
        await requestCatalog(name, selectedType, false, nextPage);
        setLoadingMore(false);
    }
    };


  const requestProductTypes = async (reset=false,nextPageType=null) => {
    try {   
        const response = await typeProductRequest(name, nextPageType);
        const productsTypes = reset
            ? response.results
            : [...(productTypes || []), ...response.data.results];
            setProductTypes(productsTypes); // Elimina duplicados
            setNextPageType(response.data.next)
            setShowTypes(true);

    }   
    catch (error) {
        console.error("Error fetching product types:", error); 
    }
    };
    const handleLoadMoreType = async () => {
    if (nextPageType) {
        await requestProductTypes(false, nextPageType);
    }
    };


    useEffect(() => {
        setCatalogData([]); // Limpia si cambian props
        setSelectedType(null);
        requestCatalog(name, null, true);
        requestCompanyInfo(name);
    }, [name]);


  // Número de columnas dinámico en web
  const numColumns = width > 900 ? 4 : width > 600 ? 3 : 2;

  // Función para determinar si un producto es reciente
  const esProductoReciente = (fechaCreacion) => {
    const creado = new Date(fechaCreacion);
    const ahora = new Date();
    const diferenciaMs = ahora - creado;
    const diasPasados = diferenciaMs / (1000 * 60 * 60 * 24);
    return diasPasados <= 15; // Puedo cambiar 3 por la cantidad de días que consideres "reciente"
    };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
    <View
        key="sticky-filter"
        style={{
        backgroundColor: "#121212",
        zIndex: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
        }}
    >
        <ProductTypeFilter
        logoUri={companyInfo?.url_logo || null}
        showTypes={showTypes}
        setShowTypes={(value)=>{!value ?(setShowTypes(false),setProductTypes([])):setShowTypes(true)}}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        productTypes={productTypes}
        onFetchTypes={requestProductTypes}
        onFilterChange={(tipoId) => {
            requestCatalog(name, tipoId, true, null);
        }}
        onLoadMoreType={handleLoadMoreType} 
        />
    </View>
    <FlatList
    ref={flatListRef}
    style={styles.containerFlatlist}
    contentContainerStyle={{ paddingBottom: 100 }}
    numColumns={numColumns}
    data={catalogData}
    key={numColumns}
    keyExtractor={(item) => item.id.toString()}
    ListEmptyComponent={() => (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <Text style={{ color: "#fff" }}>No hay productos disponibles</Text>
            </View>
        )}
    ListHeaderComponent={() => (
    // Índice 0: Info empresa (no sticky)
    <View key="header-info" style={{ padding: 20 }}>
        <CompanyInfoRequest info={companyInfo} />
    </View>  
    )}
    // Esto hace que el segundo hijo del header (índice 1) sea sticky
    stickyHeaderHiddenOnScroll={true}
    showsVerticalScrollIndicator={false}

    renderItem={({ item }) => {
        const imageUri = item?.image_principal?.trim()
        ? item.image_principal
        : "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

        const esReciente = esProductoReciente(item.creado_en);

        return (
        <Pressable
            style={[
            styles.containerProduct,
            { width: `${100 / numColumns - 4}%` },
            ]}
            onPress={() => {
            router.push({
                pathname: "/catalog/productDetail",
                params: { id: item.id, name: name },
            });
            }}
        >
            <Image
            source={{ uri: imageUri }}
            style={styles.productImage}
            resizeMode="cover"
            />

            {esReciente && (
                <View style={styles.etiquetaNuevo}>
                    <Text style={styles.textoEtiqueta}>Nuevo</Text>
                </View>
            )}

            <View style={styles.containerText}>
            <Text numberOfLines={1} style={styles.textProductsTitle}>
                {item.nombre}
            </Text>
            <Text style={styles.textProducts}>
                {pesosFormat(item.valor)}
            </Text>
            </View>

            <Text style={styles.productCode}>#{item.numero_producto}</Text>
        </Pressable>
        );
    }}
        ListFooterComponent={() => loadingMore && (
            <ActivityIndicator size="large" color="#5e5ce6" style={{ marginVertical: 20 }} />
            )}
        onEndReached={handleLoadMore} // Detecta el final del scroll
        onEndReachedThreshold={0.5} // Umbral para disparar la carga de más datos
    />

    <Pressable
        onPress={() => router.push("/catalog/car")}
        style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            backgroundColor: "#5e5ce6",
            padding: 12,
            borderRadius: 30,
            elevation: 8,
        }}
        >
        {iconCar({ size: 26, color: "#fff" })}
    </Pressable>

</SafeAreaView>

  );
}

const styles = StyleSheet.create({
  containerFlatlist: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: "#121212",
  },

  containerProduct: {
    backgroundColor: "#2c2c2e",
    borderRadius: 12,
    margin: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  productImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },

  containerText: {
    width: "100%",
  },

  textProductsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },

  textProducts: {
    fontSize: 14,
    color: "#cccccc",
  },

  productCode: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
  },
  etiquetaNuevo: {
  position: 'absolute',
  top: 5,
  left: 5,
  backgroundColor: '#5e5ce6',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 5,
  zIndex: 1,
},

textoEtiqueta: {
  color: 'white',
  fontSize: 15,
  fontWeight: 'bold',
},

});
