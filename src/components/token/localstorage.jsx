/* global localStorage */
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const isWeb = Platform.OS === "web";

// Wrapper de storage clave->valor (string). Web: localStorage. Móvil: SecureStore.
// La lógica de sesión (tokens, usuario, expiración) vive en src/auth/session.js.
export const Storage = {
  setItem: async (key, value) => {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error("Storage.setItem", key, e);
    }
  },

  getItem: async (key) => {
    if (isWeb) return localStorage.getItem(key);
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error("Storage.getItem", key, e);
      return null;
    }
  },

  removeItem: async (key) => {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error("Storage.removeItem", key, e);
    }
  },
};

export default Storage;
// `save(...)` se movió a src/auth/session.js como `saveSession`.
