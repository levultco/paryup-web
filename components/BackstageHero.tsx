"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { Segmented } from "@/components/organizations/promoters-ui";
import { useI18n } from "@/components/i18n/LocaleProvider";
import {
  AddIcon,
  ArrowRightIcon,
  ArrowRightUpIcon,
  CalendarIcon,
  GlobalIcon,
  LayersIcon,
  SettingsIcon,
  SmartphoneIcon,
  SpeakerIcon,
  TicketIcon,
  UsersGroupIcon,
  WidgetIcon,
  type SolarIcon,
} from "@/components/icons/solar";

gsap.registerPlugin(ScrollTrigger);

type Mode = "paryup" | "fv";
type MsgKey = Parameters<ReturnType<typeof useI18n>["t"]>[0];

// Las pestañas se derivan de capacidades: con Fourvenues no hay catálogo ni promotores
// (los eventos se gestionan allí), así que esas entradas salen del menú.
const NAV: {
  id: string;
  Icon: SolarIcon;
  label: Record<Mode, MsgKey>;
  modes: Mode[];
}[] = [
  {
    id: "home",
    Icon: WidgetIcon,
    label: { paryup: "orgs.nav.overview", fv: "backstage.p.channel" },
    modes: ["paryup", "fv"],
  },
  {
    id: "events",
    Icon: CalendarIcon,
    label: { paryup: "orgs.nav.events", fv: "orgs.nav.events" },
    modes: ["paryup", "fv"],
  },
  {
    id: "catalog",
    Icon: LayersIcon,
    label: { paryup: "orgs.nav.catalog", fv: "orgs.nav.catalog" },
    modes: ["paryup"],
  },
  {
    id: "team",
    Icon: UsersGroupIcon,
    label: { paryup: "orgs.nav.team", fv: "orgs.nav.team" },
    modes: ["paryup", "fv"],
  },
  {
    id: "promoters",
    Icon: SpeakerIcon,
    label: { paryup: "orgs.nav.promoters", fv: "orgs.nav.promoters" },
    modes: ["paryup"],
  },
  {
    id: "settings",
    Icon: SettingsIcon,
    label: { paryup: "orgs.nav.settings", fv: "orgs.nav.settings" },
    modes: ["paryup", "fv"],
  },
];

// Cifras de demostración (no son datos reales de ninguna sala).
const STATS: Record<Mode, { key: MsgKey; value: number; money?: boolean }[]> = {
  paryup: [
    { key: "orgs.panel.upcoming", value: 3 },
    { key: "backstage.p.sold", value: 842 },
    { key: "backstage.p.revenue", value: 12480, money: true },
  ],
  fv: [
    { key: "backstage.p.imported", value: 6 },
    { key: "backstage.p.soldChannel", value: 214 },
    { key: "backstage.p.amountChannel", value: 3920, money: true },
  ],
};

const EVENTS = [
  { name: "Noche Aurora", meta: "1 nov · Barcelona", sold: 312 },
  { name: "Pulso Sur", meta: "2 nov · Barcelona", sold: 187 },
  { name: "Medianoche Sessions", meta: "7 nov · Barcelona", sold: 268 },
  { name: "Solsticio", meta: "8 nov · Sitges", sold: 141 },
  { name: "Lumen Afterhours", meta: "14 nov · Barcelona", sold: 96 },
];

const EASE = [0.32, 0.72, 0, 1] as const;

// Mismos botones que la home (StoreButtons): misma altura, relleno, bordes y hover.
const BTN =
  "inline-flex h-[58px] items-center gap-3 rounded-full px-7 text-[17px] font-semibold transition-[transform,translate,scale,background-color,box-shadow,border-color] duration-300 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:scale-[1.04] active:translate-y-0 active:scale-[0.97]";

/**
 * Cambia un contenido con un fundido corto. Las dos versiones se apilan en la misma celda
 * de un grid, así que no hay medición de layout (no "salta" bajo los transform de GSAP).
 */
