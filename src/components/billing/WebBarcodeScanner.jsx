// Stub para iOS/Android: el modal usa CameraView (expo-camera) directamente.
// Existe para que el bundle nativo resuelva el import sin arrastrar @zxing
// (que es web-only). Metro sirve WebBarcodeScanner.web.jsx en web y este en el resto.
export default function WebBarcodeScanner() {
  return null;
}
