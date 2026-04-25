import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monad Pass",
  description: "Web3 Ticketing en Monad",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
