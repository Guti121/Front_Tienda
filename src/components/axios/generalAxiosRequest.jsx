import axios from "axios";
import { deleteTokenStorage, expiredTimeToken } from "../token/token";
import Storage from "../token/localstorage";
import { router } from "expo-router";

export const baseUrl = "https://api.mystockapp.site/";

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
    const request = await axios.post(url, data, {
      headers,
      withCredentials: true,
    });
    return request;
  } catch (error) {
    throw error || "Error desconocido";
  }
}

export async function getRequest(url, token) {

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const request = await axios.get(url, { headers, withCredentials: true });
    return request;
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || // Si existe error.response.data.error, úsalo
      error.response?.data?.detail || // Si no, usa error.response.data.detail
      error.response?.data || // Si tampoco, usa error.response.data completo
      "Error desconocido";
    throw new Error(errorMessage);
  }
}

export async function deleteRequest(url, token) {

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const request = await axios.delete(url, { headers, withCredentials: true });
    return request;
  } catch (error) {const errorMessage =
    error.response?.data?.error || // Si existe error.response.data.error, úsalo
    error.response?.data?.detail || // Si no, usa error.response.data.detail
    error.response?.data || // Si tampoco, usa error.response.data completo
    "Error desconocido";
  throw new Error(errorMessage);
  }
}

export async function patchRequest(url, data, token) {

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const request = await axios.patch(url, data, {
      headers,
      withCredentials: true,
    });
    return request;
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || // Si existe error.response.data.error, úsalo
      error.response?.data?.detail || // Si no, usa error.response.data.detail
      error.response?.data || // Si tampoco, usa error.response.data completo
      "Error desconocido";
    throw new Error(errorMessage);
  }
}


export async function postRequestFormData(url, data, token) {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const request = await axios.post(url, data, {
      headers,
      withCredentials: true,
    });
    return request;
  } catch (error) {
    throw error || "Error desconocido";
  }
}