"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "@/components/i18n/LocaleProvider";

gsap.registerPlugin(ScrollTrigger);

// Las palabras marcadas con * van en negrita (el texto está en lib/i18n).

// Mismos colores que el degradado del botón "Mis Entradas" (paleta pary).
// --g (0 → 1) los mezcla con blanco: a 0 la palabra se ve igual que las demás, a 1 muestra el degradado completo.
const GRADIENT = `linear-gradient(90deg, ${[
  "rgb(255,176,5)",
  "rgb(250,61,29)",
  "rgb(198,121,196)",
  "rgb(70,138,255)",
]
  .map((c) => `color-mix(in srgb, ${c} calc(var(--g) * 100%), white)`)
  .join(", ")})`;

export default function Manifesto() {
  const { t, locale } = useI18n();
  const text = t("manifesto.text");
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Las palabras suben a su sitio y se encienden mientras la escena está fijada
        gsap.fromTo(
          "[data-word]",
          { opacity: 0.12, yPercent: 35, "--g": 0 },
          {
            opacity: 1,
            yPercent: 0,
            "--g": 1,
            ease: "none",
            stagger: 0.08,
            scrollTrigger: {
              trigger: root.current,
              start: "top 55%",
              end: "bottom 104%",
              scrub: true,
            },
          },
        );
      });
    }, root);
    return () => ctx.revert();
  }, [locale]);

  return (
    <section
      ref={root}
      className="relative z-20 h-[150svh] motion-reduce:h-auto motion-reduce:py-24"
    >
      <div className="sticky top-0 flex h-[100svh] items-center motion-reduce:static motion-reduce:h-auto">
        <div className="mx-auto w-full max-w-[1800px] px-[clamp(1.25rem,3vw,3.5rem)]">
          <p className="mb-10 text-sm font-medium uppercase tracking-[0.18em] text-muted">
            {t("manifesto.eyebrow")}
          </p>
          <p
            data-manifesto-text
            className="font-display text-[clamp(2.1rem,4.6vw,5rem)] font-medium leading-[1.02]"
          >
            {text.split(" ").map((w, i) => {
              const hl = w.startsWith("*");
              const word = w.replaceAll("*", "");
              // El hueco entre palabras es un margen, no un espacio de texto: así no
              // se pierde aunque el navegador colapse los espacios entre inline-block
              // que se animan. Las resaltadas llevan relleno (para no recortar el
              // degradado) y se compensa con margen negativo a la izquierda y menos a la derecha.
              return (
                <span
                  key={`${locale}-${i}`}
                  data-word
                  className={
                    hl
                      ? "-my-[0.1em] -ml-[0.1em] mr-[0.17em] inline-block bg-clip-text p-[0.1em] font-bold text-transparent"
                      : "mr-[0.27em] inline-block"
                  }
                  style={
                    hl
                      ? ({
                          backgroundImage: GRADIENT,
                          "--g": 0,
                        } as CSSProperties)
                      : undefined
                  }
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
