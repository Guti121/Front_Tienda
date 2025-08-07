import React, { createContext, useContext, useEffect, useState } from 'react';
import Storage from '../token/localstorage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const loadCart = async () => {
      const saved = await Storage.getItem("cartItems");
      
      try {
        const parsed = typeof saved === "string" ? JSON.parse(saved) : saved;
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error("Error parsing cartItems:", e);
        setCartItems([]);
      }
    };

    loadCart();
  }, []);



  // Guardar carrito cada vez que cambia
  useEffect(() => {
     Storage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + (product.cantidad || 1) }
            : item
        );
      } else {
        return [...prev, { ...product, cantidad: product.cantidad || 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
