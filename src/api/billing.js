// API de facturación sobre el cliente único (src/api/http.js). Sin `token` por
// parámetro. Reemplaza a src/components/billing/axiosRequest.jsx.
import { api, postForm } from "./http";

// POST /facturas/create/  → { mensaje, factura_id, Factura }
// `detalles`: [{ producto: <id>, cantidad: <n> }]
export async function createInvoice(detalles) {
  const { data } = await api.post("facturas/create/", { detalles });
  return data;
}

// POST /facturas/codigo_de_barras_text/  (móvil: escáner EAN-13)
export async function lookupBarcodeText(codigoBarras) {
  const { data } = await api.post("facturas/codigo_de_barras_text/", {
    codigoBarras,
  });
  return data;
}

// POST /facturas/codigo_de_barras/  (web: foto del producto, multipart)
export async function lookupBarcodeImage(formData) {
  const { data } = await postForm("facturas/codigo_de_barras/", formData);
  return data;
}

const qs = (obj) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.append(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

// GET /facturas/?date=YYYY-MM-DD  (o ?month=&year=; sin filtro = mes actual)
// → { numero_de_facturas, total_cantidad_de_procuctos, total_facturas, facturas }
export async function listInvoices({ date, month, year } = {}) {
  const { data } = await api.get(`facturas/${qs({ date, month, year })}`);
  return data;
}

// GET /facturas/<id>/  → una factura con sus detalles
export async function retrieveInvoice(id) {
  const { data } = await api.get(`facturas/${id}/`);
  return data;
}

// DELETE /facturas/destroy/<id>/  (repone stock en el backend, atómico)
export async function deleteInvoice(id) {
  await api.delete(`facturas/destroy/${id}/`);
}
