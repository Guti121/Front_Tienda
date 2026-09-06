// Carrito de facturación. Estado en el storage local bajo la clave "arrayCar"
// (misma clave y forma de item que antes, para no romper modalBarCode.jsx):
//   { producto: <id>, nombrePro: <string>, cantidad: <n>, valorPro: <number> }
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";

import Storage from "../components/token/localstorage";

const KEY = "arrayCar";

export async function readCart() {
  try {
    const raw = await Storage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function writeCart(items) {
  await Storage.setItem(KEY, JSON.stringify(items));
}

// Agrega (o suma cantidad si el producto ya está en el carrito).
export async function addToCart(
  { producto, nombrePro, valorPro },
  cantidad = 1,
) {
  const items = await readCart();
  const i = items.findIndex((it) => it.producto === producto);
  if (i >= 0) {
    items[i] = { ...items[i], cantidad: items[i].cantidad + cantidad };
  } else {
    items.push({ producto, nombrePro, valorPro, cantidad });
  }
  await writeCart(items);
  return items;
}

export const cartCount = (items) =>
  items.reduce((acc, it) => acc + it.cantidad, 0);

export const cartTotal = (items) =>
  items.reduce((acc, it) => acc + it.cantidad * Number(it.valorPro || 0), 0);

export function useCart() {
  const [items, setItems] = useState([]);

  const reload = useCallback(async () => {
    setItems(await readCart());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Al volver a enfocar la pantalla (p. ej. tras escanear un código) se recarga.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const persist = useCallback(async (next) => {
    setItems(next);
    await writeCart(next);
  }, []);

  const add = useCallback(async (product, qty = 1) => {
    const next = await addToCart(product, qty);
    setItems(next);
  }, []);

  const setQty = useCallback(
    (producto, qty) =>
      persist(
        items.map((it) =>
          it.producto === producto ? { ...it, cantidad: Math.max(1, qty) } : it,
        ),
      ),
    [items, persist],
  );

  const remove = useCallback(
    (producto) => persist(items.filter((it) => it.producto !== producto)),
    [items, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  return {
    items,
    count: cartCount(items),
    total: cartTotal(items),
    reload,
    add,
    setQty,
    remove,
    clear,
  };
}

export default useCart;
