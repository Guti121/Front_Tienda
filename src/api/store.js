// Ajustes de tienda: datos de la compañía, costos fijos, aliados y QR.
import { api } from "./http";

// -------------------------------------------------------------- Compañía
export async function retrieveCompany() {
  const { data } = await api.get("store/retrieveCompany/");
  return data;
}

// `fields`: objeto plano, o FormData si se sube logo. El backend promueve al
// usuario (cliente -> creator) y lo vincula a la nueva compañía.
export async function createCompany(fields) {
  const { data } = await api.post("store/createCompany/", fields);
  return data;
}

// `fields` puede ser objeto plano o FormData (cuando hay logo nuevo).
export async function updateCompany(fields) {
  const { data } = await api.patch("store/updateCompany/", fields);
  return data;
}

export async function deleteCompany() {
  await api.delete("store/destroyCompany/");
}

// -------------------------------------------------------------- Costos fijos
export async function retrieveCosts() {
  const { data } = await api.get("config/retrive/");
  return data; // { costos_fijos, margen_ganancia, promedio_productos_vendidos }
}

export async function saveCosts(body) {
  const { data } = await api.post("config/", body);
  return data;
}

export async function deleteCosts() {
  const { data } = await api.delete("config/destroy/");
  return data;
}

// -------------------------------------------------------------- Aliados
export async function listAllies(pageUrl = "base/listUsersCompany/") {
  const { data } = await api.get(pageUrl);
  return data; // { results, next }
}

// El backend "elimina" con un PATCH que desvincula al usuario.
export async function removeAlly(id) {
  await api.patch(`base/DestroyUsersCompany/${id}/`, { data: null });
}

// -------------------------------------------------------------- QR de aliado
// typeUser: 1 = cajero/worker, 2 = admin
export async function generateAllyQr({ email, typeUser }) {
  const { data } = await api.post("store/generar_qr/", {
    email,
    type_user: typeUser,
  });
  return data; // { qr_base64 }
}

export async function validateAllyQr(tokenQr) {
  const { data } = await api.get(
    `store/validar_qr/?token=${encodeURIComponent(tokenQr)}`,
  );
  return data; // { message }
}
