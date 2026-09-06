// Cálculo de precio sugerido de venta (config de costos fijos de la tienda).
import { api } from "./http";

// POST /config/calculo/  →
//   { Precio_sugerido_Unidad, ValorXmayor_CF, Margen }
// `valorMayor` debe ser entero. `margen` es el % de ganancia (opcional).
export async function suggestRetailPrice({ valorMayor, margen }) {
  const body = { valor_mayor: parseInt(valorMayor, 10) || 0 };
  if (margen) body.margen = Number(margen);
  const { data } = await api.post("config/calculo/", body);
  return data;
}
