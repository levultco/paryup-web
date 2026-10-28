// Color de acento del avatar para el banner automático del perfil.
// Es el mismo cálculo que `paryup-app/src/lib/profile/avatarAccentColor.ts`: se reduce la
// imagen a 24×24, se agrupan los píxeles por tono (cubos de 30°), gana el tono con más
// peso (saturación × cercanía a luminosidad media) y se devuelve con luminosidad fija 0,36.

export const AVATAR_SAMPLE_SIZE = 24;
export const DEFAULT_AVATAR_ACCENT = "#8C7569";
export const FALLBACK_BANNER_COLOR = "#303038";

function toHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

function hslToHex(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  const hex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/** `pixels` son los bytes RGBA (sin premultiplicar) de una imagen de 24×24. */
export function accentFromRgba(
  pixels: ArrayLike<number>,
  size = AVATAR_SAMPLE_SIZE,
): string | null {
  const buckets = new Map<
    number,
    { weight: number; sinSum: number; cosSum: number; sSum: number }
  >();

  for (let index = 0; index < size * size; index += 1) {
    const offset = index * 4;
    if (pixels[offset + 3] < 128) continue;
    const { h, s, l } = toHsl(
      pixels[offset],
      pixels[offset + 1],
      pixels[offset + 2],
    );
    if (s < 0.2 || l < 0.12 || l > 0.9) continue;

    const weight = s * (1 - Math.abs(l - 0.5));
    const key = Math.floor(h / 30) % 12;
    const bucket = buckets.get(key) ?? {
      weight: 0,
      sinSum: 0,
      cosSum: 0,
      sSum: 0,
    };
    const radians = (h * Math.PI) / 180;
    bucket.weight += weight;
    bucket.sinSum += Math.sin(radians) * weight;
    bucket.cosSum += Math.cos(radians) * weight;
    bucket.sSum += s * weight;
    buckets.set(key, bucket);
  }

  let best: {
    weight: number;
    sinSum: number;
    cosSum: number;
    sSum: number;
  } | null = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.weight > best.weight) best = bucket;
  }
  if (!best || best.weight <= 0) return null;

  const hue =
    ((Math.atan2(best.sinSum, best.cosSum) * 180) / Math.PI + 360) % 360;
  const saturation = Math.min(0.75, Math.max(0.4, best.sSum / best.weight));
  return hslToHex(hue, saturation, 0.36);
}
