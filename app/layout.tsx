import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./client-wrapper";
import localFont from "next/font/local";
import Script from "next/script";

const InterSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const Montserrat = localFont({
  src: "/assets/fonts/Montserrat-Variable.ttf",
  // src: "/assets/fonts/xn7gYHE41ni1AdIRggqxSvfedN62Zw.woff2",

  variable: "--font-montserrat",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paryup.com";
const DESCRIPTION =
  "ParyUp: tus entradas, tus chats, tus matches y el recap de cada noche, en una sola app.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ParyUp · Tus noches en una sola app",
    template: "%s | ParyUp",
  },
  description: DESCRIPTION,
  applicationName: "ParyUp",
  keywords: [
    "ParyUp",
    "entradas",
    "comprar entradas",
    "eventos",
    "fiestas",
    "discotecas",
    "chat social",
    "matches",
    "mapa de eventos",
  ],
  authors: [{ name: "ParyUp" }],
  creator: "ParyUp",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "ParyUp",
    title: "ParyUp · Tus noches en una sola app",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "ParyUp · Tus noches en una sola app",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${InterSans.variable} ${Montserrat.variable} h-full antialiased`}
    >
      {/* <Script
        src="//unpkg.com/react-scan/dist/auto.global.js"
        crossOrigin="anonymous"
        strategy="beforeInteractive"
      /> */}
      <body className="min-h-full flex flex-col">
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
