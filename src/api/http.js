// Cliente HTTP único. Antes cada feature tenía su propio archivo de requests que
// recibía el `token` por parámetro y armaba headers a mano. Ahora:
//  - un interceptor mete el Authorization desde la sesión,
//  - un interceptor maneja 401 -> refresh (1 vez) -> retry,
//  - los errores se normalizan a ApiError { status, message, fields }.
import axios from "axios";
import { router } from "expo-router";

import { API_URL } from "./config";
import {
  getAccess,
  getRefresh,
  isAccessExpired,
  saveSession,
  clearSession,
} from "../auth/session";

export const api = axios.create({ baseURL: API_URL, timeout: 20000 });

// ---------------------------------------------------------------- Errores
export class ApiError extends Error {
  constructor({ status, message, fields, raw }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
    this.raw = raw;
  }
}

function toApiError(error) {
  if (error instanceof ApiError) return error;
  const res = error?.response;
  if (!res) {
    return new ApiError({
      status: 0,
      message: "Sin conexión con el servidor.",
      raw: error,
    });
  }
  const d = res.data;
  let message = "Ocurrió un error.";
  let fields;
  if (typeof d === "string") {
    message = d;
  } else if (d?.error && typeof d.error === "string") {
    message = d.error;
  } else if (d?.error && typeof d.error === "object") {
    // p. ej. validación de stock: { error: [...], producto_nombre: [...], ... }
    fields = d.error;
    const e = d.error.error;
    message = Array.isArray(e) ? e.join(" · ") : e || "Ocurrió un error.";
  } else if (d?.detail) {
    message = d.detail;
  } else if (d && typeof d === "object") {
    fields = d;
    const flat = Object.values(d).flat().filter(Boolean);
    if (flat.length) message = flat.join(" · ");
  }
  return new ApiError({ status: res.status, message, fields, raw: error });
}

// ---------------------------------------------------------------- Refresh
let refreshing = null;

export async function refreshSession() {
  const refresh = await getRefresh();
  if (!refresh) throw new Error("no-refresh-token");
  const { data } = await axios.post(
    `${API_URL}refresh-token/`,
    { refresh },
    { headers: { "Content-Type": "application/json" } },
  );
  await saveSession({ access: data.access, refresh: data.refresh });
  return data.access;
}

async function ensureFreshToken() {
  if (await isAccessExpired()) {
    refreshing =
      refreshing || refreshSession().finally(() => (refreshing = null));
    return refreshing;
  }
  return getAccess();
}

// ---------------------------------------------------------------- Interceptores
api.interceptors.request.use(async (config) => {
  if (config.skipAuth) return config;
  try {
    const token = await ensureFreshToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    /* sin token: la request saldrá sin auth y el 401 la manejará abajo */
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const { config, response } = error;
    if (
      response?.status === 401 &&
      config &&
      !config._retried &&
      !config.skipAuth
    ) {
      config._retried = true;
      try {
        refreshing =
          refreshing || refreshSession().finally(() => (refreshing = null));
        const token = await refreshing;
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      } catch {
        await clearSession();
        router.replace("/login");
      }
    }
    return Promise.reject(toApiError(error));
  },
);

// ---------------------------------------------------------------- Helpers
// Firmas compatibles con la capa vieja (`fn(url, data, tokenIgnorado)`); el
// token ya no se pasa, lo pone el interceptor.
export const get = (url, _t, cfg) => api.get(url, cfg);
export const post = (url, data, _t, cfg) => api.post(url, data, cfg);
export const patch = (url, data, _t, cfg) => api.patch(url, data, cfg);
export const del = (url, _t, cfg) => api.delete(url, cfg);
// FormData: NO fijar Content-Type (axios pone el boundary).
export const postForm = (url, data, _t) => api.post(url, data);
