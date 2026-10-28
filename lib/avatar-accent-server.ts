import "server-only";
import sharp from "sharp";
import { AVATAR_SAMPLE_SIZE, accentFromRgba } from "@/lib/avatar-accent";

const MAX_BYTES = 6 * 1024 * 1024;
const TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { value: string | null; at: number }>();

/** La URL sale de un campo del perfil: solo http(s) y nunca hacia la red interna. */
function isFetchable(raw: string) {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      host.endsWith(".internal")
    ) {
      return false;
    }
    if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
    if (host === "[::1]" || host.startsWith("[fc") || host.startsWith("[fd"))
      return false;
    return true;
  } catch {
    return false;
  }
}

/** Acento del avatar (hex) o `null` si no se puede calcular. Nunca lanza. */
export async function getAvatarAccent(uri: string | null | undefined) {
  if (!uri || !isFetchable(uri)) return null;

  const hit = cache.get(uri);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  let value: string | null = null;
  try {
    const res = await fetch(uri, { signal: AbortSignal.timeout(4000) });
    const length = Number(res.headers.get("content-length") ?? 0);
    if (res.ok && length <= MAX_BYTES) {
      const bytes = Buffer.from(await res.arrayBuffer());
      if (bytes.length <= MAX_BYTES) {
        const raw = await sharp(bytes)
          .resize(AVATAR_SAMPLE_SIZE, AVATAR_SAMPLE_SIZE, { fit: "fill" })
          .ensureAlpha()
          .raw()
          .toBuffer();
        value = accentFromRgba(raw);
      }
    }
  } catch {
    value = null;
  }

  cache.set(uri, { value, at: Date.now() });
  return value;
}
