"use client";

// Herramienta interna de ParyUp (solo administradores): textos solo en español.
import { useCallback, useEffect, useState } from "react";
import { Group } from "@/components/organizations/promoters-ui";
import {
  dangerButton,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";

type LinkStatus =
  | "PENDING_REVIEW"
  | "REJECTED"
  | "CANCELLED"
  | "ACTIVE"
  | "SUSPENDED"
  | "REVOKED"
  | "DISCONNECTED";

type LinkRow = {
  id: string;
  status: LinkStatus;
  requestedAt: string;
  contactName: string;
  /** null mientras la solicitud no tiene venue: lo asigna un administrador al aprobar. */
  host: { name: string; slug: string } | null;
  fvHostId?: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    commercialMode: string;
  };
};

type Detail = {
  link: LinkRow & {
    contactEmail: string;
    contactPhone: string | null;
    requestNote: string | null;
    eventsSync?: { phase: string; at: string | null; withWarnings: boolean } | null;
    organizationId: string;
    organization: LinkRow["organization"] & {
      city: string | null;
      isVerified: boolean;
      createdAt: string;
      members: { user: { name: string; email: string } }[];
    };
    requestedBy: { name: string; email: string } | null;
    history: {
      id: string;
      fromStatus: LinkStatus | null;
      toStatus: LinkStatus;
      actorType: string;
      reason: string | null;
      createdAt: string;
    }[];
  };
  obligations: Record<string, number>;
  fourvenues:
    | { ok: true; organization: { name: string; slug: string } | null }
    | { ok: false; error: string }
    | null;
};

type CandidateHost = {
  id: string;
  name: string;
  slug: string;
  linkedTo: { organization: { name: string } } | null;
};

const STATUS_LABEL: Record<LinkStatus, string> = {
  PENDING_REVIEW: "Pendiente",
  REJECTED: "Rechazada",
  CANCELLED: "Retirada",
  ACTIVE: "Activa",
  SUSPENDED: "Suspendida",
  REVOKED: "Revocada",
  DISCONNECTED: "Desconectada",
};

const OBLIGATION_LABEL: Record<string, string> = {
  upcomingNativeEvents: "Eventos nativos publicados sin terminar",
  activeAdmissionTickets: "Entradas nativas sin validar",
  activeListEntries: "Altas de lista nativas activas",
  openAccessRequests: "Solicitudes nativas abiertas",
  pendingOrders: "Órdenes pendientes de pago",
  openPromoterSettlements: "Liquidaciones de promotores abiertas",
  unsettledPromoterCommissions: "Comisiones de promotores sin liquidar",
};

const VERIFICATION_METHODS = [
  ["ACCOUNT_MANAGER", "Confirmado por el Account Manager de Fourvenues"],
  ["VENUE_OFFICIAL_CONTACT", "Contacto oficial de la sala"],
  ["DOCUMENTATION", "Documentación aportada"],
  ["OTHER", "Otro"],
] as const;

const inputClass =
  "w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/60";

