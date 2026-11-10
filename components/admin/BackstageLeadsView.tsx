"use client";

import { mainHostFor } from "@/lib/backstage-host";
import { useCallback, useEffect, useState } from "react";
import { Select } from "@/components/organizations/select";
import { primaryButton, pillButton } from "@/components/organizations/ui";
import { notify } from "@/lib/toast";

type Status =
  | "NEW"
  | "IN_REVIEW"
  | "DEMO_SCHEDULED"
  | "APPROVED"
  | "IN_TRIAL"
  | "ACTIVE"
  | "REJECTED";

type Lead = {
  id: string;
  name: string;
  email: string;
  venue: string;
  city: string;
  system: "NONE" | "FOURVENUES" | "OTHER";
  phone: string | null;
  message: string | null;
  status: Status;
  internalNote: string | null;
  rejectionReason: string | null;
  activationToken?: string | null;
  createdAt: string;
};

const STATUSES: Status[] = [
  "NEW",
  "IN_REVIEW",
  "DEMO_SCHEDULED",
  "APPROVED",
  "IN_TRIAL",
  "ACTIVE",
  "REJECTED",
];
const LABEL: Record<Status, string> = {
  NEW: "Nueva",
  IN_REVIEW: "En revisión",
  DEMO_SCHEDULED: "Demo programada",
  APPROVED: "Aprobada",
  IN_TRIAL: "En prueba",
  ACTIVE: "Activa",
  REJECTED: "Rechazada",
};
const COLOR: Record<Status, string> = {
  NEW: "#ffb005",
  IN_REVIEW: "#64d2ff",
  DEMO_SCHEDULED: "#bf5af2",
  APPROVED: "#30d158",
  IN_TRIAL: "#0a84ff",
  ACTIVE: "#30d158",
  REJECTED: "#ff453a",
};
const SYSTEM: Record<Lead["system"], string> = {
  NONE: "Sin sistema",
  FOURVENUES: "Fourvenues",
  OTHER: "Otro sistema",
};

const date = (v: string) =>
  new Date(v).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const field =
  "w-full rounded-2xl bg-white/[0.07] px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 transition-shadow placeholder:text-white/35 focus:ring-white/40";

function Pill({ status }: { status: Status }) {
  const c = COLOR[status];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: `${c}26`, color: c }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {LABEL[status]}
    </span>
  );
}

/** El enlace apunta a la web principal: en el subdominio backstage esa ruta se leería como una organización. */
function activationUrl(token: string) {
  if (typeof window === "undefined") return "";
  const { protocol, host } = window.location;
  return `${protocol}//${mainHostFor(host)}/backstage/activar?token=${token}`;
}

function LeadCard({ lead, onSaved }: { lead: Lead; onSaved: () => void }) {
  const [status, setStatus] = useState<Status>(lead.status);
  const [note, setNote] = useState(lead.internalNote ?? "");
  const [reason, setReason] = useState(lead.rejectionReason ?? "");
  const [saving, setSaving] = useState(false);

  const dirty =
    status !== lead.status ||
    note !== (lead.internalNote ?? "") ||
    reason !== (lead.rejectionReason ?? "");
  const needsReason = status === "REJECTED" && !reason.trim();

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/backstage-leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(status !== lead.status ? { status } : {}),
        internalNote: note,
        ...(status === "REJECTED" ? { rejectionReason: reason } : {}),
      }),
    }).catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      notify("error", "No se pudo guardar");
      return;
    }
    notify("success", "Guardado");
    onSaved();
  };

  return (
    <li className="rounded-[28px] bg-raised p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display truncate text-xl font-semibold text-white">
            {lead.venue}
          </h3>
          <p className="mt-0.5 text-sm text-white/50">
            {lead.city} · {SYSTEM[lead.system]} · {date(lead.createdAt)}
          </p>
        </div>
        <Pill status={lead.status} />
      </div>

      <dl className="mt-4 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="text-white/40">Contacto</dt>
          <dd className="text-white/85">{lead.name}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-white/40">Correo</dt>
          <dd>
            <a
              className="text-white/85 underline-offset-2 hover:underline"
              href={`mailto:${lead.email}`}
            >
              {lead.email}
            </a>
          </dd>
        </div>
        {lead.phone ? (
          <div className="flex gap-2">
            <dt className="text-white/40">Teléfono</dt>
            <dd className="text-white/85">{lead.phone}</dd>
          </div>
        ) : null}
      </dl>
      {lead.message ? (
        <p className="mt-3 rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white/70">
          {lead.message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-[220px_1fr]">
        <Select
          label="Estado"
          value={status}
          onChange={setStatus}
          options={STATUSES.map((s) => ({ value: s, label: LABEL[s] }))}
        />
        <textarea
          className={`${field} min-h-[44px] resize-y`}
          rows={1}
          placeholder="Nota interna (solo la ve el equipo)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={2000}
        />
      </div>
      {status === "REJECTED" ? (
        <input
          className={`${field} mt-3`}
          placeholder="Motivo del rechazo (obligatorio)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
        />
      ) : null}
      {lead.status === "APPROVED" && lead.activationToken ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/[0.05] px-3 py-2 text-xs text-white/60">
          <span className="min-w-0 flex-1 truncate">
            {activationUrl(lead.activationToken)}
          </span>
          <button
            type="button"
            className="shrink-0 text-white hover:underline"
            onClick={() =>
              navigator.clipboard?.writeText(activationUrl(lead.activationToken!))
            }
          >
            Copiar enlace
          </button>
        </div>
      ) : null}
      {dirty ? (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className={primaryButton}
            disabled={saving || needsReason}
            onClick={save}
          >
            Guardar
          </button>
          <button
            type="button"
            className={pillButton}
            disabled={saving}
            onClick={() => {
              setStatus(lead.status);
              setNote(lead.internalNote ?? "");
              setReason(lead.rejectionReason ?? "");
            }}
          >
            Descartar
          </button>
        </div>
      ) : null}
    </li>
  );
}

export function BackstageLeadsView() {
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    const query = filter === "ALL" ? "" : `?status=${filter}`;
    const res = await fetch(`/api/admin/backstage-leads${query}`).catch(
      () => null,
    );
    const data = res?.ok ? await res.json().catch(() => null) : null;
    if (!data) {
      setFailed(true);
      return;
    }
    setFailed(false);
    setLeads(data.leads ?? []);
    setCounts(data.counts ?? {});
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-4xl font-semibold text-white">
          Solicitudes de Backstage
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Salas que han pedido acceso: revisa, programa la demo y haz
          seguimiento.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["ALL", ...STATUSES] as const).map((s) => {
          const n = s === "ALL" ? total : (counts[s] ?? 0);
          const active = filter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm transition-colors ${
                active
                  ? "bg-white/[0.16] font-medium text-white"
                  : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white"
              }`}
            >
              {s === "ALL" ? "Todas" : LABEL[s]}
              <span className="tabular-nums text-white/40">{n}</span>
            </button>
          );
        })}
      </div>

      {failed ? (
        <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          No se pudieron cargar las solicitudes.
        </p>
      ) : leads === null ? (
        <p className="text-sm text-white/45">Cargando…</p>
      ) : leads.length === 0 ? (
        <p className="rounded-[28px] bg-raised p-8 text-center text-white/50">
          No hay solicitudes en este estado.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {leads.map((l) => (
            <LeadCard
              key={`${l.id}-${l.status}-${l.internalNote ?? ""}`}
              lead={l}
              onSaved={load}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
