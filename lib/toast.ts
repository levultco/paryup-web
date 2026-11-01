"use client";

import { sileo } from "sileo";

export type ToastTone = "success" | "error" | "warning" | "info";

/** Lanza una notificación Sileo con el texto como título. */
export function notify(tone: ToastTone, text: string, description?: string) {
  const options = { title: text, ...(description ? { description } : {}) };
  return sileo[tone](options);
}
