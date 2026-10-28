"use client";

import Image from "next/image";
import Link from "next/link";
import { LEGAL_IDS, legalPath } from "@/lib/legal";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StoreButtons from "./StoreButtons";
import ContentBackdrop from "./ContentBackdrop";
import { useI18n } from "@/components/i18n/LocaleProvider";

gsap.registerPlugin(ScrollTrigger);

export default function FinalCta() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // La card crece hasta casi ocupar la pantalla, como una puerta que se abre
        gsap.fromTo(
          "[data-cta-card]",
          { scale: 0.86, borderRadius: "64px" },
          {
            scale: 1,
            borderRadius: "40px",
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "top 20%",
              scrub: true,
            },
          },
        );
        gsap.from("[data-cta-line] > span", {
          yPercent: 110,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 60%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section ref={root} className="px-3 pb-3 md:px-5 md:pb-5">
        <div
          data-cta-card
          className="relative flex min-h-[76svh] flex-col items-center justify-center overflow-hidden rounded-[40px] border border-line bg-raised px-6 py-16 text-center"
        >
          {/* Fondo tomado de la captura real de la app */}
          <ContentBackdrop src="/app/home.webp" />
          <Image
            src="/brand/icon.png"
            alt=""
            width={88}
            height={88}
            className="relative mb-10 rounded-[22px] ring-1 ring-white/20"
          />
          <h2 className="font-display relative text-[clamp(3.4rem,11vw,11rem)] font-bold leading-[0.88]">
            <span data-cta-line className="line-mask">
              <span>{t("cta.line1")}</span>
            </span>
            <span data-cta-line className="line-mask">
              <span>{t("cta.line2")}</span>
            </span>
          </h2>
          <p className="relative mt-8 max-w-[40ch] text-lg text-white/70 md:text-xl">
            {t("cta.text")}
          </p>
          <StoreButtons className="relative mt-10 justify-center" />
        </div>
      </section>
      <footer className="mx-auto w-full max-w-[1800px] px-[clamp(1.25rem,3vw,3.5rem)] flex flex-col items-start justify-between gap-4 py-10 text-sm text-muted md:flex-row md:py-12 md:items-center">
        <div className="flex items-center gap-2.5">
          <Image
            src="/brand/icon.png"
            alt=""
            width={28}
            height={28}
            className="rounded-lg ring-1 ring-white/15"
          />
          <span className="font-display text-base font-semibold text-fg">
            ParyUp
          </span>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <nav
            aria-label="Legal"
            className="flex flex-wrap gap-x-5 gap-y-2 text-white/60"
          >
            {LEGAL_IDS.map((id) => (
              <Link
                key={id}
                href={legalPath(id)}
                className="transition hover:text-white"
              >
                {t(`legal.name.${id}`)}
              </Link>
            ))}
          </nav>
          <p>{t("footer.text")}</p>
        </div>
      </footer>
    </>
  );
}
