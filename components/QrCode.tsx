"use client";

import { QRCodeSVG } from "qrcode.react";

type QrCodeProps = {
  url: string;
};

export function QrCode({ url }: QrCodeProps) {
  return (
    <section className="qr" aria-label="QR kod ile paylaş">
      <div className="qr__frame">
        <QRCodeSVG value={url} size={128} bgColor="#ffffff" fgColor="#1f2937" level="M" />
      </div>
      <p className="qr__caption">Kartı paylaşmak için QR&apos;ı okut</p>
    </section>
  );
}
