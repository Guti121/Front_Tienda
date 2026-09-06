// Compat: muchas pantallas importan `deleteTokenStorage` / `expiredTimeToken`
// de aquí. La lógica real vive ahora en src/auth/session.js y src/api/http.js.
import { router } from "expo-router";

import { clearSession, isAccessExpired } from "../../auth/session";
import { refreshSession } from "../../api/http";

export async function deleteTokenStorage() {
  await clearSession();
  router.replace("/login");
}

// Refresca el access token si está vencido. Antes las pantallas lo llamaban
// manualmente; ahora el interceptor de http.js también lo cubre.
export async function expiredTimeToken() {
  if (await isAccessExpired()) {
    await refreshSession();
  }
}
