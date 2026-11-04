"use client";

import { useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import {
  CalendarIcon,
  CheckIcon,
  LinkIcon,
  TicketIcon,
} from "@/components/icons/solar";

// Mini interfaces ilustrativas de Backstage (datos de demostración, nada real).

const card = "rounded-2xl bg-[#1a1a1a] ring-1 ring-white/[0.08]";
const dot = "h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]";

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2.5 p-1 text-left">
      {children}
    </div>
  );
}

function Pill({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: "green" | "sky" | "gray";
}) {
  const c =
    tone === "green"
      ? "bg-[#30d158]/15 text-[#30d158]"
      : tone === "sky"
        ? "bg-sky-400/15 text-sky-300"
        : "bg-white/10 text-white/60";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-2.5 pr-3 text-[11px] font-semibold ${c}`}
    >
      <span className={dot} />
      {children}
    </span>
  );
}

function Row({
  title,
  meta,
  right,
}: {
  title: string;
  meta?: string;
  right?: ReactNode;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 ${card}`}>
      <span className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-white/25 to-white/5" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-white">
          {title}
        </span>
        {meta ? (
          <span className="truncate text-xs text-white/45">{meta}</span>
        ) : null}
      </span>
      {right}
    </div>
  );
}

/* ---------- Pasos de "Cómo funciona" ---------- */

// Muelle crítico (sin rebote) para lo que aparece solo; el rebote se reserva a gestos con inercia.
const SPRING = { type: "spring", bounce: 0, duration: 0.5 } as const;

/** Entra con un muelle suave cuando el paso se ve en pantalla; sin movimiento si el usuario lo pide. */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={reduce ? { duration: 0 } : { ...SPRING, delay }}
    >
      {children}
    </motion.div>
  );
}

const group = "overflow-hidden rounded-[22px] bg-[#1a1a1a] ring-1 ring-white/[0.08]";

