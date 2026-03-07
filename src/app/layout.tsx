import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://compensalo.com"),
  title: "Compensalo — Reconciliación financiera automática",
  description:
    "El protocolo que reconcilia automáticamente tus pagos contra tus movimientos bancarios. Sin Excel. Sin discrepancias.",
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
  },
  openGraph: {
    title: "Compensalo — Reconciliación financiera automática",
    description:
      "El protocolo que reconcilia automáticamente tus pagos contra tus movimientos bancarios. Sin Excel. Sin discrepancias.",
    siteName: "Compensalo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compensalo — Reconciliación financiera automática",
    description:
      "El protocolo que reconcilia automáticamente tus pagos contra tus movimientos bancarios. Sin Excel. Sin discrepancias.",
  },
  other: {
    "theme-color": "#0A0A0A",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#0A0A0A" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
