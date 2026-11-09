"use client";

/** Sonidos de la web (public/sounds). */
export type SoundName =
  | "buzz" // botones y pestañas
  | "bubbleSelect" // enlaces
  | "pick" // seleccionar fecha
  | "hover" // cards y elementos con data-hover-sound
  | "notch" // recorrer la gráfica
  | "chime" // (sin uso)
  | "deny" // notificación: error
  | "warning" // notificación: aviso
  | "bell"; // notificación: info

const VOLUME: Partial<Record<SoundName, number>> = {
  hover: 0.25,
  notch: 0.3,
};

const cache = new Map<SoundName, HTMLAudioElement>();
const lastPlayed = new Map<SoundName, number>();

/** Reproduce un sonido; `minGap` evita ráfagas (ms entre reproducciones). */
export function playSound(name: SoundName, minGap = 40) {
  if (typeof window === "undefined") return;
  const now = performance.now();
  if (now - (lastPlayed.get(name) ?? 0) < minGap) return;
  lastPlayed.set(name, now);
  try {
    let base = cache.get(name);
    if (!base) {
      base = new Audio(`/sounds/${name}.wav`);
      base.preload = "auto";
      cache.set(name, base);
    }
    const a = base.cloneNode() as HTMLAudioElement;
    a.volume = VOLUME[name] ?? 0.5;
    void a.play().catch(() => {});
  } catch {
    /* sin audio disponible */
  }
}
