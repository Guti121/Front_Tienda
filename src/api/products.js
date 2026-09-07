// API de productos sobre el cliente único (src/api/http.js). Sin `token` por
// parámetro (lo pone el interceptor).
import { api, ApiError } from "./http";

const qs = (obj) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.append(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

// GET /product/  (admin, paginado). order: "" | "0".."5"
export async function listProductsAdmin({ q = "", order = "", page = 1 } = {}) {
  const { data } = await api.get(`product/${qs({ q, order, page })}`);
  return data; // { results, count, next, previous } o array
}

// GET /listfilter/?q=  (worker: solo disponibles, tope 10)
export async function searchAvailableProducts(q) {
  const { data } = await api.get(`listfilter/${qs({ q })}`);
  return data;
}

export async function retrieveProduct(id) {
  const { data } = await api.get(`productDetail/${id}/`);
  return data;
}

export async function deleteProduct(id) {
  await api.delete(`destroyproduct/${id}/`);
}

export async function patchProduct(id, body) {
  const { data } = await api.patch(`updateProduct/${id}/`, body);
  return data;
}

// PATCH con multipart (cuando hay imágenes nuevas). axios pone el boundary.
export async function patchProductForm(id, formData) {
  const { data } = await api.patch(`updateProduct/${id}/`, formData);
  return data;
}

// PATCH solo del stock. `unidades` es el nuevo total absoluto.
export async function updateStock(id, unidades) {
  const { data } = await api.patch(`updateProduct/${id}/`, {
    unidades_disponibles: unidades,
  });
  return data;
}

export async function getBarcode(productId) {
  const { data } = await api.get(`facturas/api/barcode/${productId}/`);
  return data;
}

// POST /create/  (multipart: campos + `imagenes`). Devuelve el producto creado.
export async function createProduct(formData) {
  const { data } = await api.post("create/", formData);
  return data;
}

// GET /listType/  (paginado). `pageUrl` es el `next` absoluto o "listType/".
export async function listTypeProducts(pageUrl = "listType/") {
  const { data } = await api.get(pageUrl);
  return data; // { results, next, ... }
}

// GET /typeProductFilter/?q=&page=  (admin, paginado). Devuelve 404 si no hay
// coincidencias -> se normaliza a lista vacía.
export async function filterTypeProducts({ q = "", page = 1 } = {}) {
  try {
    const { data } = await api.get(`typeProductFilter/${qs({ q, page })}`);
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { results: [], next: null };
    }
    throw err;
  }
}

// POST /createtype/  { tipo_producto }
export async function createTypeProduct(tipo_producto) {
  const { data } = await api.post("createtype/", { tipo_producto });
  return data;
}

// DELETE /destroytypeProduct/<id>/  (⚠ el backend borra en cascada los
// productos de ese tipo).
export async function deleteTypeProduct(id) {
  await api.delete(`destroytypeProduct/${id}/`);
}
