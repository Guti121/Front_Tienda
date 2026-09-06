// Shim de compatibilidad. La implementación real está en src/api/http.js.
// Las ~29 pantallas que importan de aquí siguen funcionando sin cambios; el
// token ya NO se pasa por parámetro, lo pone el interceptor.
import { router } from "expo-router";

import { API_URL } from "../../api/config";
import {
  get,
  post,
  patch,
  del,
  postForm,
  ApiError,
  refreshSession,
} from "../../api/http";
import { getAccess, isAccessExpired, clearSession } from "../../auth/session";

export const baseUrl = API_URL;
export { ApiError };

export const getRequest = get;
export const postRequest = post;
export const patchRequest = patch;
export const deleteRequest = del;
export const postRequestFormData = postForm;

// Compat: las pantallas hacen `const token = await expiredGetToken()` y luego
// `if (!token) { ...redirigir }`. Se mantiene ese contrato.
export const expiredGetToken = async () => {
  try {
    if (await isAccessExpired()) await refreshSession();
    const token = await getAccess();
    if (!token) {
      await clearSession();
      router.replace("/login");
      return null;
    }
    return token;
  } catch {
    await clearSession();
    router.replace("/login");
    return null;
  }
};
