"use client";

import Image from "next/image";
import Link from "next/link";
import { LEGAL_IDS, legalPath } from "@/lib/legal";
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StoreButtons from "./StoreButtons";
import ContentBackdrop from "./ContentBackdrop";
import { useI18n } from "@/components/i18n/LocaleProvider";

gsap.registerPlugin(ScrollTrigger);

const HOME_CTA_KEYS = {
  line1: "cta.line1",
  line2: "cta.line2",
  text: "cta.text",
};

export default function FinalCta({
  keys = HOME_CTA_KEYS,
  actions,
  backdrop = "/app/home.webp",
  cool = false,
}: {
  keys?: typeof HOME_CTA_KEYS;
  /** Acciones bajo el texto. Por defecto, los botones de las tiendas. */
  actions?: ReactNode;
  backdrop?: string;
  /** Fondo azul frío y viñeteado, como el hero de Backstage. */
  cool?: boolean;
}) {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // La card crece hasta casi ocupar la pantalla, como una puerta que se abre
        gsap.fromTo(
          "[data-cta-card]",
          { scale: 0.86, borderRadius: "64px 64px 0 0", transformOrigin: "50% 100%" },
          {
            scale: 1,
            borderRadius: "40px 40px 0 0",
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
      <section ref={root} className="px-0 md:px-5">
        <div
          data-cta-card
          className="relative flex min-h-[100svh] md:min-h-[84svh] flex-col items-center justify-center overflow-hidden rounded-t-[40px] bg-raised px-6 pb-16 pt-[clamp(8rem,16vw,13rem)] text-center"
        >
          {/* Fondo tomado de la captura real de la app */}
          {cool ? (
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="absolute left-1/2 top-[-12%] h-[120%] w-[150%] max-w-[2200px] -translate-x-1/2 bg-cover bg-top opacity-[0.7]"
                style={{
                  backgroundImage: `url(${backdrop})`,
                  filter: "blur(70px) saturate(1.7) hue-rotate(200deg)",
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_30%,transparent,rgba(0,0,0,0.55)_70%,#000_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-b from-transparent to-black" />
            </div>
          ) : (
            <ContentBackdrop src={backdrop} />
          )}
          <h2 className="font-display relative text-[clamp(3.4rem,11vw,11rem)] font-bold leading-[0.88]">
            <span data-cta-line className="line-mask">
              <span>{t(keys.line1)}</span>
            </span>
            <span data-cta-line className="line-mask">
              <span>{t(keys.line2)}</span>
            </span>
          </h2>
          <p className="relative mt-8 max-w-[40ch] text-lg text-white/70 md:text-xl">
            {t(keys.text)}
          </p>
          {actions ?? (
            <StoreButtons className="relative mt-10 justify-center" />
          )}
        </div>
      </section>
      <footer className="mx-auto flex w-full max-w-[1800px] flex-col items-center justify-between gap-6 px-[clamp(1.25rem,3vw,3.5rem)] pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10 text-center text-sm text-muted md:flex-row md:items-center md:py-12 md:text-left">
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
        <div className="flex flex-col items-center gap-3 md:items-end">
          <nav
            aria-label="Legal"
            className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-white/60 md:justify-end"
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
          <p className="md:text-right">{t("footer.text")}</p>
        </div>
      </footer>
    </>
  );
}
