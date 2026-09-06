// URL del backend. Expo inyecta las EXPO_PUBLIC_* en el bundle; el fallback es
// la URL actual para que nada se rompa si no hay .env.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.mystockapp.site/";
