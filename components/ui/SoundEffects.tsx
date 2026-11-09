"use client";

import { useEffect } from "react";
import { playSound } from "@/lib/sounds";

const HOVER = "[data-card], [data-hover-sound]";

/**
 * Sonidos globales por delegación de eventos.
 * Desactivar en un elemento: data-sound="off". Hover extra: data-hover-sound.
 */
export function SoundEffects() {
  useEffect(() => {
    const off = (el: Element | null) => !!el?.closest('[data-sound="off"]');

    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t || off(t)) return;
      const btn = t.closest<HTMLElement>('button, [role="tab"], [role="button"]');
      if (btn) {
        if (!(btn as HTMLButtonElement).disabled) playSound("buzz");
        return;
      }
      if (t.closest("a[href]")) playSound("bubbleSelect");
    };

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const t = (e.target as Element | null)?.closest(HOVER);
      if (!t || off(t)) return;
      const from = (e.relatedTarget as Element | null)?.closest?.(HOVER);
      if (from === t) return;
      playSound("hover", 120);
    };

    document.addEventListener("click", onClick);
    document.addEventListener("pointerover", onOver);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onOver);
    };
  }, []);

  return null;
}
