import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";

const display = Bricolage_Grotesque({
  variable: "--font-display-face",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--font-sans-body",
  subsets: ["latin"],
});

const DESCRIPTION =
  "ParyUp: tus entradas, tus chats, tus matches y el recap de cada noche, en una sola app.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://paryup.com",
  ),
  title: {
    default: "ParyUp · Tus noches en una sola app",
    template: "%s | ParyUp",
  },
  description: DESCRIPTION,
  applicationName: "ParyUp",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "ParyUp",
    title: "ParyUp · Tus noches en una sola app",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${sans.variable} antialiased`}
    >
      <body>
        <LocaleProvider>
          <AuthProvider>{children}</AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
