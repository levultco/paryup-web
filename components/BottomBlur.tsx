"use client";

import { useEffect, useRef } from "react";
import ProgressiveBlur from "./ProgressiveBlur";

const FADE_DISTANCE = 480; // px antes del final en los que el desenfoque se apaga

/** Desenfoque fijo abajo que se retira al llegar al final de la página, para que el footer se lea nítido. */
export default function BottomBlur() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const root = document.documentElement;
      const left = root.scrollHeight - window.innerHeight - window.scrollY;
      const visible = Math.max(0, Math.min(1, left / FADE_DISTANCE));
      // opacity < 1 convierte al contenedor en "backdrop root" y el blur deja de ver la página: se desliza hacia fuera.
      el.style.transform = `translateY(${(1 - visible) * 100}%)`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[140] h-44"
    >
      <ProgressiveBlur className="absolute inset-0" />
    </div>
  );
}