function Swap({
  k,
  className,
  children,
}: {
  k: string;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <span className="inline-grid">
      <AnimatePresence initial={false}>
        <motion.span
          key={k}
          className={className}
          style={{ gridArea: "1 / 1" }}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: reduce ? 0 : 0.28, ease: EASE }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function NavItem({
  item,
  mode,
  chip,
}: {
  item: (typeof NAV)[number];
  mode: Mode;
  chip?: boolean;
}) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const active = item.id === "home";
  const { Icon } = item;
  const hidden = chip ? { opacity: 0, width: 0 } : { opacity: 0, height: 0 };
  const shown = chip
    ? { opacity: 1, width: "auto" }
    : { opacity: 1, height: "auto" };
  return (
    <motion.div
      initial={reduce ? false : hidden}
      animate={shown}
      exit={reduce ? undefined : hidden}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
      className="shrink-0 overflow-hidden"
    >
      <div className={chip ? "pr-2" : "py-[3px]"}>
        <div
          className={`flex items-center gap-3 whitespace-nowrap rounded-full text-[13px] md:text-[15px] ${
            chip ? "px-3.5 py-2" : "px-4 py-3"
          } ${active ? "bg-white text-black" : chip ? "bg-white/[0.08] text-white/70" : "text-white/55"}`}
        >
          <Icon aria-hidden className="h-[17px] w-[17px]" />
          <Swap k={item.label[mode]}>{t(item.label[mode])}</Swap>
        </div>
      </div>
    </motion.div>
  );
}

