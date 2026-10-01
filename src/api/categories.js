// API de categorías (agrupan tipos de producto) sobre el cliente único
// (src/api/http.js). Mismo patrón que las funciones de tipo en products.js.
import { api, ApiError } from "./http";

const qs = (obj) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.append(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

// GET /listCategory/  (paginado). `pageUrl` es el `next` absoluto o "listCategory/".
export async function listCategories(pageUrl = "listCategory/") {
  const { data } = await api.get(pageUrl);
  return data; // { results, next, ... }
}

// GET /categoryFilter/?q=&page=  (admin, paginado). Devuelve 404 si no hay
// coincidencias -> se normaliza a lista vacía.
export async function filterCategories({ q = "", page = 1 } = {}) {
  try {
    const { data } = await api.get(`categoryFilter/${qs({ q, page })}`);
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { results: [], next: null };
    }
    throw err;
  }
}

// POST /createcategory/  { nombre }
export async function createCategory(nombre) {
  const { data } = await api.post("createcategory/", { nombre });
  return data;
}

// PATCH /categoryUpdate/<id>/  { nombre?, detalles? }
export async function updateCategory(id, body) {
  const { data } = await api.patch(`categoryUpdate/${id}/`, body);
  return data;
}

// DELETE /destroycategory/<id>/  (los tipos de esta categoría quedan sin
// categoría, NO se borran — a diferencia de borrar un tipo).
export async function deleteCategory(id) {
  await api.delete(`destroycategory/${id}/`);
}
