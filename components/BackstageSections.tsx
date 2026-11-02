"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "@/components/i18n/LocaleProvider";
import ContentBackdrop from "@/components/ContentBackdrop";
import {
  CalendarIcon,
  CheckIcon,
  GlobalIcon,
  SmartphoneIcon,
  UsersGroupIcon,
  WidgetIcon,
} from "@/components/icons/solar";
import {
  StepChoose,
  StepRequest,
  StepSell,
  VisEvents,
  VisStats,
  VisTickets,
} from "@/components/BackstageVisuals";

gsap.registerPlugin(ScrollTrigger);

const SECTION =
  "mx-auto w-full max-w-[1800px] scroll-mt-24 px-[clamp(1.25rem,3vw,3.5rem)] pb-[clamp(5rem,10vw,10rem)] pt-[clamp(3rem,7vw,7rem)]";
const CARD =
  "relative overflow-hidden rounded-[36px] border border-line bg-raised p-6 md:p-8";

/** Animación de las secciones: titular por líneas, texto y tarjetas que entran con el scroll. */
function useReveal(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-sec-line] > span", {
          yPercent: 110,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: "[data-sec-head]", start: "top 85%" },
        });
        gsap.from("[data-sec-desc]", {
          opacity: 0,
          y: 24,
          duration: 1.2,
          delay: 0.35,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-sec-head]", start: "top 85%" },
        });
        gsap.utils.toArray<HTMLElement>("[data-sec-card]").forEach((card) => {
          gsap.fromTo(
            card,
            { y: 120, scale: 0.94, opacity: 0 },
            {
              y: 0,
              scale: 1,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 100%",
                end: "top 62%",
                scrub: true,
              },
            },
          );
        });
      });
    }, root);
    return () => ctx.revert();
  }, [root]);
}

function Head({ l1, l2, sub }: { l1: string; l2: string; sub: string }) {
  return (
    <div
      data-sec-head
      className="mb-[clamp(2.5rem,4.5vw,4.5rem)] md:flex md:items-end md:justify-between md:gap-12"
    >
      <h2 className="font-display text-[clamp(2.75rem,6.5vw,6.5rem)] font-bold leading-[0.9]">
        <span data-sec-line className="line-mask">
          <span>{l1}</span>
        </span>
        <span data-sec-line className="line-mask">
          <span>{l2}</span>
        </span>
      </h2>
      <p
        data-sec-desc
        className="mt-6 max-w-[28ch] text-lg text-muted md:mb-3 md:mt-0 md:shrink-0 md:text-xl lg:text-2xl"
      >
        {sub}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Web y app                                                            */
/* ------------------------------------------------------------------ */

function DeviceTag({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-xl">
      {icon}
      {label}
    </span>
  );
}

export function BackstageDevices() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} id="web-app" className={SECTION}>
      <Head
        l1={t("backstage.devices.head1")}
        l2={t("backstage.devices.head2")}
        sub={t("backstage.devices.sub")}
      />
      <div
        data-sec-card
        className={`${CARD} flex flex-col items-center gap-10 px-5 pb-0 pt-8 md:px-10 md:pt-10 lg:flex-row lg:items-end lg:gap-0`}
      >
        <ContentBackdrop src="/app/home.webp" />
        {/* Navegador: ocupa la tarjeta y se corta por abajo, como el panel del hero. */}
        <div className="relative z-10 flex w-full flex-col gap-4 lg:w-[68%] lg:pr-6">
          <DeviceTag
            icon={<GlobalIcon aria-hidden className="h-4 w-4" />}
            label={t("backstage.devices.web")}
          />
          <div className="h-[420px] overflow-hidden rounded-t-[24px] bg-black/55 shadow-[0_-30px_100px_rgba(0,0,0,0.5)] ring-1 ring-white/15 backdrop-blur-md md:h-[520px]">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-white/20"
                />
              ))}
            </div>
            <div className="grid gap-3 p-3 sm:grid-cols-2 md:p-4">
              <div className="h-[300px]">
                <VisStats />
              </div>
              <div className="hidden h-[300px] sm:block">
                <VisEvents />
              </div>
            </div>
            <div className="hidden h-[200px] px-4 md:block">
              <VisTickets />
            </div>
          </div>
        </div>

        {/* Móvil: sube desde abajo y se solapa con el navegador. */}
        <div className="relative z-20 flex flex-col items-center gap-4 lg:-ml-24 lg:w-[32%]">
          <DeviceTag
            icon={<SmartphoneIcon aria-hidden className="h-4 w-4" />}
            label={t("backstage.devices.app")}
          />
          <div className="w-[min(300px,76vw)] rounded-t-[46px] bg-black p-2.5 pb-0 shadow-[0_-30px_100px_rgba(0,0,0,0.6)] ring-1 ring-white/25">
            <div className="flex h-[520px] flex-col rounded-t-[36px] bg-[#0a0a0a] px-3 pt-4 ring-1 ring-white/10 md:h-[600px]">
              <span className="mx-auto mb-3 h-6 w-24 rounded-full bg-black ring-1 ring-white/10" />
              <p className="font-display px-1 text-2xl font-semibold text-white">
                {t("orgs.panel.overviewTitle")}
              </p>
              <div className="min-h-0 flex-1 overflow-hidden">
                <VisEvents />
              </div>
              <nav className="mb-3 mt-2 flex items-center justify-around rounded-full bg-white/[0.08] py-3 text-white/50">
                <WidgetIcon aria-hidden className="h-5 w-5 text-white" />
                <CalendarIcon aria-hidden className="h-5 w-5" />
                <UsersGroupIcon aria-hidden className="h-5 w-5" />
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Cómo funciona (tres tarjetas, sin scroll horizontal)                 */
/* ------------------------------------------------------------------ */

