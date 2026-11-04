"use client";

import { SealCheck } from "@/components/profile/VerifiedBadge";
import { PanelShell } from "@/components/BackstageSales";
import {
  CalendarDateIcon,
  ChevronRightIcon,
  HistoryIcon,
  PenIcon,
  SettingsIcon,
  UserRoundedIcon,
  UsersGroupIcon,
} from "@/components/icons/solar";

// Misma estética que OverviewView de /organizaciones, con datos ficticios.
const card = "rounded-[22px] bg-raised ring-1 ring-white/[0.08]";

const STATS = [
  { Icon: UserRoundedIcon, tone: "bg-sky-400/15 text-sky-300", label: "Seguidores", value: "963" },
  { Icon: CalendarDateIcon, tone: "bg-[#30d158]/15 text-[#30d158]", label: "Próximos eventos", value: "2" },
  { Icon: HistoryIcon, tone: "bg-white/10 text-white/70", label: "Eventos pasados", value: "14" },
];

const EVENTS = [
  { upcoming: true, w: "w-28", d: "w-36" },
  { upcoming: true, w: "w-24", d: "w-32" },
  { upcoming: false, w: "w-32", d: "w-36" },
];

const STEPS = ["Organización creada", "Añadir logotipo", "Escribir una descripción", "Publicar tu primer evento"];

const QUICK = [
  { Icon: UsersGroupIcon, label: "Equipo", trailing: "6 miembros" },
  { Icon: PenIcon, label: "Editar perfil" },
  { Icon: SettingsIcon, label: "Ajustes de la organización" },
];

function Ring() {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" strokeWidth="5" className="stroke-white/10" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={0}
          className="stroke-[#30d158]"
        />
      </svg>
      <span className="absolute text-[13px] font-semibold tabular-nums text-white">4/4</span>
    </span>
  );
}

/** Pantalla "Resumen" del panel de organizaciones con datos ficticios. */
export default function BackstageOverview() {
  return (
    <PanelShell active="Resumen">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h4 className="font-display text-[30px] font-semibold leading-none">Resumen</h4>
          <p className="mt-1.5 text-[12px] text-white/45">Barcelona · Creada el 12 de marzo de 2025</p>
        </div>
        <span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-[11px] font-medium text-white/70">
          Tu rol: Propietario
        </span>
      </header>

      <section className="mt-5 grid grid-cols-3 gap-2.5">
        {STATS.map(({ Icon, tone, label, value }) => (
          <div key={label} className={`flex flex-col gap-3 p-4 ${card}`}>
            <span className={`flex size-9 items-center justify-center rounded-full ${tone}`}>
              <Icon aria-hidden className="size-[18px]" />
            </span>
            <span>
              <span className="block text-[11px] text-white/50">{label}</span>
              <span className="font-display mt-1 block text-[32px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
                {value}
              </span>
            </span>
          </div>
        ))}
      </section>

      <div className="mt-5 grid grid-cols-[1fr_210px] gap-5">
        <section>
          <h5 className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.04em] text-white/40">
            Actividad reciente
          </h5>
          <ul className={`divide-y divide-white/[0.07] overflow-hidden ${card}`}>
            {EVENTS.map((e, i) => (
              <li key={i} className="flex items-center gap-3 px-3 py-3">
                <span
                  className={`size-11 shrink-0 rounded-xl bg-white/10 ${e.upcoming ? "" : "opacity-60"}`}
                />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className={`block h-2.5 rounded-full bg-white/[0.18] ${e.w}`} />
                  <span className={`block h-2 rounded-full bg-white/10 ${e.d}`} />
                </span>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-2 pr-2.5 text-[10px] font-semibold ${
                    e.upcoming ? "bg-[#30d158]/15 text-[#30d158]" : "bg-white/10 text-white/55"
                  }`}
                >
                  {e.upcoming ? (
                    <span className="size-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                  ) : null}
                  {e.upcoming ? "Próximo" : "Celebrado"}
                </span>
                <ChevronRightIcon aria-hidden className="size-3.5 shrink-0 text-white/25" />
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-4">
          <section className={`p-4 ${card}`}>
            <div className="flex items-center gap-3">
              <Ring />
              <div className="min-w-0">
                <h5 className="font-display text-[14px] font-semibold leading-tight">Estado del perfil</h5>
                <p className="mt-0.5 text-[10px] leading-tight text-[#30d158]">
                  Tu perfil público está completo.
                </p>
              </div>
            </div>
            <ul className="mt-2 divide-y divide-white/[0.07]">
              {STEPS.map((s) => (
                <li key={s} className="flex items-center gap-2 py-1.5 text-[11px]">
                  <SealCheck className="size-4 shrink-0" />
                  <span className="text-white/90">{s}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h5 className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.04em] text-white/40">
              Acciones rápidas
            </h5>
            <ul className={`divide-y divide-white/[0.07] overflow-hidden ${card}`}>
              {QUICK.map(({ Icon, label, trailing }) => (
                <li key={label} className="flex items-center gap-2.5 px-3 py-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white/[0.08] text-white/80">
                    <Icon aria-hidden className="size-3.5" />
                  </span>
                  <span className="flex-1 truncate text-[11px] text-white/90">{label}</span>
                  {trailing ? <span className="text-[10px] text-white/45">{trailing}</span> : null}
                  <ChevronRightIcon aria-hidden className="size-3 shrink-0 text-white/25" />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </PanelShell>
  );
}
