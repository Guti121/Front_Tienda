import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import { useCart } from '../../src/components/catalog/CartContext';
import { pesosFormat } from '../../src/components/icons/functionFormat';
import AnimatedButton from '../../src/components/catalog/stylesCatalogo/buttonAnimate';
import { Linking } from 'react-native';
import { useSelector } from 'react-redux';
import { isWeb } from '../../src/components/token/localstorage';
import { router } from 'expo-router';



export default function CartScreen() {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const empresa = useSelector((state) => state.user.empresa);
  const total = cartItems.reduce(
    (sum, item) => sum + item.valor * item.cantidad,
    0
  );
  
  const sendCartToWhatsApp = () => {
    if (cartItems.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    let message = "Hola, quisiera realizar el siguiente pedido:\n🛒 *Mi pedido:* \n\n";

    cartItems.forEach(item => {
      message += `• ${item.numero_producto} ${item.nombre} x${item.cantidad}/und = ${pesosFormat(item.valor * item.cantidad)}\n`;
    });

    message += `\n🔢 *Total:* ${pesosFormat(cartItems.reduce((sum, item) => sum + item.valor * item.cantidad, 0))}\n`;

    const phoneNumber = "57"+empresa.phone; // ← Reemplaza por tu número de WhatsApp (con código de país, sin +)
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    if (isWeb){
      window.open(url);

    }else{

      Linking.openURL(url)
      .then()
      .catch(() => alert("No se pudo abrir WhatsApp"));
    }
  };


  return (
    <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, padding: 20 }}>
                <Text style={styles.title}>Tu carrito</Text>

                <FlatList
                    data={cartItems}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={
                    <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
                    }
                    renderItem={({ item }) => {
                    const imageUri = item?.imagenes[0]?.imagen?.trim()
                        ? item.imagenes[0]?.imagen
                        : 'https://media-stockapp03042025.s3.us-east-2.amazonaws.com/productos/logo-muestra.png';
                    return (
                        <Pressable onPress={ ()=>{router.push({
                                        pathname: "/catalog/productDetail",
                                        params: { id: item.id, name: empresa.name },
                                    }
                                  );}}style={styles.itemContainer}>
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />

                        <View style={styles.textContainer}>
                            <Text style={styles.itemText}>
                            {item.nombre} x{item.cantidad}
                            </Text>
                            <Text style={styles.priceText}>
                            {pesosFormat(item.valor * item.cantidad)}
                            </Text>

                            <AnimatedButton
                                onPress={() => removeFromCart(item.id)}
                                title="Quitar"
                                style={styles.removeButton}
                                textStyle={styles.removeButtonText}
                                />

                        </View>
                        </Pressable>
                    );
                    }}
                />

                <Text style={styles.totalText}>Total: {pesosFormat(total)}</Text>

                {cartItems.length > 0 && (
                    <AnimatedButton
                        onPress={clearCart}
                        title="Vaciar carrito"
                        style={styles.removeButton}
                        textStyle={styles.removeButtonText}
                        />
                    ,
                    <AnimatedButton
                            onPress={sendCartToWhatsApp}
                            title="Enviar pedido"
                            style={styles.clearButton}
                            textStyle={styles.clearButtonText}
                            />
                )}
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  emptyText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#2c2c2e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 15,
    color: '#ccc',
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: '#ff4d4f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20,
    textAlign: 'right',
  },
  clearButton: {
    backgroundColor: '#5e5ce6',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
