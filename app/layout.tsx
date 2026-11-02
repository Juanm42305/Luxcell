import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { siteDescription } from "@/config/site";
import { getBusinessSettings } from "@/services/settings";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

// Cada respuesta lleva un nonce propio para la CSP y datos de inventario al día.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { name, isComplete } = await getBusinessSettings();
  return {
    title: { default: "Celulares y accesorios", template: `%s | ${name}` },
    description: siteDescription,
    // Sin los datos del proveedor completos, el sitio no debe aparecer en buscadores.
    robots: isComplete ? undefined : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CO" className={instrumentSans.variable}>
      <body>{children}</body>
    </html>
  );
}
