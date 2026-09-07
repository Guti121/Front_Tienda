// URL del backend. Expo inyecta las EXPO_PUBLIC_* en el bundle; el fallback es
// la URL actual para que nada se rompa si no hay .env.
export const API_URL =
  "http://127.0.0.1:8000/" || process.env.EXPO_PUBLIC_API_URL;

// El catálogo público ya NO se renderiza dentro de la app: vive en su propia
// mini-app web (repo `catalog-web`). La app solo comparte el enlace
// `<CATALOG_WEB_URL>/<nombre-de-la-tienda>`.
export const CATALOG_WEB_URL = (
  process.env.EXPO_PUBLIC_CATALOG_URL || "https://catalogo.mystockapp.site"
).replace(/\/+$/, "");

export const catalogUrl = (storeName) =>
  `${CATALOG_WEB_URL}/${encodeURIComponent(storeName ?? "")}`;

// El backend a veces devuelve rutas de imagen relativas ("/productos/x.jpg",
// p. ej. en `imagen_principal`/`image_principal`), que <Image> no sabe resolver
// porque el origen del front != origen del back. Esto las vuelve absolutas.
// Rutas ya absolutas (http/https/data:) pasan tal cual.
export function mediaUrl(uri) {
  if (!uri || typeof uri !== "string") return null;
  const s = uri.trim();
  if (!s) return null;
  if (/^(https?:\/\/|data:|blob:)/i.test(s)) return s;
  return API_URL.replace(/\/+$/, "") + (s.startsWith("/") ? s : "/" + s);
}
