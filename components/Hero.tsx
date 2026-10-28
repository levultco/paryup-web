"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StoreButtons from "./StoreButtons";
import { useI18n } from "@/components/i18n/LocaleProvider";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const SCREEN = "/app/home.webp";
const INTRO_KEY = "paryup_intro_seen";

export default function Hero() {
  const { t } = useI18n();
  // La escena y la tarjeta la necesitan nada más cargar
  preload(SCREEN, { as: "image", fetchPriority: "high" });
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // La entrada solo se ve la primera vez de la sesión; al volver desde otra página no se repite
        let seen = false;
        try {
          seen = sessionStorage.getItem(INTRO_KEY) === "1";
          sessionStorage.setItem(INTRO_KEY, "1");
        } catch {}

        if (!seen) {
          gsap.from("[data-hero-line] > span", {
            yPercent: 110,
            duration: 1.3,
            ease: "expo.out",
            stagger: 0.09,
            delay: 0.3,
          });
          gsap.from("[data-hero-fade]", {
            y: 24,
            opacity: 0,
            duration: 1,
            ease: "expo.out",
            stagger: 0.08,
            delay: 0.8,
          });
          gsap.from("[data-card]", {
            y: 120,
            opacity: 0,
            duration: 1.4,
            ease: "expo.out",
            delay: 0.7,
          });
        }

        // La pantalla sube un poco más rápido que la página
        gsap.to("[data-card]", {
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-card]",
            start: "top 85%",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center px-[clamp(1.25rem,3vw,3.5rem)] pb-0 pt-28 md:pt-32"
    >
      <HeroScene screen={SCREEN} />

      <div className="relative z-20 flex flex-col items-center text-center">
        <h1 className="font-display text-[clamp(3.2rem,8vw,8.4rem)] font-bold leading-[0.9]">
          <span data-hero-line className="line-mask">
            <span>{t("hero.line1")}</span>
          </span>
          <span data-hero-line className="line-mask">
            <span>{t("hero.line2")}</span>
          </span>
        </h1>
        <p
          data-hero-fade
          className="mt-6 max-w-[34ch] text-lg leading-snug text-white/60 md:text-2xl"
        >
          {t("hero.sub")}
        </p>
        <div data-hero-fade className="mt-8">
          <StoreButtons className="justify-center" />
        </div>
      </div>

      {/* Una sola pantalla real de la app, saliendo desde abajo */}
      {/* El móvil se desvanece con una máscara (sin capa encima ni recorte duro); el relleno de arriba deja sitio al parallax */}
      <div
        className="pointer-events-none relative z-10 mt-[calc(3rem-20svh)] h-[calc(62svh+20svh)] min-h-[calc(420px+20svh)] w-full max-w-[1240px] overflow-hidden pt-[20svh] md:mt-[calc(4rem-20svh)]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0, #000 calc(100% - 38svh), transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000 0, #000 calc(100% - 38svh), transparent 100%)",
        }}
      >
        <div data-card className="relative mx-auto w-[min(440px,78vw)]">
          {/* Botones laterales: acción y volumen a la izquierda, encendido a la derecha */}
          <span
            aria-hidden
            className="absolute -left-[3px] top-[104px] h-[32px] w-[4px] rounded-l-[3px] bg-gradient-to-r from-[#55555a] to-[#1c1c1e]"
          />
          <span
            aria-hidden
            className="absolute -left-[3px] top-[160px] h-[62px] w-[4px] rounded-l-[3px] bg-gradient-to-r from-[#55555a] to-[#1c1c1e]"
          />
          <span
            aria-hidden
            className="absolute -left-[3px] top-[236px] h-[62px] w-[4px] rounded-l-[3px] bg-gradient-to-r from-[#55555a] to-[#1c1c1e]"
          />
          <span
            aria-hidden
            className="absolute -right-[3px] top-[190px] h-[96px] w-[4px] rounded-r-[3px] bg-gradient-to-l from-[#55555a] to-[#1c1c1e]"
          />

          {/* Marco de titanio: borde metálico fino, bisel negro y pantalla */}
          <div className="rounded-t-[64px] bg-[linear-gradient(135deg,#a1a1a6_0%,#3b3b3f_18%,#1a1a1c_48%,#47474b_78%,#9c9ca1_100%)] p-[3px] shadow-[0_0_120px_-10px_rgba(255,255,255,0.16)]">
            <div className="rounded-t-[61px] bg-black p-[9px] pb-0">
              <div className="relative overflow-hidden rounded-t-[52px]">
                <Image
                  src={SCREEN}
                  alt={t("hero.alt")}
                  width={920}
                  height={2000}
                  sizes="(max-width: 768px) 76vw, 420px"
                  priority
                  className="h-auto w-full"
                />
                {/* Isla dinámica con la lente de la cámara */}
                <div
                  aria-hidden
                  className="absolute left-1/2 top-[12px] h-[28px] w-[29%] -translate-x-1/2 rounded-full bg-black"
                >
                  <span className="absolute right-[12%] top-1/2 size-[10px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#2b3a66,#07090f_70%)] ring-1 ring-white/10" />
                </div>
                {/* Reflejo suave en el cristal */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_28%,transparent_45%)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
