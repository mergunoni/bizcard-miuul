import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mehmet Ergün · Dijital Kartvizit",
  description: "Mehmet Ergün'ün dijital kartviziti",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
