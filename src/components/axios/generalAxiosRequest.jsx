import axios from "axios";
import { deleteTokenStorage, expiredTimeToken } from "../token/token";
import Storage from "../token/localstorage";
import { router } from "expo-router";

export const baseUrl = "http://192.168.20.163:8000/";

export const expiredGetToken = async () => {
  try {
    await expiredTimeToken();
    const token = await Storage.getItem("token");
    if (!token) {
      await deleteTokenStorage();
      router.replace("/login");
    }
    return token;
  } catch {
    await deleteTokenStorage();
    router.replace("/login");
  }
};

export async function postRequest(url, data, token) {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    console.log(token, "esta es la data");
    const request = await axios.post(url, data, {
      headers,
      withCredentials: true,
    });
    console.log(request);
    return request;
  } catch (error) {
    console.log("Error en postRequest:", error);
    throw error || "Error desconocido";
  }
}

export async function getRequest(url, token) {
  console.log(token);

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const request = await axios.get(url, { headers, withCredentials: true });
    console.log(request);
    return request;
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || // Si existe error.response.data.error, úsalo
      error.response?.data?.detail || // Si no, usa error.response.data.detail
      error.response?.data || // Si tampoco, usa error.response.data completo
      "Error desconocido";
    console.log("Estoy en ERROR:", errorMessage);
    throw new Error(errorMessage);
  }
}

export async function deleteRequest(url, token) {
  console.log(token);

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const request = await axios.delete(url, { headers, withCredentials: true });
    console.log(request);
    return request;
  } catch (error) {const errorMessage =
    error.response?.data?.error || // Si existe error.response.data.error, úsalo
    error.response?.data?.detail || // Si no, usa error.response.data.detail
    error.response?.data || // Si tampoco, usa error.response.data completo
    "Error desconocido";
  console.log("Estoy en ERROR:", errorMessage);
  throw new Error(errorMessage);
  }
}

export async function patchRequest(url, data, token) {
  console.log(token, "llego el token");

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    console.log(headers);
    const request = await axios.patch(url, data, {
      headers,
      withCredentials: true,
    });
    console.log(request);
    return request;
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || // Si existe error.response.data.error, úsalo
      error.response?.data?.detail || // Si no, usa error.response.data.detail
      error.response?.data || // Si tampoco, usa error.response.data completo
      "Error desconocido";
    console.log("Estoy en ERROR:", errorMessage);
    throw new Error(errorMessage);
  }
}
