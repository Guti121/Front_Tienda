// Métodos de pago al facturar. Las claves ("value") deben coincidir
// exactamente con Factura.METODO_PAGO_CHOICES en el backend
// (apps/shoppingcart/models.py).
export const PAYMENT_METHOD_OPTIONS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "datafono", label: "Datáfono" },
  { value: "transferencia", label: "Transferencia" },
  { value: "sistecredito", label: "Sistecredito" },
  { value: "adi", label: "Adi" },
];

export const DEFAULT_PAYMENT_METHOD = "efectivo";

export const paymentMethodLabel = (value) =>
  PAYMENT_METHOD_OPTIONS.find((o) => o.value === value)?.label ?? value ?? "";
