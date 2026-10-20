import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paryup.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // Con WAITLIST_MODE activo, la web real redirige a la lista de espera.
  if (process.env.WAITLIST_MODE === "true") {
    return [{ url: `${SITE_URL}/waitlist`, changeFrequency: "weekly", priority: 1 }];
  }
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/waitlist`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
