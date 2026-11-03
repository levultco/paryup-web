"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarIcon,
  LayersIcon,
  PenIcon,
  SettingsIcon,
  SpeakerIcon,
  UsersGroupIcon,
  WidgetIcon,
} from "@/components/icons/solar";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";

const DESIGN_W = 1000;
const DESIGN_H = 640;
const ACCENT = "oklch(0.85 0.17 160)";

// Ventas acumuladas ficticias (entradas) a lo largo de 30 días.
const SERIES = [
  12, 31, 58, 90, 118, 141, 170, 205, 236, 262, 290, 322, 351, 389, 430, 468, 502, 551, 590,
  640, 701, 768, 835, 902, 981, 1062, 1131, 1196, 1245, 1284,
].map((v) => Math.round((v * 998) / 1284));

const NAV = [
  ["Resumen", WidgetIcon],
  ["Eventos", CalendarIcon],
  ["Catálogo", LayersIcon],
  ["Perfil", PenIcon],
  ["Equipo", UsersGroupIcon],
  ["Promotores", SpeakerIcon],
  ["Ajustes", SettingsIcon],
] as const;

const ROWS = [
  { name: "Early Bird", sold: 200, cap: 200, amount: "3.000,00 €" },
  { name: "General admission", sold: 684, cap: 800, amount: "13.680,00 €" },
  { name: "VIP", sold: 100, cap: 120, amount: "4.000,00 €" },
  { name: "Reservado Mesa", sold: 14, cap: 20, amount: "3.500,00 €" },
];

function chartPaths(w: number, h: number) {
  const max = Math.max(...SERIES);
  const pts = SERIES.map((v, i) => [
    (i / (SERIES.length - 1)) * w,
    h - (v / max) * (h - 12) - 6,
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return { line, area: `${line} L${w} ${h} L0 ${h} Z` };
}

function Pill({ active, children }: { active?: boolean; children: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[12px] font-medium ${
        active ? "bg-white text-black" : "text-white/70"
      }`}
    >
      {children}
    </span>
  );
}

/** Marco del panel de organizaciones (barra lateral + contenido), dibujado a 1000 px y escalado al ancho disponible. */
export function PanelShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / DESIGN_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full" style={{ height: DESIGN_H * scale }}>
      <div
        aria-hidden
        className="absolute left-0 top-0 flex origin-top-left gap-8 bg-black px-[70px] pt-8 font-sans text-white"
        style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})` }}
      >
        <aside className="w-[200px] shrink-0">
          <div className="flex items-center gap-3 rounded-2xl bg-[#1a1a1a] p-3.5">
            <span className="size-9 shrink-0 rounded-xl bg-white/[0.12]" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="block h-2.5 w-20 rounded-full bg-white/[0.18]" />
                <VerifiedBadge type="verified" className="h-5 w-5 shrink-0" />
              </div>
              <span className="block h-2 w-14 rounded-full bg-white/10" />
            </div>
          </div>
          <nav className="mt-4 space-y-1">
            {NAV.map(([n, Icon]) => (
              <div
                key={n}
                className={`flex items-center gap-3 rounded-full px-3.5 py-2 text-[13px] ${
                  n === active ? "bg-white font-medium text-black" : "text-white/75"
                }`}
              >
                <Icon className="size-[18px]" />
                {n}
              </div>
            ))}
          </nav>
          <div className="mt-5 rounded-full border border-white/15 px-3.5 py-2 text-center text-[12px] text-white/80">
            Cambiar de organización
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

/** Panel de ventas de un evento con datos ficticios. */
export default function BackstageSales() {
  const { line, area } = chartPaths(860, 150);

  return (
    <PanelShell active="Eventos">
          <p className="text-[12px] text-white/55">‹ Volver a eventos</p>
          <div className="mt-3 flex items-center gap-4">
            <span className="size-[52px] shrink-0 rounded-xl bg-white/[0.12]" />
            <div className="min-w-0 flex-1">
              <span className="block h-5 w-44 rounded-full bg-white/[0.18]" />
              <span className="mt-2.5 block h-2.5 w-64 rounded-full bg-white/10" />
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              ● Publicado
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-[12px] font-medium">Ver ajustes</span>
          </div>

          <section className="mt-5 rounded-[24px] bg-[#141414] p-5">
            <h5 className="text-[15px] font-semibold">Evolución de ventas</h5>
            <div className="mt-3 flex gap-2">
              <div className="flex rounded-full border border-white/10 p-0.5">
                <Pill active>Entradas</Pill>
                <Pill>Ingresos</Pill>
              </div>
              <div className="flex rounded-full border border-white/10 p-0.5">
                <Pill>7d</Pill>
                <Pill active>30d</Pill>
                <Pill>Todo</Pill>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-white/45">Acumulado</p>
            <p className="font-display text-[28px] font-semibold leading-tight">{SERIES[SERIES.length - 1]}</p>
            <svg viewBox="0 0 860 150" className="mt-2 h-[120px] w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="bs-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={ACCENT} stopOpacity="0.28" />
                  <stop offset="1" stopColor={ACCENT} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1="0"
                  x2="860"
                  y1={150 * f}
                  y2={150 * f}
                  stroke="rgba(255,255,255,0.12)"
                  strokeDasharray="1 5"
                />
              ))}
              <path d={area} fill="url(#bs-fill)" />
              <path d={line} fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div className="mt-1 flex justify-between text-[10px] text-white/40">
              <span>5 oct</span>
              <span>20 oct</span>
              <span>4 nov</span>
            </div>
          </section>

          <section className="mt-4 rounded-[24px] bg-[#141414] p-5">
            <h5 className="text-[15px] font-semibold">Ventas</h5>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                ["Entradas vendidas", "998"],
                ["Han entrado", "412"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-white/10 p-3.5">
                  <p className="text-[11px] text-white/50">{k}</p>
                  <p className="font-display text-[22px] font-semibold leading-tight">{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-white/40">Órdenes pagadas: 612 · Pendientes: 4</p>
            <h6 className="mt-4 text-[13px] font-semibold">Por entrada</h6>
            {ROWS.map((r) => (
              <div key={r.name} className="mt-3">
                <div className="flex justify-between text-[12px]">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-white/60">{r.amount}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${(r.sold / r.cap) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-white/40">
                  {r.sold} entradas vendidas · Quedan {r.cap - r.sold}
                </p>
              </div>
            ))}
          </section>
    </PanelShell>
  );
}
