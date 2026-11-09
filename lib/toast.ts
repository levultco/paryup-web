"use client";

import { sileo } from "sileo";
import { playSound, type SoundName } from "@/lib/sounds";

export type ToastTone = "success" | "error" | "warning" | "info";

/** Lanza una notificación Sileo con el texto como título. */
const TONE_SOUND: Record<ToastTone, SoundName> = {
  success: "warning",
  error: "deny",
  warning: "warning",
  info: "bell",
};

export function notify(tone: ToastTone, text: string, description?: string) {
  const options = { title: text, ...(description ? { description } : {}) };
  playSound(TONE_SOUND[tone], 150);
  return sileo[tone](options);
}