export function BackstageSteps() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const steps: { n: string; visual: ReactNode }[] = [
    { n: "01", visual: <StepRequest /> },
    { n: "02", visual: <StepChoose /> },
    { n: "03", visual: <StepSell /> },
  ];

  return (
    <section ref={root} id="como" className={SECTION}>
      <Head
        l1={t("backstage.how.title1")}
        l2={t("backstage.how.title2")}
        sub={t("backstage.how.sub")}
      />
      <div className="grid grid-cols-1 gap-[clamp(1rem,1.4vw,1.5rem)] lg:grid-cols-3">
        {steps.map((s) => (
          <article
            key={s.n}
            data-sec-card
            className={`${CARD} flex min-h-[520px] flex-col`}
          >
            <span
              aria-hidden
              className="font-display pointer-events-none absolute -right-4 -top-8 text-[13rem] font-bold leading-none text-white/[0.05]"
            >
              {s.n}
            </span>
            <span className="font-display relative text-xl font-semibold text-white/50">
              {s.n}
            </span>
            <h3 className="font-display relative mt-3 text-[clamp(2.2rem,3.4vw,3.6rem)] font-bold leading-none">
              {t(`backstage.step.${s.n}.title`)}
            </h3>
            <p className="relative mt-4 max-w-[34ch] text-base leading-relaxed text-muted md:text-lg">
              {t(`backstage.step.${s.n}.body`)}
            </p>
            <div className="relative mt-8 flex min-h-[220px] flex-1 items-center">
              {s.visual}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Precio                                                               */
/* ------------------------------------------------------------------ */

export function BackstagePricing({ onRequest }: { onRequest: () => void }) {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} id="precio" className={SECTION}>
      <div data-sec-card className={`${CARD} md:p-12`}>
        <ContentBackdrop src="/app/home-list.jpg" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col items-start">
            <span className="mb-6 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-xl">
              {t("backstage.pricing.eyebrow")}
            </span>
            <h2 className="font-display text-[clamp(2.75rem,5vw,5rem)] font-bold leading-[0.95]">
              {t("backstage.pricing.title")}
            </h2>
            <p className="font-display mt-6 text-[clamp(1.8rem,3vw,3rem)] font-semibold leading-none">
              {t("backstage.pricing.price")}
            </p>
            <p className="mt-3 text-base text-white/60 md:text-lg">
              {t("backstage.pricing.priceNote")}
            </p>
            <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-white/75 md:text-lg">
              {t("backstage.pricing.text")}
            </p>
            <ul className="mt-8 grid w-full gap-x-8 gap-y-3.5 sm:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <li
                  key={n}
                  className="flex items-start gap-3 text-[15px] text-white/80"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#30d158] text-black">
                    <CheckIcon
                      aria-hidden
                      className="h-3.5 w-3.5"
                      strokeWidth={2.4}
                    />
                  </span>
                  {t(`backstage.pricing.i${n}`)}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onRequest}
              className="mt-10 inline-flex h-[58px] items-center gap-3 rounded-full bg-white px-7 text-[17px] font-semibold text-black transition-[transform,translate,scale,box-shadow] duration-300 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-[0_14px_44px_-12px_rgba(255,255,255,0.55)] active:translate-y-0 active:scale-[0.97]"
            >
              {t("backstage.cta")}
            </button>
          </div>
          <div className="hidden h-[460px] flex-col justify-center gap-3 lg:flex">
            <div className="h-[220px]">
              <VisStats />
            </div>
            <div className="h-[220px]">
              <VisEvents />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Qué es Backstage (scroll normal, sin animación fijada)               */
/* ------------------------------------------------------------------ */

export function BackstageIntro() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const text = t("backstage.manifesto.text");
  const cut = text.indexOf(". ");
  const first = cut === -1 ? text : text.slice(0, cut + 1);
  const rest = cut === -1 ? "" : text.slice(cut + 2);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-intro]", {
          opacity: 0,
          y: 32,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="mx-auto w-full max-w-[1800px] px-[clamp(1.25rem,3vw,3.5rem)] py-[clamp(5rem,10vw,10rem)]"
    >
      <p
        data-intro
        className="mb-10 text-sm font-medium uppercase tracking-[0.18em] text-muted"
      >
        {t("backstage.manifesto.eyebrow")}
      </p>
      <p
        data-intro
        className="font-display max-w-[24ch] text-balance text-[clamp(2.4rem,5.4vw,5.6rem)] font-medium leading-[1.02] md:max-w-[28ch]"
      >
        {first}
      </p>
      {rest ? (
        <p
          data-intro
          className="font-display mt-6 max-w-[34ch] text-balance text-[clamp(1.4rem,2.6vw,2.6rem)] font-medium leading-[1.1] text-white/45"
        >
          {rest}
        </p>
      ) : null}
    </section>
  );
}
