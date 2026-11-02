"use client";

import type { ReactNode } from "react";
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

export function StepRequest() {
  const { t } = useI18n();
  return (
    <Frame>
      <div className={`flex flex-col gap-2 p-4 ${card}`}>
        {[0.7, 0.5].map((w, i) => (
          <span
            key={i}
            className="h-9 rounded-lg bg-white/[0.07]"
            style={{ width: `${w * 100 + 30}%` }}
          />
        ))}
        <span className="mt-1 flex h-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
          {t("backstage.form.submit")}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-white/60">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#30d158] text-black">
          <CheckIcon aria-hidden className="h-3.5 w-3.5" />
        </span>
        {t("backstage.v.sent")}
      </div>
    </Frame>
  );
}

export function StepChoose() {
  const { t } = useI18n();
  return (
    <Frame>
      {[
        ["backstage.v.forModeParyup", true],
        ["backstage.v.forModeFv", false],
      ].map(([key, on]) => (
        <div
          key={String(key)}
          className={`flex items-center justify-between gap-3 p-4 ${card} ${on ? "ring-white/30" : ""}`}
        >
          <span className="text-[15px] font-semibold text-white">
            {t(String(key))}
          </span>
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full ${
              on ? "bg-white text-black" : "border border-white/20"
            }`}
          >
            {on ? <CheckIcon aria-hidden className="h-3.5 w-3.5" /> : null}
          </span>
        </div>
      ))}
    </Frame>
  );
}

export function StepSell() {
  const { t } = useI18n();
  return (
    <Frame>
      <Row
        title="Noche Aurora"
        meta="1 nov · Barcelona"
        right={<Pill>{t("orgs.ev.status.PUBLISHED")}</Pill>}
      />
      <div className={`flex items-center justify-between p-4 ${card}`}>
        <span className="flex items-center gap-2 text-sm text-white/60">
          <TicketIcon aria-hidden className="h-4 w-4" />
          {t("backstage.v.tickets")}
        </span>
        <span className="font-display text-3xl font-semibold tabular-nums text-white">
          312
        </span>
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
