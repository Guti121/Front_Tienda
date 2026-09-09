export const pesosFormat = (num) => {
  const formatCurrency = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0, // El peso no tiene centavos: sin decimales.
    maximumFractionDigits: 0,
  }).format(num);

  return formatCurrency;
};

// This function formart nums in changeText
export const formatToCOP = (value) => {
  // Eliminar caracteres no numéricos y convertir a número
  const numericValue = parseFloat(value.replace(/[^0-9]/g, ""));
  if (isNaN(numericValue)) return ""; // Evitar valores no numéricos

  // Formatear en pesos colombianos
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
};

//format at number
export const cleanNumber = (value) => {
  if (!value) return 0;
  const cleaned = value.replace(/[$\s,.]/g, ""); // Elimina `$`, espacios, puntos y comas
  return isNaN(parseInt(cleaned)) ? 0 : parseInt(cleaned);
};
