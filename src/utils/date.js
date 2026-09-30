// Fecha local en formato YYYY-MM-DD. A diferencia de `date.toISOString().split("T")[0]`
// (que da la fecha en UTC), esta respeta el día del calendario del dispositivo:
// para usuarios al oeste de UTC (ej. Colombia, UTC-5) `toISOString()` adelanta
// la fecha al día siguiente desde las 7pm hora local en adelante.
export const toLocalDateStr = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