async function call<T>(path: string, body?: unknown) {
  const res = await fetch(`/api/admin/fourvenues/${path}`, {
    method: body === undefined ? "GET" : "POST",
    ...(body === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
  }).catch(() => null);
  const data = res ? await res.json().catch(() => null) : null;
  return { ok: !!res?.ok, data: data as T | null };
}

const date = (v: string) => new Date(v).toLocaleString("es-ES");

export function FourvenuesAdminView() {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [filter, setFilter] = useState<LinkStatus | "">("PENDING_REVIEW");
  const [links, setLinks] = useState<LinkRow[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<string>("");
  const [note, setNote] = useState("");
  const [hosts, setHosts] = useState<CandidateHost[] | "error" | null>(null);
  const [hostId, setHostId] = useState("");
  const [ownershipChecked, setOwnershipChecked] = useState(false);

  const loadList = useCallback(async () => {
    const r = await call<{ links: LinkRow[] }>(
      `link-requests${filter ? `?status=${filter}` : ""}`,
    );
    setLinks(r.data?.links ?? []);
  }, [filter]);

  const loadDetail = useCallback(async (id: string) => {
    const r = await call<Detail>(`link-requests/${id}`);
    setDetail(r.data);
  }, []);

  useEffect(() => {
    void call<Record<string, unknown>>("health").then((r) => setHealth(r.data));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadList();
  }, [loadList]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selected) void loadDetail(selected);
  }, [selected, loadDetail]);

  const pendingSelected = detail?.link.status === "PENDING_REVIEW";
  useEffect(() => {
    if (!pendingSelected) return;
    // Cambio de solicitud: se reinicia la verificación para que no se arrastre a otra.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHostId("");
    setOwnershipChecked(false);
    setMethod("");
    setNote("");
    void call<{ hosts: CandidateHost[]; refresh: { ok: boolean } }>("hosts").then((r) =>
      setHosts(r.ok && r.data?.refresh.ok ? r.data.hosts : "error"),
    );
  }, [pendingSelected, selected]);

  const act = async (path: string, body: unknown) => {
    setBusy(true);
    setError(null);
    const r = await call<{ message?: string }>(path, body);
    setBusy(false);
    if (!r.ok) {
      setError(r.data?.message ?? "La operación no se pudo completar");
      return;
    }
    setNote("");
    await loadList();
    if (selected) await loadDetail(selected);
  };

  const askReason = (label: string) => {
    const reason = window.prompt(label)?.trim();
    return reason && reason.length >= 3 ? reason : null;
  };

  const link = detail?.link;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">
            Vinculaciones Fourvenues
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {health
              ? health.ok
                ? `Channel Manager ${String(health.environment)} · canal ${String((health.channel as { name?: string })?.name ?? "")} · ${String(health.hosts)} salas autorizadas`
                : `Channel Manager no disponible (${String(health.error)})`
              : "Comprobando Channel Manager…"}
          </p>
        </div>
        <button
          type="button"
          className={pillButton}
          disabled={busy}
          onClick={() => void act("hosts/refresh", {})}
        >
          Actualizar salas autorizadas
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["PENDING_REVIEW", "ACTIVE", "SUSPENDED", "REVOKED", ""] as const).map(
          (s) => (
            <button
              key={s || "all"}
              type="button"
              className={`${pillButton} ${filter === s ? "!bg-white !text-black" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s ? STATUS_LABEL[s] : "Todas"}
            </button>
          ),
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Group title="Solicitudes">
          {links === null ? (
            <li className="px-4 py-4 text-sm text-white/50">Cargando…</li>
          ) : links.length === 0 ? (
            <li className="px-4 py-4 text-sm text-white/50">Sin solicitudes.</li>
          ) : (
            links.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setSelected(l.id)}
                  className={`flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] ${selected === l.id ? "bg-white/[0.06]" : ""}`}
                >
                  <span className="text-[15px] font-semibold text-white">
                    {l.organization.name}{l.host ? ` → ${l.host.name}` : " · sin sala asignada"}
                  </span>
                  <span className="text-xs text-white/50">
                    {STATUS_LABEL[l.status]} · {date(l.requestedAt)}
                  </span>
                </button>
              </li>
            ))
          )}
        </Group>

        {link ? (
          <div className="flex flex-col gap-6">
            <Group title="Solicitud">
              <Info label="Estado" value={STATUS_LABEL[link.status]} />
              <Info
                label="Organización ParyUp"
                value={`${link.organization.name} (@${link.organization.slug}) · ${link.organization.commercialMode}`}
              />
              <Info
                label="Propietarios"
                value={link.organization.members
                  .map((m) => `${m.user.name} <${m.user.email}>`)
                  .join(", ")}
              />
              <Info
                label="Solicitante"
                value={
                  link.requestedBy
                    ? `${link.requestedBy.name} <${link.requestedBy.email}>`
                    : "—"
                }
              />
              <Info
                label="Contacto"
                value={`${link.contactName} · ${link.contactEmail}${link.contactPhone ? ` · ${link.contactPhone}` : ""}`}
              />
              {link.requestNote ? (
                <Info label="Nota" value={link.requestNote} />
              ) : null}
              <Info
                label="Organización creada"
                value={`${date(link.organization.createdAt)}${link.organization.city ? ` · ${link.organization.city}` : ""}${link.organization.isVerified ? " · verificada" : ""}`}
              />
              <Info label="Solicitada" value={date(link.requestedAt)} />
              {link.eventsSync ? (
                <Info
                  label="Sincronización de eventos"
                  value={`${{ PENDING: "Sincronización pendiente", SYNCING: "Sincronizando", UPDATED: "Actualizado", ERROR: "Error de sincronización" }[link.eventsSync.phase] ?? link.eventsSync.phase}${link.eventsSync.at ? ` · ${date(link.eventsSync.at)}` : ""}`}
                />
              ) : null}
              {link.host ? (
                <Info label="Sala Fourvenues" value={`${link.host.name} (${link.host.slug})`} />
              ) : (
                <Info label="Sala Fourvenues" value="Sin asignar: se elige al aprobar" />
              )}
              {detail.fourvenues ? (
              <Info
                label="Fourvenues en vivo"
                value={
                  detail.fourvenues.ok
                    ? detail.fourvenues.organization
                      ? `${detail.fourvenues.organization.name} (${detail.fourvenues.organization.slug})`
                      : "No visible para el canal"
                    : `Error: ${detail.fourvenues.error}`
                }
              />
              ) : null}
            </Group>

            <Group title="Obligaciones nativas abiertas">
              {Object.entries(detail.obligations).map(([k, v]) => (
                <Info key={k} label={OBLIGATION_LABEL[k] ?? k} value={String(v)} />
              ))}
            </Group>

            <p className="px-4 text-xs text-white/40">
              Aparecer entre las salas autorizadas no prueba la titularidad.
              Verifica por un canal oficial que el solicitante representa a la
              sala antes de aprobar.
            </p>

            {error ? <p className="px-4 text-sm text-red-400">{error}</p> : null}

            {link.status === "PENDING_REVIEW" ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-white">Asignar sala y aprobar</p>
                {hosts === null ? (
                  <p className="text-sm text-white/50">Cargando salas autorizadas…</p>
                ) : hosts === "error" ? (
                  <p className="text-sm text-red-400">
                    No se pudo consultar Fourvenues. No se puede aprobar ahora.
                  </p>
                ) : (
                  <select
                    className={inputClass}
                    value={hostId}
                    onChange={(e) => setHostId(e.target.value)}
                  >
                    <option value="" className="bg-black">
                      Elige la sala de Fourvenues
                    </option>
                    {hosts.map((h) => (
                      <option key={h.id} value={h.id} disabled={!!h.linkedTo} className="bg-black">
                        {h.name}
                        {h.linkedTo ? ` · ya vinculada a ${h.linkedTo.organization.name}` : ""}
                      </option>
                    ))}
                  </select>
                )}
                <label className="flex items-start gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={ownershipChecked}
                    onChange={(e) => setOwnershipChecked(e.target.checked)}
                    className="mt-1"
                  />
                  He comprobado que esta sala corresponde a esta organización y que quien la solicita puede
                  representarla.
                </label>
                <p className="text-xs text-white/40">
                  Estar autorizada en Fourvenues no demuestra la titularidad: la comprobación es tuya. Queda
                  registrado quién aprobó, qué organización y qué sala, y cuándo.
                </p>
                <details className="rounded-2xl border border-white/10 px-4 py-3">
                  <summary className="cursor-pointer text-sm text-white/70">
                    Detalles de la comprobación (opcional)
                  </summary>
                  <div className="mt-3 flex flex-col gap-3">
                    <select className={inputClass} value={method} onChange={(e) => setMethod(e.target.value)}>
                      <option value="" className="bg-black">
                        Cómo se comprobó
                      </option>
                      {VERIFICATION_METHODS.map(([value, label]) => (
                        <option key={value} value={value} className="bg-black">
                          {label}
                        </option>
                      ))}
                    </select>
                    <textarea
                      className={`${inputClass} min-h-20`}
                      placeholder="Nota: persona, fecha y canal"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </details>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={primaryButton}
                    disabled={
                      busy || !hostId || !ownershipChecked
                    }
                    onClick={() =>
                      void act(`link-requests/${link.id}/approve`, {
                        hostId,
                        confirmedOwnership: ownershipChecked,
                        ...(method ? { verificationMethod: method } : {}),
                        ...(note.trim() ? { verificationNote: note.trim() } : {}),
                      })
                    }
                  >
                    Aprobar y activar FOURVENUES
                  </button>
                  <button
                    type="button"
                    className={dangerButton}
                    disabled={busy}
                    onClick={() => {
                      const reason = askReason("Motivo del rechazo");
                      if (reason)
                        void act(`link-requests/${link.id}/reject`, { reason });
                    }}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ) : null}

            {["ACTIVE", "SUSPENDED", "REVOKED"].includes(link.status) ? (
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["suspend", "Suspender", ["ACTIVE"]],
                    ["reactivate", "Reactivar", ["SUSPENDED", "REVOKED"]],
                    ["revoke", "Marcar revocada", ["ACTIVE", "SUSPENDED"]],
                    ["disconnect", "Desconectar", ["ACTIVE", "SUSPENDED", "REVOKED"]],
                  ] as const
                )
                  .filter(([, , from]) =>
                    (from as readonly string[]).includes(link.status),
                  )
                  .map(([action, label]) => (
                    <button
                      key={action}
                      type="button"
                      className={action === "disconnect" ? dangerButton : pillButton}
                      disabled={busy}
                      onClick={() => {
                        const reason = askReason(`Motivo: ${label}`);
                        if (reason)
                          void act(`links/${link.id}/${action}`, { reason });
                      }}
                    >
                      {label}
                    </button>
                  ))}
              </div>
            ) : null}

            {link.organization.commercialMode === "FOURVENUES" &&
            ["DISCONNECTED", "REJECTED", "CANCELLED"].includes(link.status) ? (
              <button
                type="button"
                className={pillButton}
                disabled={busy}
                onClick={() => {
                  const reason = askReason(
                    "Volver a NATIVE: confirma Stripe, catálogo y motivo",
                  );
                  if (reason)
                    void act(
                      `organizations/${link.organizationId}/native-mode`,
                      { reason },
                    );
                }}
              >
                Devolver la organización a NATIVE
              </button>
            ) : null}

            <Group title="Historial">
              {link.history.map((h) => (
                <Info
                  key={h.id}
                  label={`${date(h.createdAt)} · ${h.actorType}`}
                  value={`${h.fromStatus ? STATUS_LABEL[h.fromStatus] : "—"} → ${STATUS_LABEL[h.toStatus]}${h.reason ? ` · ${h.reason}` : ""}`}
                />
              ))}
            </Group>
          </div>
        ) : (
          <p className="text-sm text-white/40">
            Selecciona una solicitud para revisarla.
          </p>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex flex-col gap-0.5 px-4 py-3">
      <span className="text-xs text-white/40">{label}</span>
      <span className="break-words text-[14px] text-white/90">{value}</span>
    </li>
  );
}
