import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
  useWindowDimensions,
  Platform,
} from "react-native";
import { productDetailRequest } from "./axiosRequest";
import { pesosFormat } from "../icons/functionFormat";
import { useCart } from "./CartContext"; // Asegúrate de que la ruta sea correcta
import AnimatedButton from "./stylesCatalogo/buttonAnimate";
import { useSelector } from "react-redux";
import HorizontalImageScroller from "./stylesCatalogo/scrollImages";
import ImageModal from "./stylesCatalogo/modalImage";
import { showSessionAlert } from "../themeStyles/alerts";
import { router } from "expo-router";

export default function DetailProductCatalog({ productId, name }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1); // <- cantidad seleccionada
  const { width } = useWindowDimensions();
  const { addToCart } = useCart(); // Hook del contexto del carrito
  const empresa = useSelector((state) => state.user.empresa);

  const requestProductDetail = async (id) => {
    try {
      const response = await productDetailRequest(name, id);
      setData(response.data);
        
    } catch (error) {
      showSessionAlert('Error','Error al obtener detalles del producto',()=>router.back())
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    requestProductDetail(productId); 
  }, [productId]);


  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#5e5ce6" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#444" }}>
          No se encontró información del producto.
        </Text>
      </View>
    );
  }

  const imageUri = data.image?.trim()
    ? data.image
    : "https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png";

  return (
    <ScrollView style={styles.container}>
      {Array.isArray(data.imagenes) && data.imagenes.length > 0 ? (
  <HorizontalImageScroller
    images={data.imagenes.map((img) => img.imagen)}
    onImagePress={(imgUrl) => {
      setSelectedImage(imgUrl);
    }}
  />
) : (
  <Image
    source={{ uri: imageUri }}
    style={{
      width: "100%",
      maxWidth: 500,
      aspectRatio: 1,
      alignSelf: "center",
    }}
    resizeMode="cover"
  />
)}

      <View style={styles.infoBox}>
        <Text numberOfLines={2} style={styles.name}>{data.nombre}</Text>
        <Text style={styles.price}>{pesosFormat(data.valor)}</Text>
        <Text style={[styles.detail, styles.detailLabel]}>
          Detalles del producto:
        </Text>
        <Text style={styles.detail}>{data.detalles || "No especificado"}</Text>
        <Text style={[styles.detail, styles.detailLabel]}>
          Tipo:
        </Text>
        <Text style={styles.detail}>{data.tipo_producto || "No especificado"}</Text>
        <Text style={styles.detail}>Código: #{data.numero_producto}</Text>

        {/* 🔢 Selector de cantidad */}
        <View style={styles.quantityContainer}>
          <Pressable
            onPress={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </Pressable>
          <Text style={styles.quantityText}>{quantity}</Text>
          <Pressable
            onPress={() => setQuantity((q) => q + 1)}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </Pressable>
        </View>
        {/* 🛒 Botón añadir al carrito */}

      </View>
        <AnimatedButton style={styles.cartButton} title='Agregar a Carrito' onPress={() => {
                                                addToCart({ ...data, cantidad: quantity });
                                                if (Platform.OS === 'web') {
                                                    window.alert('Producto añadido al carrito');
                                                    } else {
                                                    Alert.alert('Éxito', 'Producto añadido al carrito');
                                                    }

                                                }}
            textStyle={styles.cartButtonText}
        />
         <ImageModal
                visible={!!selectedImage} 
                imageUri={selectedImage}
                onClose={() => setSelectedImage(null)}
                />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loader: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    // Left empty or remove if not needed, as styles are now inline
  },
  infoBox: {
    paddingHorizontal: 24,
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingTop: 30,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: "800",
    color: "#5e5ce6",
    marginBottom: 16,
  },
  detail: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555555",
    marginBottom: 6,
  },
  detailLabel: {
    fontWeight: "bold",
    marginTop: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: "#f0f2f5",
    borderRadius: 30,
    padding: 6,
    alignSelf: "flex-start",
  },
  quantityButton: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quantityButtonText: {
    fontSize: 22,
    color: "#5e5ce6",
    fontWeight: "bold",
    lineHeight: 24,
  },
  quantityText: {
    fontSize: 18,
    color: "#333333",
    minWidth: 40,
    textAlign: "center",
    fontWeight: "700",
  },
  cartButton: {
    backgroundColor: "#5e5ce6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: "stretch",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: "#5e5ce6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cartButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
