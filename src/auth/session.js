// Única fuente de verdad para la sesión (tokens + usuario).
// Antes esto estaba repartido entre token.jsx, localstorage.jsx y varias
// pantallas, con bugs de claves (se guardaba con una y se leía con otra).
import { jwtDecode } from "jwt-decode";

import { Storage } from "../components/token/localstorage";

// Se mantienen las MISMAS claves que ya usaba la app -> no hay que migrar datos
// ni cerrar sesión al desplegar, y los `Storage.getItem("token")` sueltos que
// queden en pantallas siguen funcionando.
const K = {
  access: "token",
  refresh: "Refreshtoken",
  user: "user",
  username: "username",
  exp: "tokenExpiration",
};

export async function saveSession({ access, refresh, user, username }) {
  const ops = [];
  if (access != null) {
    ops.push(Storage.setItem(K.access, access));
    try {
      const exp = jwtDecode(access).exp * 1000; // ms
      ops.push(Storage.setItem(K.exp, String(exp)));
    } catch {
      /* token no decodificable: se deja sin exp */
    }
  }
  if (refresh != null) ops.push(Storage.setItem(K.refresh, refresh));
  if (username != null) ops.push(Storage.setItem(K.username, username));
  if (user != null) {
    const raw = typeof user === "string" ? user : JSON.stringify(user);
    ops.push(Storage.setItem(K.user, raw));
  }
  await Promise.all(ops);
}

export const getAccess = () => Storage.getItem(K.access);
export const getRefresh = () => Storage.getItem(K.refresh);
export const getUsername = () => Storage.getItem(K.username);

export async function getUser() {
  const raw = await Storage.getItem(K.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export async function getAccessExp() {
  const raw = await Storage.getItem(K.exp);
  return raw ? parseInt(raw, 10) : 0;
}

export async function isAccessExpired() {
  const exp = await getAccessExp();
  return !exp || Date.now() > exp;
}

export async function clearSession() {
  await Promise.all(Object.values(K).map((k) => Storage.removeItem(k)));
}
