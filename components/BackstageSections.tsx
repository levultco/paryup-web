"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import NumberFlow from "@number-flow/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "@/components/i18n/LocaleProvider";
import BackstageCatalog from "@/components/BackstageCatalog";
import BackstageOverview from "@/components/BackstageOverview";
import ContentBackdrop from "@/components/ContentBackdrop";
import PhoneFrame from "@/components/PhoneFrame";
import { SealCheck } from "@/components/profile/VerifiedBadge";
import {
  ArrowRightUpIcon,
  CheckIcon,
  GlobalIcon,
  SmartphoneIcon,
} from "@/components/icons/solar";
import {
  Fade,
  StepChoose,
  StepRequest,
  StepSell,
  type StepMode,
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
        className={`${CARD} flex flex-col items-center gap-10 px-5 pb-0 pt-8 md:px-10 md:pb-0 md:pt-10 max-lg:justify-end lg:flex-row lg:items-end lg:gap-0`}
      >
        <ContentBackdrop src="/app/home.webp" cool />
        {/* Navegador: ocupa la tarjeta y se corta por abajo, como el panel del hero. */}
        <div className="relative z-10 flex w-full flex-col gap-4 lg:w-[68%] lg:pr-6">
          <DeviceTag
            icon={<GlobalIcon aria-hidden className="h-4 w-4" />}
            label={t("backstage.devices.web")}
          />
          <div className="relative h-[420px] overflow-hidden md:h-[560px]">
            <BackstageCatalog fill>
              <BackstageOverview />
            </BackstageCatalog>
          </div>
        </div>

        {/* Móvil: sube desde abajo y se solapa con el navegador. */}
        <div className="relative z-20 flex flex-col items-center lg:-ml-24 lg:w-[calc(32%+6rem)] lg:items-end">
          <div className="flex flex-col items-center gap-4 lg:items-end">
          <DeviceTag
            icon={<SmartphoneIcon aria-hidden className="h-4 w-4" />}
            label={t("backstage.devices.app")}
          />
          <div className="flex h-[420px] w-[min(340px,80vw)] items-start overflow-hidden md:h-[560px]">
            <PhoneFrame glow={false} fill className="h-[calc(100%+8px)] w-full shrink-0 [--pr:46px]">
              <Image
                src="/app/dashboard.webp"
                alt={t("backstage.devices.app")}
                fill
                sizes="340px"
                className="object-cover object-top"
              />
            </PhoneFrame>
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
  // La modalidad elegida en el paso 2 cambia también lo que se ve en el paso 3.
  const [mode, setMode] = useState<StepMode>("paryup");
  const fv = mode === "fv";
  const steps: { n: string; visual: ReactNode }[] = [
    { n: "01", visual: <StepRequest /> },
    { n: "02", visual: <StepChoose mode={mode} onChange={setMode} /> },
    { n: "03", visual: <StepSell mode={mode} /> },
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
            <div className="relative flex items-center gap-3">
              <span className="font-display flex size-9 items-center justify-center rounded-full bg-white text-[15px] font-semibold tabular-nums text-black">
                {Number(s.n)}
              </span>
              <span aria-hidden className="flex flex-1 gap-1.5">
                {steps.map((o) => (
                  <span
                    key={o.n}
                    className={`h-1 flex-1 rounded-full ${o.n <= s.n ? "bg-white/70" : "bg-white/10"}`}
                  />
                ))}
              </span>
            </div>
            <h3 className="font-display relative mt-8 text-[clamp(2rem,3vw,3.1rem)] font-bold leading-[1.02] tracking-[-0.03em]">
              {s.n === "03" && fv ? (
                <Fade block k="fv">{t("backstage.step.03.fv.title")}</Fade>
              ) : (
                <Fade block k={s.n}>{t(`backstage.step.${s.n}.title`)}</Fade>
              )}
            </h3>
            <p className="relative mt-3 max-w-[34ch] text-base leading-relaxed text-muted md:text-[17px]">
              {s.n === "03" && fv ? (
                <Fade block k="fv">{t("backstage.step.03.fv.body")}</Fade>
              ) : (
                <Fade block k={s.n}>{t(`backstage.step.${s.n}.body`)}</Fade>
              )}
            </p>
            <div className="relative mt-8 flex min-h-[240px] flex-1 items-end">
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

// Tarifa mensual por organización.
const BASE_PRICE = 400;
const MULTI_DISCOUNT = 0.2;
const MIN_ORGS = 2;
const MAX_ORGS = 10;

const euro = {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
} as const;

const stepBtn =
  "flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white transition-[transform,opacity] duration-100 active:scale-[0.92] disabled:opacity-30 disabled:active:scale-100";

function Tick({ muted, gold, delay }: { muted?: boolean; gold?: boolean; delay?: number }) {
  if (!muted)
    return <SealCheck glint color={gold ? "#FFC107" : undefined} delay={delay} className="h-6 w-6 shrink-0" />;
  return (
    <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/45">
      <ArrowRightUpIcon aria-hidden className="h-3 w-3" />
    </span>
  );
}

function Block({
  title,
  keys,
  muted,
}: {
  title: string;
  keys: string[];
  muted?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">{title}</h4>
      <ul className="space-y-2.5">
        {keys.map((k) => (
          <li
            key={k}
            className={`flex items-start gap-2.5 text-[15px] leading-snug ${
              muted ? "text-white/60" : "text-white/90"
            }`}
          >
            <Tick muted={muted} gold={k === "b1i2"} />
            {t(`backstage.pricing.${k}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Lo que incluye una organización: valor comercial, herramientas y lo que cambia según la operativa. */
function OneBody() {
  const { t } = useI18n();
  const n = (p: string, c: number) => Array.from({ length: c }, (_, i) => `${p}${i + 1}`);
  return (
    <div className="relative mt-8 space-y-7 border-t border-white/10 pt-7">
      <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
        <Block title={t("backstage.pricing.b1")} keys={n("b1i", 4)} />
        <Block title={t("backstage.pricing.b2")} keys={n("b2i", 3)} />
      </div>
      <div className="border-t border-white/10 pt-7">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Block title={t("backstage.pricing.b3p")} keys={n("b3pi", 5)} />
          <Block title={t("backstage.pricing.b3f")} keys={n("b3fi", 2)} muted />
        </div>
      </div>
    </div>
  );
}

function Plan({
  name,
  price,
  note,
  body,
  highlight,
  children,
}: {
  name: string;
  price: ReactNode;
  note: ReactNode;
  body: ReactNode;
  highlight?: boolean;
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <article
      data-sec-card
      className="relative flex flex-col overflow-hidden rounded-[36px] border border-line bg-raised p-7 md:p-9"
    >
      {highlight && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/[0.07] to-transparent"
        />
      )}
      <div className="relative flex items-center justify-between gap-3">
        <h3 className="font-display text-2xl font-semibold">{name}</h3>
        {highlight && (
          <span className="relative overflow-hidden rounded-full border border-white/35 bg-gradient-to-b from-[#3d9bff] to-[#0a84ff] px-4 py-1.5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
            <span
              aria-hidden
              className="pill-glint pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-transparent via-white/80 to-transparent"
            />
            <span className="relative">{t("backstage.pricing.off")}</span>
          </span>
        )}
      </div>
      <p className="relative mt-6 flex items-baseline gap-2">{price}</p>
      <div className="relative mt-3 flex min-h-[72px] flex-col justify-center gap-2 text-sm text-white/55">
        {note}
      </div>
      {children}
      <p className="relative mt-3 text-center text-sm text-white/50">{t("backstage.pricing.billed")}</p>
      {body}
    </article>
  );
}

export function BackstagePricing({ onRequest }: { onRequest: () => void }) {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const [orgs, setOrgs] = useState(3);
  const each = BASE_PRICE * (1 - MULTI_DISCOUNT);

  const bigPrice = "font-display text-[clamp(3rem,5vw,4.25rem)] font-bold leading-none tracking-[-0.03em]";
  const unit = "text-base font-semibold text-white/55";
  const cta = (primary: boolean) => (
    <button
      type="button"
      onClick={onRequest}
      className={`relative mt-6 flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold transition-transform duration-100 ease-out active:scale-[0.97] ${
        primary ? "bg-white text-black hover:bg-white/90" : "bg-white/10 text-white hover:bg-white/15"
      }`}
    >
      {t("backstage.cta")}
    </button>
  );

  return (
    <section ref={root} id="precio" className={SECTION}>
      <Head
        l1={t("backstage.pricing.h1")}
        l2={t("backstage.pricing.h2")}
        sub={t("backstage.pricing.priceNote")}
      />
      <div className="grid items-start gap-[clamp(1rem,1.4vw,1.5rem)] lg:grid-cols-2">
        <Plan
          name={t("backstage.pricing.one")}
          body={<OneBody />}
          price={
            <>
              <span className={bigPrice}>{BASE_PRICE.toLocaleString("es-ES")} €</span>
              <span className={unit}>{t("backstage.pricing.perMonth")}</span>
            </>
          }
          note={<span>{t("backstage.pricing.one.note")}</span>}
        >
          {cta(false)}
        </Plan>

        <Plan
          highlight
          name={t("backstage.pricing.multi")}
          price={
            <>
              <NumberFlow value={each * orgs} locales="es-ES" format={euro} className={bigPrice} />
              <span className={unit}>{t("backstage.pricing.perMonth")}</span>
            </>
          }
          note={
            <>
              <div className="flex items-center justify-between gap-3">
                <span>{t("backstage.pricing.orgs")}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={t("backstage.pricing.less")}
                    disabled={orgs <= MIN_ORGS}
                    onClick={() => setOrgs((n) => Math.max(MIN_ORGS, n - 1))}
                    className={stepBtn}
                  >
                    −
                  </button>
                  <NumberFlow
                    value={orgs}
                    aria-label={t("backstage.pricing.orgs")}
                    className="w-6 text-center text-lg font-semibold tabular-nums text-white"
                  />
                  <button
                    type="button"
                    aria-label={t("backstage.pricing.more")}
                    disabled={orgs >= MAX_ORGS}
                    onClick={() => setOrgs((n) => Math.min(MAX_ORGS, n + 1))}
                    className={stepBtn}
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
                {each.toLocaleString("es-ES")} € {t("backstage.pricing.perOrg")} · {t("backstage.pricing.save")}
                <NumberFlow
                  value={(BASE_PRICE - each) * orgs}
                  locales="es-ES"
                  format={euro}
                  className="font-semibold text-[#0a84ff]"
                />
                {t("backstage.pricing.perMonth")}
              </p>
            </>
          }
          body={
            <div className="relative mt-8 border-t border-white/10 pt-7">
              <h4 className="mb-4 text-base font-semibold">{t("backstage.pricing.includesPlus")}</h4>
              <ul className="space-y-4">
                {["x1", "x2", "x3"].map((k) => (
                  <li key={k} className="flex items-start gap-3 text-[15px] text-white/90">
                    <Tick />
                    <span>
                      {t(`backstage.pricing.${k}`)}
                      {k === "x1" && (
                        <span className="mt-0.5 block text-sm text-white/50">
                          {t("backstage.pricing.x1.sub")}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          }
        >
          {cta(true)}
        </Plan>
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
