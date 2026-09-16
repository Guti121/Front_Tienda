// API de promociones de producto sobre el cliente único (src/api/http.js).
import { api } from "./http";

// POST /descuentos/create/  { producto, porcentaje, fecha_inicio, fecha_fin }
export async function createDiscount({
  producto,
  porcentaje,
  fecha_inicio,
  fecha_fin,
}) {
  const { data } = await api.post("descuentos/create/", {
    producto,
    porcentaje,
    fecha_inicio,
    fecha_fin,
  });
  return data;
}

// GET /descuentos/list/?producto=<id>  (historial de promos de ese producto)
export async function listDiscounts(productoId) {
  const { data } = await api.get(`descuentos/list/?producto=${productoId}`);
  return data;
}

// PATCH /descuentos/update/<id>/
export async function updateDiscount(id, body) {
  const { data } = await api.patch(`descuentos/update/${id}/`, body);
  return data;
}

// DELETE /descuentos/destroy/<id>/
export async function deleteDiscount(id) {
  await api.delete(`descuentos/destroy/${id}/`);
}
