// Inventario (solo creator).
import { api } from "./http";

const qs = (obj) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.append(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

// GET /inventario/productos/  → totales del stock activo (disponible=True).
export async function getStockTotals() {
  const { data } = await api.get("inventario/productos/");
  return data; // { total_unidades_disponibles, total_precio_mayor, total_precio_venta, total_costos_fijos }
}

// GET /inventario/?month=&year=&page=  → paginado { results:[{fecha,...}], next }
export async function getDailyReport({ month, year, page = 1 } = {}) {
  const { data } = await api.get(`inventario/${qs({ month, year, page })}`);
  return data;
}

// GET /inventario/resumen/?month=&year=  → { resumen: {...} }
export async function getMonthlySummary({ month, year } = {}) {
  const { data } = await api.get(`inventario/resumen/${qs({ month, year })}`);
  return data;
}
