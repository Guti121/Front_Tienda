// Catálogo público (sin autenticación).
import { api, ApiError } from "./http";

const PUBLIC = { skipAuth: true };
const EMPTY_PAGE = { count: 0, next: null, previous: null, results: [] };

const qs = (obj) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.append(k, v);
  });
  return p.toString();
};

// El backend responde 404 ("Página inválida") o 400 ("no hay tipos") en casos
// que para la UI son simplemente "no hay más" / "lista vacía".
async function getPaged(url) {
  try {
    const { data } = await api.get(url, PUBLIC);
    return data;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
      return EMPTY_PAGE;
    }
    throw err;
  }
}

// GET /catalogo/list/<name>?fecha=desc&page=&tipo=  → { count, next, previous, results }
export function listCatalog({ name, tipo, page = 1 }) {
  return getPaged(
    `catalogo/list/${encodeURIComponent(name)}?${qs({ fecha: "desc", page, tipo })}`,
  );
}

// GET /catalogo/tipo-producto/<name>?page=  → { ...results }
export function listCatalogTypes({ name, page = 1 }) {
  return getPaged(
    `catalogo/tipo-producto/${encodeURIComponent(name)}?${qs({ page })}`,
  );
}

// GET /catalogo/company/<name>
export async function getCatalogCompany(name) {
  const { data } = await api.get(
    `catalogo/company/${encodeURIComponent(name)}`,
    PUBLIC,
  );
  return data;
}

// GET /catalogo/product/<name>/<id>
export async function getCatalogProduct(name, id) {
  const { data } = await api.get(
    `catalogo/product/${encodeURIComponent(name)}/${id}`,
    PUBLIC,
  );
  return data;
}
