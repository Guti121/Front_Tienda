// API de caja (turno de efectivo) sobre el cliente único (src/api/http.js).
import { api, ApiError } from "./http";

// POST /facturas/caja/abrir/  { monto_apertura }
export async function abrirCaja(montoApertura) {
  const { data } = await api.post("facturas/caja/abrir/", {
    monto_apertura: montoApertura,
  });
  return data;
}

// GET /facturas/caja/actual/  → la caja abierta, o null si no hay (404).
export async function getCajaActual() {
  try {
    const { data } = await api.get("facturas/caja/actual/");
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// GET /facturas/caja/resumen/  → desglose en vivo de la caja abierta.
export async function getCajaResumen() {
  try {
    const { data } = await api.get("facturas/caja/resumen/");
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// POST /facturas/caja/cerrar/  { monto_cierre_declarado, nota_cierre? }
export async function cerrarCaja(montoDeclarado, notaCierre) {
  const body = { monto_cierre_declarado: montoDeclarado };
  if (notaCierre) body.nota_cierre = notaCierre;
  const { data } = await api.post("facturas/caja/cerrar/", body);
  return data;
}

// POST /facturas/caja/movimiento/  { tipo: "ingreso"|"retiro", monto, motivo }
export async function crearMovimientoCaja(tipo, monto, motivo) {
  const { data } = await api.post("facturas/caja/movimiento/", {
    tipo,
    monto,
    motivo,
  });
  return data;
}

// GET /facturas/caja/historial/  (paginado, solo admin/creator)
export async function listCajaHistorial(pageUrl = "facturas/caja/historial/") {
  const { data } = await api.get(pageUrl);
  return data;
}
