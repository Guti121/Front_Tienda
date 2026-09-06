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
import { FilterToggleButton, FilterSidebar } from "./componentsPrincipalView/filterPView";
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
            ? response.data.results
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
    {/* Header fijo: solo el botón hamburguesa + logo, ocupa todo el ancho */}
    <View
        key="sticky-filter"
        style={{
        backgroundColor: "#ffffff",
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        }}
    >
        <FilterToggleButton
        logoUri={companyInfo?.url_logo || null}
        showTypes={showTypes}
        setShowTypes={setShowTypes}
        selectedType={selectedType}
        productTypes={productTypes}
        onFetchTypes={requestProductTypes}
        />
    </View>

    {/* Contenedor en fila: panel lateral + catálogo, verdaderos hermanos */}
    <View style={{ flex: 1, flexDirection: "row" }}>
        <FilterSidebar
        showTypes={showTypes}
        setShowTypes={setShowTypes}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        productTypes={productTypes}
        onFilterChange={(tipoId) => {
            requestCatalog(name, tipoId, true, null);
        }}
        onLoadMoreType={handleLoadMoreType}
        />

        <FlatList
        ref={flatListRef}
        style={[styles.containerFlatlist, { flex: 1 }]}
        contentContainerStyle={{ paddingBottom: 100 }}
        numColumns={numColumns}
        data={catalogData}
        key={numColumns}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                <Text style={{ color: "#444" }}>No hay productos disponibles</Text>
                </View>
            )}
        ListHeaderComponent={() => (
        // Índice 0: Info empresa (no sticky)
        <View key="header-info" style={{ padding: 20 }}>
            <CompanyInfoRequest info={companyInfo} />
        </View>  
        )}
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
    </View>

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
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
  },

  containerProduct: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    margin: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
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
    color: "#222222",
    marginBottom: 4,
  },

  textProducts: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5e5ce6", // Highlight brand color for price
  },

  productCode: {
    fontSize: 12,
    color: "#888888",
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
