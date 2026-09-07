// Catálogo público (sin autenticación). Reemplaza
// src/components/catalog/axiosRequest.jsx.
import { api } from "./http";

const PUBLIC = { skipAuth: true };

// GET /catalogo/list/<name>?fecha=desc&tipo=  → { results, next }
// `pageParam` puede ser el número de página o un `next` absoluto.
export async function listCatalog({ name, tipo, page = 1 }) {
  const url =
    typeof page === "string" && page.startsWith("http")
      ? page
      : `catalogo/list/${encodeURIComponent(name)}?fecha=desc&page=${page}${
          tipo ? `&tipo=${tipo}` : ""
        }`;
  const { data } = await api.get(url, PUBLIC);
  return data;
}

// GET /catalogo/company/<name>
export async function getCatalogCompany(name) {
  const { data } = await api.get(
    `catalogo/company/${encodeURIComponent(name)}`,
    PUBLIC,
  );
  return data;
}

// GET /catalogo/tipo-producto/<name>  → { results, next }
export async function listCatalogTypes({ name, page = 1 }) {
  const url =
    typeof page === "string" && page.startsWith("http")
      ? page
      : `catalogo/tipo-producto/${encodeURIComponent(name)}?page=${page}`;
  const { data } = await api.get(url, PUBLIC);
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
