import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MuMê Mum Atölyesi | El Yapımı Tasarım Mumlar · Van",
    template: "%s | MuMê Mum Atölyesi",
  },
  description:
    "Van'da el yapımı çiçek tasarımlı, dekoratif ve kişiye özel mumlar. Hediyelik mumlar ve mum yapım workshopları — MuMê Mum Atölyesi.",
  applicationName: "MuMê Mum Atölyesi",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "MuMê Mum Atölyesi",
    images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: "MuMê Mum Atölyesi" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#f6efe2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${cormorant.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        {/* Kaydırma animasyonları yalnızca JavaScript çalışıyorsa içeriği gizler */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
