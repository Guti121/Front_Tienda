import { api, ApiError } from "../../api/http";
import { saveSession, getRefresh } from "../../auth/session";
import { deleteTokenStorage } from "../token/token";

export async function handleLogin(email, password) {
  try {
    const { data } = await api.post(
      "login/",
      { email, password },
      { skipAuth: true },
    );
    await saveSession({
      access: data.access,
      refresh: data.refresh,
      user: data.user,
      username: email,
    });
    return data.user;
  } catch (error) {
    // http.js ya normaliza a ApiError; se devuelve el mensaje legible.
    throw error instanceof ApiError
      ? error.message
      : "No se pudo iniciar sesión.";
  }
}

export async function handleLogout() {
  try {
    const refresh = await getRefresh();
    await api.post("logout/", { refresh }, { skipAuth: true });
  } catch {
    /* aunque falle el logout en el server, se limpia la sesión local */
  } finally {
    await deleteTokenStorage(); // clearSession() + redirige a /login
  }
}

export async function handleRegister(data) {
  return api.post("register/", data, { skipAuth: true });
}
