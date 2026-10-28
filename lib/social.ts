// Redes del perfil: mismas plataformas, colores y reglas de URL que la app
// (paryup-app/src/types/socialPlatforms.ts y components/profile/socialLinks).

export type SocialPlatformId =
  | "website"
  | "tiktok"
  | "snapchat"
  | "instagram"
  | "twitter"
  | "spotify"
  | "soundcloud";

export type SocialPlatform = {
  id: SocialPlatformId;
  name: string;
  color: string;
  textColor: string;
};

// El orden es el de la app.
export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: "website", name: "Website", color: "#4A90E2", textColor: "#ffffff" },
  { id: "tiktok", name: "TikTok", color: "#000000", textColor: "#ffffff" },
  { id: "snapchat", name: "SnapChat", color: "#fffc00", textColor: "#000000" },
  {
    id: "instagram",
    name: "Instagram",
    color: "#E1306C",
    textColor: "#ffffff",
  },
  { id: "twitter", name: "Twitter", color: "#1DA1F2", textColor: "#ffffff" },
  { id: "spotify", name: "Spotify", color: "#1DB954", textColor: "#000000" },
  {
    id: "soundcloud",
    name: "SoundCloud",
    color: "#FF5500",
    textColor: "#ffffff",
  },
];

const isHttp = (value: string) => /^https?:\/\//i.test(value);
const ensureProtocol = (value: string) =>
  isHttp(value) ? value : `https://${value}`;
const handle = (value: string) => value.replace(/^@/, "");

/** El usuario puede guardar una URL o solo su usuario; aquí se convierte siempre en URL. */
export function buildSocialUrl(
  platform: SocialPlatformId,
  raw: unknown,
): string {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return "";
  if (isHttp(value)) return value;

  switch (platform) {
    case "website":
      return ensureProtocol(value);
    case "instagram":
      return `https://instagram.com/${handle(value)}`;
    case "twitter":
      return `https://twitter.com/${handle(value)}`;
    case "tiktok":
      return `https://www.tiktok.com/@${handle(value)}`;
    case "snapchat":
      return `https://www.snapchat.com/add/${value}`;
    case "spotify":
      return value.includes("/") || value.includes(".")
        ? ensureProtocol(value)
        : `https://open.spotify.com/user/${value}`;
    case "soundcloud":
      return value.includes("/") || value.includes(".")
        ? ensureProtocol(value)
        : `https://soundcloud.com/${handle(value)}`;
  }
}

export type SocialLink = SocialPlatform & { href: string };

/**
 * Enlaces del perfil en el orden de la app. Solo se devuelven URLs http(s)
 * válidas, para que un valor raro nunca acabe en un `javascript:` o similar.
 */
export function socialLinksOf(links: unknown): SocialLink[] {
  const record =
    links && typeof links === "object"
      ? (links as Record<string, unknown>)
      : {};

  return SOCIAL_PLATFORMS.flatMap((platform) => {
    const built = buildSocialUrl(platform.id, record[platform.id]);
    if (!built) return [];
    try {
      const url = new URL(built);
      return url.protocol === "http:" || url.protocol === "https:"
        ? [{ ...platform, href: url.toString() }]
        : [];
    } catch {
      return [];
    }
  });
}

export type BadgeType = "verified" | "pro";

/** El dorado (verificado) gana al azul (pro); pro solo mientras no caduque. */
export function resolveBadge(
  source:
    | {
        isVerified?: boolean | null;
        isPro?: boolean | null;
        proExpiresAt?: string | null;
      }
    | null
    | undefined,
  now: Date = new Date(),
): BadgeType | null {
  if (!source) return null;
  if (source.isVerified) return "verified";
  if (source.isPro) return "pro";
  if (
    source.proExpiresAt &&
    new Date(source.proExpiresAt).getTime() > now.getTime()
  ) {
    return "pro";
  }
  return null;
}