/** Maqueta del panel de Backstage; ilustrativa, con cifras de demostración. */
function PanelPreview({
  mode,
  alt,
  toolbar,
}: {
  mode: Mode;
  alt: string;
  toolbar: ReactNode;
}) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const fv = mode === "fv";
  const items = NAV.filter((n) => n.modes.includes(mode));
  const dur = reduce ? 0 : 0.4;

  return (
    <div className="mx-auto w-full max-w-[1320px] select-none rounded-[26px] bg-[#0a0a0a]/90 p-2.5 shadow-[0_50px_140px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.09)] ring-1 ring-white/[0.1] md:rounded-[32px] md:p-5">
      <div className="mb-3 flex items-center justify-center border-b border-white/[0.07] pb-3 md:mb-4 md:pb-4">
        {toolbar}
      </div>
      <div role="img" aria-label={alt} className="flex gap-4 md:gap-5">
        <aside className="hidden w-64 shrink-0 flex-col md:flex">
          <div className="mb-2 flex items-center gap-3 rounded-[20px] bg-[#1a1a1a] p-3.5 ring-1 ring-white/[0.08]">
            <span className="h-10 w-10 rounded-full bg-gradient-to-b from-white/30 to-white/5" />
            <span className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold text-white">
                {t("backstage.p.club")}
              </span>
              <span className="text-[11px] text-white/40">@tu-club</span>
            </span>
          </div>
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <NavItem key={item.id} item={item} mode={mode} />
            ))}
          </AnimatePresence>
        </aside>

        <div className="min-w-0 flex-1 text-left">
          <div className="-mx-0.5 mb-3 flex overflow-x-auto px-0.5 pb-1 md:hidden [scrollbar-width:none]">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <NavItem key={item.id} item={item} mode={mode} chip />
              ))}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-2xl font-semibold tracking-[-0.02em] text-white md:text-5xl">
              <Swap k={fv ? "fv" : "pu"}>
                {fv ? t("backstage.p.channel") : t("orgs.panel.overviewTitle")}
              </Swap>
            </p>
            <motion.span
              animate={{
                backgroundColor: fv ? "rgba(255,255,255,0.1)" : "#ffffff",
                color: fv ? "rgba(255,255,255,0.85)" : "#000000",
              }}
              transition={{ duration: dur, ease: EASE }}
              className="inline-flex w-[196px] items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium md:w-[226px] md:text-[13px]"
            >
              <Swap
                k={fv ? "fv" : "pu"}
                className="inline-flex items-center justify-center gap-1.5"
              >
                {fv ? (
                  <>
                    {t("backstage.p.manageFv")}
                    <ArrowRightUpIcon aria-hidden className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <AddIcon aria-hidden className="h-3.5 w-3.5" />
                    {t("orgs.ev.create")}
                  </>
                )}
              </Swap>
            </motion.span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 md:mt-4 md:gap-3">
            {STATS[mode].map((s, i) => (
              <div
                key={i}
                className="rounded-[18px] bg-[#1a1a1a] p-3 ring-1 ring-white/[0.08] md:p-6"
              >
                <p className="min-h-[2.2em] text-[10px] leading-tight text-white/45 md:min-h-0 md:text-sm">
                  <Swap k={s.key}>{t(s.key)}</Swap>
                </p>
                <p className="font-display mt-1.5 text-[17px] font-semibold tabular-nums tracking-[-0.03em] text-white md:mt-4 md:text-5xl">
                  <NumberFlow
                    value={s.value}
                    locales="es-ES"
                    format={
                      s.money
                        ? {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 0,
                            useGrouping: "always",
                          }
                        : undefined
                    }
                    transformTiming={{
                      duration: reduce ? 0 : 700,
                      easing: "ease-out",
                    }}
                    spinTiming={{
                      duration: reduce ? 0 : 700,
                      easing: "ease-out",
                    }}
                  />
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 divide-y divide-white/[0.07] overflow-hidden rounded-[18px] bg-[#1a1a1a] ring-1 ring-white/[0.08] md:mt-4">
            {EVENTS.map((e) => (
              <div
                key={e.name}
                className="flex items-center gap-3 p-3 md:gap-5 md:p-5"
              >
                <span className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-white/25 to-white/5 md:h-[88px] md:w-[88px] md:rounded-2xl" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold text-white md:text-xl">
                    {e.name}
                  </span>
                  <span className="truncate text-xs text-white/45 md:text-base">
                    {e.meta}
                  </span>
                </span>
                <AnimatePresence initial={false}>
                  {fv ? null : (
                    <motion.span
                      key="sold"
                      initial={reduce ? false : { opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={reduce ? undefined : { opacity: 0, width: 0 }}
                      transition={{ duration: dur, ease: EASE }}
                      className="hidden items-center gap-1.5 overflow-hidden text-xs tabular-nums text-white/50 sm:flex"
                    >
                      <TicketIcon aria-hidden className="h-3.5 w-3.5" />
                      {e.sold}
                    </motion.span>
                  )}
                </AnimatePresence>
                <motion.span
                  animate={{
                    backgroundColor: fv
                      ? "rgba(56,189,248,0.15)"
                      : "rgba(48,209,88,0.15)",
                    color: fv ? "#7dd3fc" : "#30d158",
                  }}
                  transition={{ duration: dur, ease: EASE }}
                  className="inline-flex items-center gap-1.5 rounded-full py-1 pl-2.5 pr-3 text-[11px] font-semibold md:text-xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                  <Swap k={fv ? "fv" : "pu"}>
                    {fv
                      ? t("backstage.p.synced")
                      : t("orgs.ev.status.PUBLISHED")}
                  </Swap>
                </motion.span>
              </div>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {fv ? (
              <motion.p
                key="note"
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduce ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: dur, ease: EASE }}
                className="overflow-hidden text-[11px] leading-snug text-white/40 md:text-xs"
              >
                <span className="block pt-3">{t("backstage.p.fvNote")}</span>
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** Atmósfera: la propia captura de la app, muy desenfocada, más fría que la de la home. */
function Backdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute left-1/2 top-[-12%] h-[120svh] w-[150vw] max-w-[2200px] -translate-x-1/2 bg-cover bg-top opacity-[0.7]"
        style={{
          backgroundImage: "url(/app/home.webp)",
          filter: "blur(70px) saturate(1.7) hue-rotate(200deg)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_30%,transparent,rgba(0,0,0,0.55)_70%,#000_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-b from-transparent to-black" />
    </div>
  );
}

export default function BackstageHero({
  onRequest,
}: {
  onRequest: () => void;
}) {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<Mode>("paryup");

  // Landing sin barra de scroll visible: así no hay salto al abrir el formulario.
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-no-scrollbar", "");
    return () => html.removeAttribute("data-no-scrollbar");
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-bs-line] > span", {
          yPercent: 110,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.09,
          delay: 0.2,
        });
        gsap.from("[data-bs-fade]", {
          y: 24,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.08,
          delay: 0.7,
        });
        gsap.from("[data-bs-panel]", {
          y: 120,
          rotateX: 10,
          opacity: 0,
          transformPerspective: 1600,
          transformOrigin: "50% 0%",
          duration: 1.5,
          ease: "expo.out",
          delay: 0.75,
        });
        // El panel sube un poco más despacio que la página, como la app en la home.
        gsap.to("[data-bs-panel]", {
          yPercent: -5,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-bs-panel]",
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
      className="relative isolate flex min-h-[100svh] flex-col items-center overflow-hidden px-[clamp(1.25rem,3vw,3.5rem)] pb-0 pt-28 md:pt-32"
    >
      <Backdrop />

      <div className="relative z-20 flex flex-col items-center text-center">
        <h1 className="font-display text-[clamp(3.2rem,8vw,8.4rem)] font-bold leading-[0.9]">
          <span data-bs-line className="line-mask">
            <span>{t("backstage.line1")}</span>
          </span>
          <span data-bs-line className="line-mask">
            <span className="text-white/60">{t("backstage.line2")}</span>
          </span>
        </h1>
        <p
          data-bs-fade
          className="mt-6 max-w-[40ch] text-lg leading-snug text-white/60 md:text-2xl"
        >
          {t("backstage.sub")}
        </p>
        <div data-bs-fade className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onRequest}
            className={`${BTN} bg-white text-black hover:shadow-[0_14px_44px_-12px_rgba(255,255,255,0.55)]`}
          >
            {t("backstage.cta")}
            <ArrowRightIcon aria-hidden className="size-5" />
          </button>
          <a
            href="#como"
            className={`${BTN} border border-white/10 bg-white/10 text-white backdrop-blur-xl hover:border-white/25 hover:bg-white/20 hover:shadow-[0_14px_44px_-12px_rgba(255,255,255,0.3)]`}
          >
            {t("backstage.ctaSecondary")}
          </a>
        </div>
        <p
          data-bs-fade
          className="mt-5 flex items-center gap-2 text-sm text-white/55"
        >
          <GlobalIcon aria-hidden className="h-4 w-4" />
          <SmartphoneIcon aria-hidden className="h-4 w-4" />
          {t("backstage.platforms")}
        </p>
      </div>

      {/* El panel sale desde abajo, a tamaño real, y se funde antes del borde (igual que el móvil de la home). */}
      <div
        className="relative z-10 mt-[calc(2rem-12svh)] h-[calc(58svh+12svh)] min-h-[calc(440px+12svh)] w-full max-w-[1320px] overflow-hidden pt-[12svh] md:mt-[calc(3rem-20svh)] md:h-[calc(70svh+20svh)] md:min-h-[calc(560px+20svh)] md:pt-[20svh]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0, #000 calc(100% - 30svh), transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000 0, #000 calc(100% - 30svh), transparent 100%)",
        }}
      >
        <div data-bs-panel className="relative mx-auto w-full">
          <PanelPreview
            mode={mode}
            alt={t("backstage.preview.alt")}
            toolbar={
              <div className="w-full max-w-[420px] [&>div]:flex [&>div]:w-full [&>div>button]:flex-1">
                <Segmented
                  label={t("backstage.mode.label")}
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: "paryup", label: t("backstage.mode.paryup") },
                    { value: "fv", label: t("backstage.mode.fv") },
                  ]}
                />
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}
