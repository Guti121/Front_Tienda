// Generación del PDF de la etiqueta de código de barras. Solo web: usa el DOM y
// html2pdf.js (carga diferida para no incluirlo en el bundle nativo).
import { pesosFormat } from "../../components/icons/functionFormat";

const SIZE_CONFIG = {
  58: {
    width: 58,
    height: 35,
    titleSize: 9,
    priceSize: 9,
    barcodeWidth: "50mm",
  },
  80: {
    width: 80,
    height: 40,
    titleSize: 10,
    priceSize: 9,
    barcodeWidth: "70mm",
  },
  100: {
    width: 100,
    height: 45,
    titleSize: 12,
    priceSize: 10,
    barcodeWidth: "85mm",
  },
};

export const SIZE_OPTIONS = [58, 80, 100];

async function toBase64(url) {
  const res = await fetch(`${url}?t=${Date.now()}`, {
    mode: "cors",
    cache: "no-store",
  });
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

function labelHtml(size, base64Image, barcodeNumber, product) {
  const c = SIZE_CONFIG[size] || SIZE_CONFIG[80];
  return `
    <div style="width:${c.width}mm;height:${c.height}mm;font-family:Arial,sans-serif;
      display:flex;flex-direction:column;justify-content:center;align-items:center;
      text-align:center;padding:2mm;box-sizing:border-box;">
      <div style="font-size:${c.titleSize}pt;text-transform:uppercase;overflow-wrap:break-word;
        max-width:100%;font-weight:bold;">${product.nombre ?? ""}</div>
      <div style="font-size:${c.priceSize}pt;font-weight:bold;margin-bottom:1mm;">
        ${pesosFormat(product.valor)}</div>
      <img src="${base64Image}" alt="barcode" style="width:${c.barcodeWidth};max-height:18mm;
        object-fit:contain;padding:2mm;margin-bottom:0.5mm;"/>
      <div style="font-size:10pt;font-family:monospace;letter-spacing:0.5px;word-break:break-all;">
        ${barcodeNumber ?? ""}</div>
    </div>`;
}

// Descarga el PDF de la etiqueta. `product` necesita { nombre, valor, codigo_barras }.
export async function downloadBarcodePdf({
  size = 80,
  barcodeImageUrl,
  product,
}) {
  if (!product?.nombre || !product?.valor) {
    throw new Error("El producto no está cargado correctamente.");
  }
  const c = SIZE_CONFIG[size] || SIZE_CONFIG[80];
  const { default: html2pdf } = await import("html2pdf.js");
  const base64Image = await toBase64(barcodeImageUrl);

  const container = document.createElement("div");
  container.innerHTML = labelHtml(
    size,
    base64Image,
    product.codigo_barras,
    product,
  );
  document.body.appendChild(container);

  try {
    await html2pdf()
      .from(container)
      .set({
        margin: 0,
        filename: `${product.nombre || "codigo-de-barras"}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: "mm",
          format: [c.height, c.width],
          orientation: "landscape",
        },
      })
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
