import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { showSessionAlert } from "../themeStyles/alerts";

export const isWeb = Platform.OS === "web";
const keyUsername = "username";
const keyAccessToken = "token";
const keyRefreshToken = "Refreshtoken";
const keyTokenExpiration = "tokenExpiration";
const keyUser = "user";

//Guardamos lo datos que nos pasa el login en el localstorage y tambien guardamos los datos en redux
export async function save({ access, refresh, username, user }) {

  try {
    // Decode the access token to get the expiration time
    const decodedToken = jwtDecode(access);
    const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
    if (isWeb) {
      await Promise.all([
        localStorage.setItem(keyAccessToken, access),
        localStorage.setItem(keyRefreshToken, refresh),
        localStorage.setItem(keyTokenExpiration, expirationTime.toString()), // Save expiration time
        localStorage.setItem(keyUsername, username),
      ]);
      const safeUser = typeof user === 'string' ? user : JSON.stringify(user);
      localStorage.setItem("keyUser", safeUser);

    } else {
      await Promise.all([
        SecureStore.setItemAsync(keyAccessToken, access),
        SecureStore.setItemAsync(keyRefreshToken, refresh),
        SecureStore.setItemAsync(keyUsername, username),
        SecureStore.setItemAsync(keyUser, JSON.stringify(user)),
        SecureStore.setItemAsync(keyTokenExpiration, expirationTime.toString()), // Save expiration time
      ]);
      
    }
  } catch (error) {
    showSessionAlert('Error','Error token',()=>{})
  }
}

// Objeto para manejar el local storage de los dispositivos moviles y web
export const Storage = {
  // Guardar un dato
  setItem: async (key, value) => {
    if (isWeb) {
      localStorage.setItem(key, value);
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (e) {
        console.error("Error al guardar el dato:", e);
      }
    }
  },

  // Leer un dato
  getItem: async (key) => {
    if (isWeb) {
      return localStorage.getItem(key);
    } else {
      try {
        const value = await SecureStore.getItemAsync(key);
        return value !== null ? value : null;
      } catch (e) {
        console.error("Error al obtener el dato:", e);
      }
    }
  },

  // Borrar un dato
  removeItem: async (key) => {
    if (isWeb) {
      try {
        localStorage.removeItem(key);
      } catch {
        console.error("Error al eliminar el dato:", e);
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (e) {
        console.error("Error al eliminar el dato:", e);
      }
    }
  },
};

export default Storage;
