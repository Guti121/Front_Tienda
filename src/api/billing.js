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
