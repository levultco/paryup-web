"use client";

import { useEffect, useId, useState } from "react";
import type { PointerEvent } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import { Card } from "@/components/organizations/ui";
import { DISCOVERY_TZ } from "@/lib/discovery";
import { intlLocale } from "@/lib/i18n";
import { orgFetch } from "@/lib/org-api";
import { buildSalesSeries, formatMoney, type SalesDay } from "@/lib/sales";

type Metric = "tickets" | "amount";
type Range = "7" | "30" | "all";

const W = 640;
const H = 220;
const ACCENT = "oklch(0.85 0.17 160)";

/** Curva suave entre puntos (misma técnica de bezier que el componente de referencia). */
function smooth(pts: ReadonlyArray<readonly [number, number]>) {
  return pts
    .map(([x, y], i) => {
      if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      const [px, py] = pts[i - 1];
      const m = (px + x) / 2;
      return `C ${m.toFixed(1)} ${py.toFixed(1)}, ${m.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function Pills<T extends string>({
  value,
  options,
  label,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  label: string;
  onChange: (v: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-full border border-white/10 p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            o.id === value
              ? "bg-white text-black"
              : "text-white/55 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Evolución de las ventas: acumulado diario de entradas o ingresos. */
export function SalesChart({ eventId }: { eventId: string }) {
  const { t, locale } = useI18n();
  const { slug } = useOrg();
  const uid = useId().replace(/:/g, "");
  const [days, setDays] = useState<SalesDay[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [metric, setMetric] = useState<Metric>("tickets");
  const [range, setRange] = useState<Range>("30");
  const [hover, setHover] = useState<number | null>(null);
  const [today] = useState(() =>
    new Intl.DateTimeFormat("en-CA", { timeZone: DISCOVERY_TZ }).format(
      new Date(),
    ),
  );

  useEffect(() => {
    let active = true;
    orgFetch<{ days: SalesDay[] }>(
      slug,
      `events/${eventId}/sales/timeline`,
    ).then((res) => {
      if (!active) return;
      if (res.ok && res.data) setDays(res.data.days);
      else setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [slug, eventId]);

  const loc = intlLocale(locale);
  const series = days
    ? buildSalesSeries(days, today, range === "all" ? null : Number(range))
    : [];
  const values = series.map((p) =>
    metric === "tickets" ? p.cumTickets : p.cumAmount,
  );
  const show = (v: number) =>
    metric === "tickets"
      ? new Intl.NumberFormat(loc).format(v)
      : formatMoney(v, "EUR", loc);
  const dayFmt = new Intl.DateTimeFormat(loc, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  const label = (date: string) => dayFmt.format(new Date(`${date}T00:00:00Z`));

  let body;
  if (failed) {
    body = <p className="text-white/55">{t("orgs.sl.loadError")}</p>;
  } else if (!days) {
    body = (
      <div
        aria-hidden
        className="h-56 animate-pulse rounded-2xl bg-white/[0.06]"
      />
    );
  } else if (series.length === 0) {
    body = <p className="text-white/55">{t("orgs.sl.chart.empty")}</p>;
  } else {
    const hi = Math.max(...values, 1);
    const y = (v: number) => H - 16 - (v / hi) * (H - 40);
    const x = (i: number) =>
      series.length === 1 ? W / 2 : (i / (series.length - 1)) * W;
    const pts = values.map((v, i) => [x(i), y(v)] as const);
    const line = smooth(pts);
    const idx = hover ?? series.length - 1;
    const onMove = (e: PointerEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      setHover(
        Math.max(
          0,
          Math.min(
            series.length - 1,
            Math.round(((e.clientX - r.left) / r.width) * (series.length - 1)),
          ),
        ),
      );
    };
    const left = `${(pts[idx][0] / W) * 100}%`;
    const point = series[idx];
    body = (
      <>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs text-white/45">
              {hover !== null ? label(point.date) : t("orgs.sl.chart.total")}
            </p>
            <p className="font-display mt-1 text-3xl font-semibold text-white">
              {show(values[idx])}
            </p>
          </div>
          <p className="text-xs text-white/45">
            {t("orgs.sl.chart.day", {
              value: show(metric === "tickets" ? point.tickets : point.amount),
            })}
          </p>
        </div>
        <div
          className="relative mt-4 h-56 touch-pan-y"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          role="img"
          aria-label={t("orgs.sl.chart.aria", {
            value: show(values[values.length - 1]),
          })}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <linearGradient id={`${uid}-f`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={ACCENT} stopOpacity={0.28} />
                <stop offset="1" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1={0}
                x2={W}
                y1={H * f}
                y2={H * f}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="1 5"
                stroke="rgba(255,255,255,0.12)"
              />
            ))}
            <path
              d={`${line} L ${W} ${H} L 0 ${H} Z`}
              fill={`url(#${uid}-f)`}
            />
            <path
              key={`${metric}-${range}`}
              d={line}
              fill="none"
              stroke={ACCENT}
              strokeWidth={2.5}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              className="sales-draw"
            />
          </svg>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-white/20"
            style={{ left, opacity: hover !== null ? 1 : 0 }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#0f0f0f]"
            style={{
              left,
              top: `${(pts[idx][1] / H) * 100}%`,
              background: ACCENT,
            }}
          />
        </div>
        <div
          className="mt-2 flex justify-between text-xs text-white/40"
          aria-hidden
        >
          <span>{label(series[0].date)}</span>
          <span>{label(series[series.length - 1].date)}</span>
        </div>
      </>
    );
  }

  return (
    <Card title={t("orgs.sl.chart.title")}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Pills
          label={t("orgs.sl.chart.metric")}
          value={metric}
          onChange={setMetric}
          options={[
            { id: "tickets", label: t("orgs.sl.chart.tickets") },
            { id: "amount", label: t("orgs.sl.chart.revenue") },
          ]}
        />
        <Pills
          label={t("orgs.sl.chart.range")}
          value={range}
          onChange={setRange}
          options={[
            { id: "7", label: "7d" },
            { id: "30", label: "30d" },
            { id: "all", label: t("orgs.sl.chart.all") },
          ]}
        />
      </div>
      {body}
    </Card>
  );
}