export function StepRequest() {
  const { t } = useI18n();
  return (
    <Frame>
      <Reveal>
        <ul className={`${group} divide-y divide-white/[0.07]`}>
          {(
            [
              ["backstage.v.room", "w-24"],
              ["backstage.v.city", "w-16"],
              ["backstage.v.orgType", null],
            ] as const
          ).map(([k, w]) => (
            <li key={k} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <span className="text-[14px] text-white/55">{t(k)}</span>
              {w ? (
                <span className={`h-2.5 rounded-full bg-white/[0.16] ${w}`} />
              ) : (
                <span className="text-[14px] font-medium text-white">
                  {t("backstage.v.orgTypeValue")}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={0.08}>
        <span className="flex h-12 items-center justify-center rounded-full bg-white text-[15px] font-semibold text-black">
          {t("backstage.form.submit")}
        </span>
      </Reveal>
    </Frame>
  );
}

export type StepMode = "paryup" | "fv";

/** Cambia un contenido con un fundido corto; las dos versiones comparten celda para no saltar. */
export function Fade({
  k,
  block = false,
  children,
}: {
  k: string;
  /** Ocupa todo el ancho (títulos y párrafos que deben ajustar línea). */
  block?: boolean;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={block ? "grid" : "inline-grid"}>
      <AnimatePresence initial={false}>
        <motion.span
          key={k}
          style={{ gridArea: "1 / 1" }}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={reduce ? { duration: 0 } : { ...SPRING, duration: 0.3 }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const MODES: { id: StepMode; name: string }[] = [
  { id: "paryup", name: "ParyUp" },
  { id: "fv", name: "Fourvenues" },
];

/** Control segmentado con muelle (el rebote leve es por ser un gesto). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; name: string }[];
  label: string;
}) {
  const reduce = useReducedMotion();
  const i = Math.max(0, options.findIndex((o) => o.id === value));
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="relative flex rounded-full bg-[#1a1a1a] p-1 ring-1 ring-white/[0.08]"
    >
      <motion.span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full bg-white/[0.16]"
        style={{ width: `calc(${100 / options.length}% - 8px / ${options.length})` }}
        initial={false}
        animate={{ x: `${i * 100}%` }}
        transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0.2, duration: 0.45 }}
      />
      {options.map(({ id, name }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className={`relative z-10 flex-1 rounded-full py-2 text-center text-[14px] font-semibold transition-[color,transform] duration-100 active:scale-[0.97] ${
            value === id ? "text-white" : "text-white/55 hover:text-white/80"
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

/** Selector ParyUp / Fourvenues. */
export function ModeSwitch({
  mode,
  onChange,
}: {
  mode: StepMode;
  onChange: (m: StepMode) => void;
}) {
  const { t } = useI18n();
  return (
    <Segmented value={mode} onChange={onChange} options={MODES} label={t("backstage.mode.paryup")} />
  );
}

export function StepChoose({
  mode,
  onChange,
}: {
  mode: StepMode;
  onChange: (m: StepMode) => void;
}) {
  const { t } = useI18n();
  return (
    <Frame>
      <Reveal>
        <div className={`${group} flex items-center justify-between px-4 py-3.5`}>
          <span className="text-[14px] font-medium text-white">
            {t("backstage.v.orgCreated")}
          </span>
          <Tick />
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <ModeSwitch mode={mode} onChange={onChange} />
      </Reveal>
      <Reveal delay={0.16}>
        <div className={`${group} flex items-center justify-between px-4 py-3.5`}>
          <span className="text-[14px] font-medium text-white">
            {t("backstage.v.ready")}
          </span>
          <Tick />
        </div>
      </Reveal>
    </Frame>
  );
}

function Tick() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#30d158] text-black">
      <CheckIcon aria-hidden className="h-3.5 w-3.5" />
    </span>
  );
}

export function StepSell({ mode }: { mode: StepMode }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const fv = mode === "fv";
  const shown = reduce || seen;
  const sold = shown ? (fv ? 214 : 312) : 0;
  return (
    <Frame>
      <div ref={ref} className="flex flex-col gap-2.5">
        <Reveal>
          <div className={`${group} flex items-center gap-3 p-3`}>
            <span className="h-11 w-11 shrink-0 rounded-xl bg-white/10" />
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="block h-2.5 w-28 rounded-full bg-white/[0.18]" />
              <span className="block h-2 w-20 rounded-full bg-white/10" />
            </span>
            <Fade k={mode}>
              <Pill tone={fv ? "sky" : "green"}>
                {fv ? t("backstage.p.synced") : t("orgs.ev.status.PUBLISHED")}
              </Pill>
            </Fade>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className={`${group} p-4`}>
            <div className="flex items-end justify-between gap-3">
              <span className="flex items-center gap-2 text-[14px] text-white/55">
                <TicketIcon aria-hidden className="h-4 w-4 shrink-0" />
                <Fade k={mode}>
                  {fv ? t("backstage.p.soldChannel") : t("backstage.v.tickets")}
                </Fade>
              </span>
              <span className="font-display text-[34px] font-semibold leading-none tabular-nums tracking-[-0.03em] text-white">
                <NumberFlow
                  value={sold}
                  locales="es-ES"
                  transformTiming={{ duration: reduce ? 0 : 700, easing: "ease-out" }}
                  spinTiming={{ duration: reduce ? 0 : 700, easing: "ease-out" }}
                />
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className={`h-full origin-left rounded-full ${fv ? "bg-sky-300" : "bg-[#30d158]"}`}
                initial={false}
                animate={{ scaleX: shown ? (fv ? 0.42 : 0.62) : 0 }}
                transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.8 }}
              />
            </div>
          </div>
        </Reveal>
      </div>
    </Frame>
  );
}

/* ---------- Tarjetas de funciones ---------- */

export function VisEvents() {
  const { t } = useI18n();
  return (
    <Frame>
      <Row
        title="Noche Aurora"
        meta="1 nov · Barcelona"
        right={<Pill>{t("orgs.ev.status.PUBLISHED")}</Pill>}
      />
      <Row
        title="Pulso Sur"
        meta="2 nov · Barcelona"
        right={<Pill tone="gray">{t("orgs.ev.status.DRAFT")}</Pill>}
      />
      <Row
        title="Solsticio"
        meta="8 nov · Sitges"
        right={<Pill>{t("orgs.ev.status.PUBLISHED")}</Pill>}
      />
    </Frame>
  );
}

export function VisTickets() {
  return (
    <Frame>
      {[
        ["General", "20 €"],
        ["VIP", "35 €"],
        ["Mesa 6 pax", "150 €"],
      ].map(([n, p]) => (
        <div
          key={n}
          className={`flex items-center justify-between p-3.5 ${card}`}
        >
          <span className="flex items-center gap-3 text-sm font-semibold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] text-white/70">
              <TicketIcon aria-hidden className="h-[18px] w-[18px]" />
            </span>
            {n}
          </span>
          <span className="font-display text-xl font-semibold tabular-nums text-white">
            {p}
          </span>
        </div>
      ))}
    </Frame>
  );
}

export function VisTeam() {
  const { t } = useI18n();
  return (
    <Frame>
      {[
        ["Álex", "OWNER"],
        ["Marta", "MANAGER"],
        ["Iván", "SECURITY"],
      ].map(([n, r]) => (
        <div key={n} className={`flex items-center gap-3 p-3 ${card}`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-white/25 to-white/5 text-sm font-semibold text-white">
            {n[0]}
          </span>
          <span className="flex-1 text-sm font-semibold text-white">{n}</span>
          <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-white/70">
            {t(`orgs.role.${r}`)}
          </span>
        </div>
      ))}
    </Frame>
  );
}

export function VisPromoters() {
  const { t } = useI18n();
  return (
    <Frame>
      <div className={`flex flex-col gap-4 p-5 ${card}`}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-white/25 to-white/5 text-sm font-semibold text-white">
            L
          </span>
          <span className="flex-1 text-sm font-semibold text-white">Lucía</span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1 text-xs text-white/70">
            <LinkIcon aria-hidden className="h-3.5 w-3.5" />
            link
          </span>
        </div>
        <div>
          <p className="text-xs text-white/45">{t("orgs.earn.earned")}</p>
          <p className="font-display text-4xl font-semibold tabular-nums tracking-[-0.03em] text-white">
            1.280 €
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-white/[0.07] pt-3 text-xs">
          <span className="text-white/45">
            {t("orgs.earn.unsettled")} · 320 €
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-black">
            {t("orgs.earn.settle")}
          </span>
        </div>
      </div>
    </Frame>
  );
}

export function VisStats() {
  const { t } = useI18n();
  const bars = [38, 52, 44, 66, 58, 82, 74, 96];
  return (
    <Frame>
      <div className={`flex flex-col gap-4 p-5 ${card}`}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-white/45">{t("backstage.p.revenue")}</p>
            <p className="font-display text-3xl font-semibold tabular-nums tracking-[-0.03em] text-white">
              12.480 €
            </p>
          </div>
          <Pill>+18 %</Pill>
        </div>
        <div className="flex h-24 items-end gap-2">
          {bars.map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-t-md bg-gradient-to-t from-white/10 to-white/50"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function VisProfile() {
  return (
    <Frame>
      <div className={`overflow-hidden ${card}`}>
        <div className="h-20 bg-gradient-to-br from-white/25 via-white/10 to-transparent" />
        <div className="-mt-7 flex items-end gap-3 px-4 pb-4">
          <span className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-b from-white/40 to-white/10 ring-4 ring-[#1a1a1a]" />
          <span className="flex flex-1 flex-col pb-0.5">
            <span className="text-[15px] font-semibold text-white">
              Tu club
            </span>
            <span className="text-xs text-white/45">@tu-club · Barcelona</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-white/60">
            <CalendarIcon aria-hidden className="h-3.5 w-3.5" />3
          </span>
        </div>
      </div>
    </Frame>
  );
}
