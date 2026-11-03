"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "@/components/i18n/LocaleProvider";

gsap.registerPlugin(ScrollTrigger);

const POSTERS = [
  { src: "/events/neon-techno.jpg", alt: "Neon Techno Rave" },
  { src: "/events/latin-night.jpg", alt: "Latin Night" },
  { src: "/events/unvrs-opening.jpg", alt: "UNVRS Opening Night" },
  { src: "/events/hiphop-allstars.jpg", alt: "Hip Hop All Stars" },
  { src: "/events/afrohouse.jpg", alt: "Afro House Special" },
  { src: "/events/underground.jpg", alt: "Underground Session" },
];

/** Una fila de carteles de fiesta: da ambiente y enseña qué tipo de eventos hay en la app. */
export default function Posters() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const head = gsap.utils.toArray<HTMLElement>("[data-poster-head] > *");
        const cards = gsap.utils.toArray<HTMLElement>("[data-poster]");
        const floats = gsap.utils.toArray<HTMLElement>("[data-poster-float]");

        // Al entrar: el titular sube y los carteles salen desde el centro y se abren en abanico
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
        });
        tl.from(head, { y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.1 });
        tl.from(
          cards,
          {
            opacity: 0,
            y: 160,
            scale: 0.8,
            rotate: (i) => (i - (cards.length - 1) / 2) * 7,
            transformOrigin: "50% 100%",
            duration: 1.5,
            ease: "expo.out",
            stagger: { each: 0.09, from: "center" },
          },
          0.2,
        );
        // Después, cada cartel flota con su propio ritmo
        tl.add(() => {
          floats.forEach((el, i) => {
            gsap.to(el, {
              y: i % 2 ? -10 : 10,
              rotate: i % 2 ? 0.8 : -0.8,
              duration: 2.6 + (i % 3) * 0.5,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: i * 0.2,
            });
          });
        }, ">-0.4");
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative overflow-hidden py-[clamp(5rem,10vw,9rem)]">
      <div data-poster-head className="mx-auto mb-[clamp(2.5rem,5vw,4.5rem)] max-w-3xl px-[clamp(1.25rem,3vw,3.5rem)] text-center">
        <p className="mb-5 text-sm font-medium uppercase tracking-[0.18em] text-muted">
          {t("posters.eyebrow")}
        </p>
        <h2 className="font-display text-[clamp(2.5rem,5.5vw,5.25rem)] font-bold leading-[0.95]">
          {t("posters.title1")}{" "}
          <span className="text-white/40">{t("posters.title2")}</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-base leading-relaxed text-muted md:text-lg">
          {t("posters.sub")}
        </p>
      </div>

      <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1.25rem,3vw,3.5rem)] pb-10 [scrollbar-width:none] lg:justify-center lg:overflow-visible lg:gap-5 lg:pb-14 [&::-webkit-scrollbar]:hidden">
        {POSTERS.map((p, i) => (
          <li
            key={p.src}
            data-poster
            className={`group w-[62vw] max-w-[260px] shrink-0 snap-center lg:w-[min(13vw,220px)] ${i % 2 ? "lg:translate-y-10" : ""}`}
          >
            <div data-poster-float className="will-change-transform">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] border border-line shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-2 group-hover:scale-[1.04]">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 13vw, 62vw"
                  className="object-cover"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
