import type { MetadataRoute } from "next";
import { LEGAL_IDS, legalPath } from "@/lib/legal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paryup.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // Con WAITLIST_MODE activo, la web real redirige a la lista de espera.
  const legal: MetadataRoute.Sitemap = LEGAL_IDS.map((id) => ({
    url: `${SITE_URL}${legalPath(id)}`,
    changeFrequency: "yearly",
    priority: 0.3,
  }));
  if (process.env.WAITLIST_MODE === "true") {
    return [
      { url: `${SITE_URL}/waitlist`, changeFrequency: "weekly", priority: 1 },
      ...legal,
    ];
  }
  return [{ url: SITE_URL, changeFrequency: "weekly", priority: 1 }, ...legal];
}
