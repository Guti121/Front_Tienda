/* eslint-env browser */
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

import { useTheme } from "../../theme/ThemeProvider";

// Códigos que usa la tienda (EAN-13 en la práctica; el resto por si acaso).
const FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
];

/**
 * Escáner de código de barras en vivo para web (getUserMedia + @zxing/browser).
 * Solo se bundlea en web; el nativo usa el stub WebBarcodeScanner.jsx.
 *
 * props:
 *  - onScan(text): se llama UNA vez por montaje cuando lee un código.
 *  - onUnavailable(motivo): la cámara no arrancó (permiso denegado, sin cámara,
 *    contexto no seguro sin HTTPS...). El modal muestra el fallback de foto.
 *  - paused: si es true, la cámara se apaga (tras un hit o con el Sheet abierto).
 */
export default function WebBarcodeScanner({ onScan, onUnavailable, paused }) {
  const { radii } = useTheme();
  const videoRef = useRef(null);
  const onScanRef = useRef(onScan);
  const onUnavailableRef = useRef(onUnavailable);
  onScanRef.current = onScan;
  onUnavailableRef.current = onUnavailable;

  useEffect(() => {
    if (paused) return undefined;

    let stopped = false;
    let controls = null;

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, FORMATS);
    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 300,
      delayBetweenScanSuccess: 1000,
    });

    reader
      .decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } } },
        videoRef.current,
        (result) => {
          if (result && !stopped) {
            stopped = true;
            try {
              controls?.stop();
            } catch {
              /* noop */
            }
            onScanRef.current?.(result.getText());
          }
        },
      )
      .then((ctrl) => {
        controls = ctrl;
        if (stopped) {
          try {
            ctrl.stop();
          } catch {
            /* noop */
          }
        }
      })
      .catch((e) => {
        onUnavailableRef.current?.(e?.name || "camera-error");
      });

    return () => {
      stopped = true;
      try {
        controls?.stop();
      } catch {
        /* noop */
      }
    };
  }, [paused]);

  return (
    <View
      style={{
        height: 280,
        borderRadius: radii.lg,
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </View>
  );
}
