// API de productos sobre el cliente único (src/api/http.js). Sin `token` por
// parámetro. Reemplaza gradualmente a src/components/colletion/axiosRequest.jsx.
import { api } from "./http";

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

export async function getBarcode(productId) {
  const { data } = await api.get(`facturas/api/barcode/${productId}/`);
  return data;
}
