import type { Metadata } from "next";
import { getWaitlistCount } from "@/lib/waitlist";
import { WaitlistScreen } from "@/screens/waitlist";

export const metadata: Metadata = {
  title: "Lista de espera",
  description:
    "Apúntate a la lista de espera de ParyUp y te avisamos cuando abramos: entradas, chats, matches y el recap de cada noche.",
  alternates: { canonical: "/waitlist" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "ParyUp",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "ParyUp: tus entradas, tus chats, tus matches y el recap de cada noche, en una sola app.",
      },
    ],
    url: "/waitlist",
    title: "Lista de espera | ParyUp",
    description:
      "Apúntate antes que nadie y te avisamos cuando abramos ParyUp.",
  },
};

export default function WaitlistPage() {
  return <WaitlistScreen countPromise={getWaitlistCount()} />;
}
