import Storage, { save } from "../token/localstorage";
import { baseUrl, postRequest } from "../axios/generalAxiosRequest";
import axios from "axios";
import { deleteTokenStorage } from "../token/token";

export async function handleLogin(username, password) {
  const url = `${baseUrl}login/`;
  const data = {
    email: username,
    password: password,
  };
  try {
    let request = await postRequest(url, data);
    const access = request.data.access;
    const refresh = request.data.refresh;
    const user = request.data.user;
    console.log(user, "usuarioTYpo");
    save({ access, refresh, username, user });
    return user;
  } catch (error) {
    console.log("error desde login handle login", error.response.data, error);
    throw error.response.data.error;
  }
}

export async function handleLogout() {
  const url = `${baseUrl}logout/`;
  try {
    const token = await Storage.getItem("Refreshtoken");
    console.log(token);
    const data = { refresh: token };
    let response = await axios.post(url, data);
    await deleteTokenStorage();
    return response;
  } catch (error) {
    console.log("error desde logout", error.response.data, error);
    throw error.response.data.error;
  }
}

export async function handleRegister(data) {
  const url = `${baseUrl}register/`;
  try {
    let request = await axios.post(url, data);
    return request;
  } catch (error) {
    throw error;
  }
}
