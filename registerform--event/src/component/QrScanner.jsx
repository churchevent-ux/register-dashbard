import React, { useRef, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QrScanner = ({ onScan }) => {
  const scannerRef = useRef(null);
  useEffect(() => {
    if (!scannerRef.current) return;
    const scanner = new Html5QrcodeScanner(
      scannerRef.current.id,
      { fps: 10, qrbox: 200 },
      false
    );
    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
      },
      (error) => {}
    );
    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScan]);
  return <div id="qr-scanner" ref={scannerRef} style={{ width: "100%" }} />;
};

export default QrScanner;
