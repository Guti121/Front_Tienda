import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import Storage from "../token/localstorage";

const KEY = "cartItems";
const noop = () => {};

// Valor por defecto: `useCart()` nunca devuelve undefined aunque el componente
// quede fuera de un <CartProvider>.
const CartContext = createContext({
  cartItems: [],
  addToCart: noop,
  removeFromCart: noop,
  clearCart: noop,
});

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [ready, setReady] = useState(false);

  // Carga inicial desde el storage.
  useEffect(() => {
    (async () => {
      try {
        const saved = await Storage.getItem(KEY);
        const parsed = typeof saved === "string" ? JSON.parse(saved) : saved;
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCartItems([]);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Persiste cada cambio (solo tras la carga inicial, para no pisar con []).
  useEffect(() => {
    if (!ready) return;
    Storage.setItem(KEY, JSON.stringify(cartItems)).catch(() => {});
  }, [cartItems, ready]);

  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const found = prev.find((it) => it.id === product.id);
      if (found) {
        return prev.map((it) =>
          it.id === product.id
            ? { ...it, cantidad: it.cantidad + (product.cantidad || 1) }
            : it,
        );
      }
      return [...prev, { ...product, cantidad: product.cantidad || 1 }];
    });
  }, []);

  const removeFromCart = useCallback(
    (productId) =>
      setCartItems((prev) => prev.filter((it) => it.id !== productId)),
    [],
  );

  const clearCart = useCallback(() => setCartItems([]), []);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
