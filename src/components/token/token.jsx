import { Alert } from "react-native";

import Storage from "./localstorage";
import axios from "axios";
import { save } from "./localstorage";
import { router } from "expo-router";

const baseUrl = "https://api.mystockapp.site/";
//https://api.mystockapp.site/
//redirect Login
export const deleteTokenStorage = async () => {
  await Storage.removeItem("time");
  await Storage.removeItem("username");
  await Storage.removeItem("token");
  await Storage.removeItem("Refreshtoken");
  await Storage.removeItem("user");
  router.replace("/login");

};


export async function expiredTimeToken() {
  try {
    const [username, refresh, timeExpiration,user] = await Promise.all([
      Storage.getItem("username"),
      Storage.getItem("Refreshtoken"),
      Storage.getItem("tokenExpiration"),
      Storage.getItem("user"),

    ]);

    
    if (!refresh || !timeExpiration) {
      throw new Error("Faltan datos requeridos (tokenRefresh).");
    }

    const currentTime = Date.now();
    if (currentTime > parseInt(timeExpiration)) {
      await refreshToken(refresh, username,user);
    }
  } catch (error) {
    throw new Error(
      `Error al verificar el token o expiración: ${error.message}`
    );
  }
}

async function refreshToken(refreshToken, username,user) {
  const url = `${baseUrl}refresh-token/`;
  const data = { refresh: `${refreshToken}` };
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, data, {
      headers,
      withCredentials: true,
    });
    if (
      response.status === 200 &&
      response.data.access &&
      response.data.refresh
    ) {
      const access = response.data.access;
      const refresh = response.data.refresh;

      await save({ access, refresh, username,user });
    }
  } catch (error) {
    throw error;
  }
}
