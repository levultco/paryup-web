"use client";

// Herramienta interna de ParyUp (solo administradores): textos solo en español.
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
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
    eventsSync?: {
      phase: string;
      at: string | null;
      withWarnings: boolean;
    } | null;
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

const STATUS_COLOR: Record<LinkStatus, string> = {
  PENDING_REVIEW: "#ffd60a",
  ACTIVE: "#30d158",
  SUSPENDED: "#ff9f0a",
  REVOKED: "#ff453a",
  REJECTED: "#ff453a",
  CANCELLED: "#8e8e93",
  DISCONNECTED: "#8e8e93",
};

const SYNC_LABEL: Record<string, string> = {
  PENDING: "Sincronización pendiente",
  SYNCING: "Sincronizando",
  UPDATED: "Actualizado",
  ERROR: "Error de sincronización",
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

const FILTERS = [
  "PENDING_REVIEW",
  "ACTIVE",
  "SUSPENDED",
  "REVOKED",
  "",
] as const;

// Curva de desaceleración sin rebote (tween, no resorte): llega al destino sin sobrepasarlo.
const EASE = [0.32, 0.72, 0, 1] as const;

type Rect = { x: number; y: number; w: number; h: number };

/** Caja final de la pantalla: hoja casi completa en móvil, tarjeta centrada en escritorio. */
function dialogRect(): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw < 640) {
    const h = Math.round(vh * 0.92);
    return { x: 0, y: vh - h, w: vw, h };
  }
  const w = Math.min(768, vw - 48);
  const h = Math.min(Math.round(vh * 0.88), 780);
  return { x: Math.round((vw - w) / 2), y: Math.round((vh - h) / 2), w, h };
}

const boxProps = (r: Rect, radius: number) => ({
  left: r.x,
  top: r.y,
  width: r.w,
  height: r.h,
  borderRadius: radius,
});

const inputClass =
  "w-full rounded-2xl bg-white/[0.07] px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 transition-shadow placeholder:text-white/35 focus:ring-white/40";

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

const date = (v: string) =>
  new Date(v).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });

function StatusBadge({ status }: { status: LinkStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: `${color}26`, color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

function Initial({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-white/10 font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-white/50">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-white/45">{label}</dt>
      <dd className="break-words text-[15px] text-white">{children}</dd>
    </div>
  );
}

/** Cara de la tarjeta: la misma en la lista y dentro de la pantalla al cerrarse, para que no haya salto. */
function RequestFace({ row }: { row: LinkRow }) {
  return (
    <>
      <span className="flex items-center gap-3">
        <Initial name={row.organization.name} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[17px] font-semibold text-white">
            {row.organization.name}
          </span>
          <span className="truncate text-sm text-white/50">
            @{row.organization.slug}
          </span>
        </span>
        <StatusBadge status={row.status} />
      </span>
      <span className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate text-white/80">
          {row.host ? row.host.name : "Sin sala asignada"}
        </span>
        <span className="shrink-0 text-white/45">{date(row.requestedAt)}</span>
      </span>
    </>
  );
}

export function FourvenuesAdminView() {
  const reduce = useReducedMotion();
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [filter, setFilter] = useState<LinkStatus | "">("PENDING_REVIEW");
  const [links, setLinks] = useState<LinkRow[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [origin, setOrigin] = useState<Rect | null>(null);
  const [target, setTarget] = useState<Rect | null>(null);
  const [closing, setClosing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<LinkRow | null>(null);
  const cells = useRef<Record<string, HTMLLIElement | null>>({});
  const [detail, setDetail] = useState<Detail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState("");
  const [note, setNote] = useState("");
  const [hosts, setHosts] = useState<CandidateHost[] | "error" | null>(null);
  const [hostId, setHostId] = useState("");
  const [ownershipChecked, setOwnershipChecked] = useState(false);
  /** Acción que pide motivo: se escribe dentro de la propia pantalla, sin diálogos del navegador. */
  const [askReason, setAskReason] = useState<{
    label: string;
    run: (reason: string) => void;
  } | null>(null);
  const [reason, setReason] = useState("");

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

  const link = detail && detail.link.id === selected ? detail.link : null;
  const faceRow = links?.find((l) => l.id === selected) ?? selectedRow;
  const pendingSelected = link?.status === "PENDING_REVIEW";

  useEffect(() => {
    if (!pendingSelected) return;
    // Cambio de solicitud: se reinicia la verificación para que no se arrastre a otra.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHostId("");
    setOwnershipChecked(false);
    setMethod("");
    setNote("");
    void call<{ hosts: CandidateHost[]; refresh: { ok: boolean } }>(
      "hosts",
    ).then((r) =>
      setHosts(r.ok && r.data?.refresh.ok ? r.data.hosts : "error"),
    );
  }, [pendingSelected, selected]);

  const openRequest = (id: string) => {
    const el = cells.current[id];
    if (!el) return;
    const r = el.getBoundingClientRect();
    setOrigin({ x: r.left, y: r.top, w: r.width, h: r.height });
    setTarget(dialogRect());
    setClosing(false);
    setSelectedRow(links?.find((x) => x.id === id) ?? null);
    setSelected(id);
  };

  /** Empieza el cierre: la caja vuelve a la tarjeta y al terminar se desmonta (finishClose). */
  const close = useCallback(() => {
    if (!selected || closing) return;
    const r = cells.current[selected]?.getBoundingClientRect();
    if (r) setOrigin({ x: r.left, y: r.top, w: r.width, h: r.height });
    setError(null);
    setAskReason(null);
    setReason("");
    setClosing(true);
  }, [selected, closing]);

  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  const finishClose = useCallback(() => {
    setSelected(null);
    setClosing(false);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const onResize = () => setTarget(dialogRect());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [selected]);

  // Escape cierra y el fondo no se desplaza mientras la pantalla está abierta.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    const { overflow, paddingRight } = document.body.style;
    // Al ocultar la barra de scroll la página se ensancha y la tarjeta se movería al cerrar:
    // se compensa su ancho para que el cierre vuelva exactamente al mismo sitio.
    const bar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (bar > 0) document.body.style.paddingRight = `${bar}px`;
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [selected]);

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
    setAskReason(null);
    setReason("");
    await loadList();
    if (selected) await loadDetail(selected);
  };

  const refreshHosts = async () => {
    setBusy(true);
    await call("hosts/refresh", {});
    setBusy(false);
  };

  const openObligations = useMemo(
    () =>
      detail ? Object.entries(detail.obligations).filter(([, v]) => v > 0) : [],
    [detail],
  );

  const lifecycle = link
    ? (
        [
          ["suspend", "Suspender", ["ACTIVE"]],
          ["reactivate", "Reactivar", ["SUSPENDED", "REVOKED"]],
          ["revoke", "Marcar revocada", ["ACTIVE", "SUSPENDED"]],
          ["disconnect", "Desconectar", ["ACTIVE", "SUSPENDED", "REVOKED"]],
        ] as const
      ).filter(([, , from]) =>
        (from as readonly string[]).includes(link.status),
      )
    : [];

  const canReturnNative =
    !!link &&
    link.organization.commercialMode === "FOURVENUES" &&
    ["DISCONNECTED", "REJECTED", "CANCELLED"].includes(link.status);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">
            Vinculaciones Fourvenues
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-white/55">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: !health
                  ? "#8e8e93"
                  : health.ok
                    ? "#30d158"
                    : "#ff453a",
              }}
            />
            {health
              ? health.ok
                ? `Channel Manager ${String(health.environment)} · ${String(health.hosts)} salas autorizadas`
                : `Channel Manager no disponible (${String(health.error)})`
              : "Comprobando Channel Manager…"}
          </p>
        </div>
        <button
          type="button"
          className={pillButton}
          disabled={busy}
          onClick={() => void refreshHosts()}
        >
          Actualizar salas autorizadas
        </button>
      </header>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Estado">
        {FILTERS.map((s) => (
          <button
            key={s || "all"}
            type="button"
            role="tab"
            aria-selected={filter === s}
            className={`${pillButton} ${filter === s ? "!bg-white !text-black" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s ? STATUS_LABEL[s] : "Todas"}
          </button>
        ))}
      </div>

      {links === null ? (
        <p className="text-sm text-white/50">Cargando solicitudes…</p>
      ) : links.length === 0 ? (
        <p className="rounded-3xl bg-raised p-8 text-center text-white/50 ring-1 ring-white/[0.08]">
          No hay solicitudes en este estado.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {links.map((l) => {
            const open = selected === l.id;
            return (
              <li
                key={l.id}
                ref={(el) => {
                  cells.current[l.id] = el;
                }}
              >
                {open ? (
                  // Hueco con el mismo tamaño mientras la pantalla ocupa su lugar.
                  <div className="invisible h-full min-h-[132px] rounded-[28px]" />
                ) : (
                  <button
                    type="button"
                    onClick={() => openRequest(l.id)}
                    style={{ borderRadius: 28 }}
                    className="flex h-full w-full flex-col gap-4 bg-raised p-5 text-left ring-1 ring-white/[0.08] transition-[background-color,transform] duration-150 hover:bg-white/[0.07] active:scale-[0.985]"
                  >
                    <RequestFace row={l} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {selected && origin && target
        ? createPortal(
            <>
              <motion.div
                aria-hidden
                onClick={close}
                className="fixed inset-0 z-[1090] bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: closing ? 0 : 1 }}
                transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
              />
              <motion.div
                initial={boxProps(origin, 28)}
                animate={boxProps(closing ? origin : target, closing ? 28 : 32)}
                transition={{
                  duration: reduce ? 0 : closing ? 0.38 : 0.46,
                  ease: EASE,
                }}
                onAnimationComplete={() => {
                  if (closing) finishClose();
                }}
                role="dialog"
                aria-modal="true"
                aria-label="Revisión de la solicitud"
                className="fixed z-[1100] flex flex-col overflow-hidden bg-raised ring-1 ring-white/[0.08]"
              >
                {/* Cara de tarjeta: visible solo cuando la caja es del tamaño de la tarjeta. */}
                {faceRow ? (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex flex-col gap-4 p-5 text-left"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: closing ? 1 : 0 }}
                    transition={
                      closing
                        ? { duration: 0.2, delay: 0.14, ease: EASE }
                        : { duration: 0.14, ease: EASE }
                    }
                  >
                    <RequestFace row={faceRow} />
                  </motion.div>
                ) : null}
                <motion.div
                  className="flex min-h-0 flex-1 flex-col"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: closing ? 0 : 1 }}
                  transition={
                    closing
                      ? { duration: 0.12, ease: EASE }
                      : { duration: 0.25, delay: reduce ? 0 : 0.2, ease: EASE }
                  }
                >
                  <div className="flex items-center gap-3 px-6 pb-4 pt-6">
                    <Initial
                      name={
                        link?.organization.name ??
                        links?.find((l) => l.id === selected)?.organization
                          .name ??
                        ""
                      }
                      size={48}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h2 className="truncate font-display text-2xl font-semibold text-white">
                        {link?.organization.name ??
                          links?.find((l) => l.id === selected)?.organization
                            .name}
                      </h2>
                      <p className="truncate text-sm text-white/50">
                        @
                        {link?.organization.slug ??
                          links?.find((l) => l.id === selected)?.organization
                            .slug}
                      </p>
                    </div>
                    {link ? <StatusBadge status={link.status} /> : null}
                    <button
                      type="button"
                      aria-label="Cerrar"
                      onClick={close}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-[background-color,transform] duration-100 hover:bg-white/15 active:scale-90"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        aria-hidden
                      >
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>

                  <motion.div className="flex min-h-0 flex-1 flex-col">
                    {!link || !detail ? (
                      <p className="px-6 pb-8 text-sm text-white/50">
                        Cargando solicitud…
                      </p>
                    ) : (
                      <>
                        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6">
                          <Section title="Quién solicita">
                            <dl className="grid gap-x-6 gap-y-4 rounded-3xl bg-white/[0.04] p-5 sm:grid-cols-2">
                              <Field label="Solicitante">
                                {link.requestedBy
                                  ? `${link.requestedBy.name} · ${link.requestedBy.email}`
                                  : "—"}
                              </Field>
                              <Field label="Contacto">
                                {link.contactName} · {link.contactEmail}
                                {link.contactPhone
                                  ? ` · ${link.contactPhone}`
                                  : ""}
                              </Field>
                              <Field label="Propietarios">
                                {link.organization.members
                                  .map(
                                    (m) => `${m.user.name} <${m.user.email}>`,
                                  )
                                  .join(", ") || "—"}
                              </Field>
                              <Field label="Solicitada">
                                {date(link.requestedAt)}
                              </Field>
                              {link.requestNote ? (
                                <div className="sm:col-span-2">
                                  <Field label="Nota del solicitante">
                                    {link.requestNote}
                                  </Field>
                                </div>
                              ) : null}
                            </dl>
                          </Section>

                          <Section title="Organización y sala">
                            <dl className="grid gap-x-6 gap-y-4 rounded-3xl bg-white/[0.04] p-5 sm:grid-cols-2">
                              <Field label="Modo comercial">
                                {link.organization.commercialMode}
                              </Field>
                              <Field label="Creada">
                                {date(link.organization.createdAt)}
                                {link.organization.city
                                  ? ` · ${link.organization.city}`
                                  : ""}
                                {link.organization.isVerified
                                  ? " · verificada"
                                  : ""}
                              </Field>
                              <Field label="Sala Fourvenues">
                                {link.host
                                  ? `${link.host.name} (${link.host.slug})`
                                  : "Sin asignar: se elige al aprobar"}
                              </Field>
                              {detail.fourvenues ? (
                                <Field label="Fourvenues en vivo">
                                  {detail.fourvenues.ok
                                    ? detail.fourvenues.organization
                                      ? `${detail.fourvenues.organization.name} (${detail.fourvenues.organization.slug})`
                                      : "No visible para el canal"
                                    : `Error: ${detail.fourvenues.error}`}
                                </Field>
                              ) : null}
                              {link.eventsSync ? (
                                <Field label="Sincronización de eventos">
                                  {SYNC_LABEL[link.eventsSync.phase] ??
                                    link.eventsSync.phase}
                                  {link.eventsSync.at
                                    ? ` · ${date(link.eventsSync.at)}`
                                    : ""}
                                </Field>
                              ) : null}
                            </dl>
                          </Section>

                          <Section title="Obligaciones nativas abiertas">
                            {openObligations.length === 0 ? (
                              <p className="rounded-3xl bg-white/[0.04] px-5 py-4 text-sm text-white/60">
                                Ninguna. Se puede cambiar de modo sin dejar nada
                                pendiente.
                              </p>
                            ) : (
                              <ul className="flex flex-col gap-2 rounded-3xl bg-[#ffd60a]/10 p-5">
                                {openObligations.map(([k, v]) => (
                                  <li
                                    key={k}
                                    className="flex items-center justify-between gap-4 text-sm"
                                  >
                                    <span className="text-white/85">
                                      {OBLIGATION_LABEL[k] ?? k}
                                    </span>
                                    <span className="font-semibold text-[#ffd60a]">
                                      {v}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </Section>

                          {link.history.length > 0 ? (
                            <details className="group rounded-3xl bg-white/[0.04] px-5 py-4">
                              <summary className="cursor-pointer list-none text-sm font-medium text-white/70 outline-none">
                                Historial ({link.history.length})
                              </summary>
                              <ul className="mt-3 flex flex-col gap-3">
                                {link.history.map((h) => (
                                  <li
                                    key={h.id}
                                    className="flex flex-col gap-0.5"
                                  >
                                    <span className="text-xs text-white/45">
                                      {date(h.createdAt)} · {h.actorType}
                                    </span>
                                    <span className="text-sm text-white/85">
                                      {h.fromStatus
                                        ? STATUS_LABEL[h.fromStatus]
                                        : "—"}{" "}
                                      → {STATUS_LABEL[h.toStatus]}
                                      {h.reason ? ` · ${h.reason}` : ""}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          ) : null}

                          {pendingSelected ? (
                            <Section title="Asignar sala y aprobar">
                              <div className="flex flex-col gap-3 rounded-3xl bg-white/[0.04] p-5">
                                <p className="text-sm text-white/55">
                                  Aparecer entre las salas autorizadas no prueba
                                  la titularidad. Verifica por un canal oficial
                                  que el solicitante representa a la sala antes
                                  de aprobar.
                                </p>
                                {hosts === null ? (
                                  <p className="text-sm text-white/50">
                                    Cargando salas autorizadas…
                                  </p>
                                ) : hosts === "error" ? (
                                  <p className="text-sm text-[#ff453a]">
                                    No se pudo consultar Fourvenues. No se puede
                                    aprobar ahora.
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
                                      <option
                                        key={h.id}
                                        value={h.id}
                                        disabled={!!h.linkedTo}
                                        className="bg-black"
                                      >
                                        {h.name}
                                        {h.linkedTo
                                          ? ` · ya vinculada a ${h.linkedTo.organization.name}`
                                          : ""}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                <label className="flex cursor-pointer items-start gap-3 text-sm text-white/85">
                                  <input
                                    type="checkbox"
                                    checked={ownershipChecked}
                                    onChange={(e) =>
                                      setOwnershipChecked(e.target.checked)
                                    }
                                    className="mt-0.5 h-4 w-4 shrink-0 accent-white"
                                  />
                                  He comprobado que esta sala corresponde a esta
                                  organización y que quien la solicita puede
                                  representarla. Queda registrado quién aprobó,
                                  qué organización y qué sala, y cuándo.
                                </label>
                                <details>
                                  <summary className="cursor-pointer text-sm text-white/60 outline-none">
                                    Detalles de la comprobación (opcional)
                                  </summary>
                                  <div className="mt-3 flex flex-col gap-3">
                                    <select
                                      className={inputClass}
                                      value={method}
                                      onChange={(e) =>
                                        setMethod(e.target.value)
                                      }
                                    >
                                      <option value="" className="bg-black">
                                        Cómo se comprobó
                                      </option>
                                      {VERIFICATION_METHODS.map(
                                        ([value, label]) => (
                                          <option
                                            key={value}
                                            value={value}
                                            className="bg-black"
                                          >
                                            {label}
                                          </option>
                                        ),
                                      )}
                                    </select>
                                    <textarea
                                      className={`${inputClass} min-h-20`}
                                      placeholder="Nota: persona, fecha y canal"
                                      value={note}
                                      onChange={(e) => setNote(e.target.value)}
                                    />
                                  </div>
                                </details>
                              </div>
                            </Section>
                          ) : null}

                          {error ? (
                            <p
                              role="alert"
                              className="rounded-2xl bg-[#ff453a]/10 px-4 py-3 text-sm text-[#ff6961]"
                            >
                              {error}
                            </p>
                          ) : null}
                        </div>

                        <div className="border-t border-white/[0.08] bg-raised px-6 py-4">
                          {askReason ? (
                            <form
                              className="flex flex-col gap-3 sm:flex-row"
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (reason.trim().length >= 3)
                                  askReason.run(reason.trim());
                              }}
                            >
                              <input
                                autoFocus
                                className={inputClass}
                                placeholder={`Motivo: ${askReason.label} (mín. 3 caracteres)`}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  className={`${primaryButton} shrink-0`}
                                  disabled={busy || reason.trim().length < 3}
                                >
                                  Confirmar
                                </button>
                                <button
                                  type="button"
                                  className={`${pillButton} shrink-0`}
                                  onClick={() => {
                                    setAskReason(null);
                                    setReason("");
                                  }}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              {pendingSelected ? (
                                <>
                                  <button
                                    type="button"
                                    className={primaryButton}
                                    disabled={
                                      busy || !hostId || !ownershipChecked
                                    }
                                    onClick={() =>
                                      void act(
                                        `link-requests/${link.id}/approve`,
                                        {
                                          hostId,
                                          confirmedOwnership: ownershipChecked,
                                          ...(method
                                            ? { verificationMethod: method }
                                            : {}),
                                          ...(note.trim()
                                            ? { verificationNote: note.trim() }
                                            : {}),
                                        },
                                      )
                                    }
                                  >
                                    Aprobar y activar Fourvenues
                                  </button>
                                  <button
                                    type="button"
                                    className={dangerButton}
                                    disabled={busy}
                                    onClick={() =>
                                      setAskReason({
                                        label: "rechazo",
                                        run: (r) =>
                                          void act(
                                            `link-requests/${link.id}/reject`,
                                            { reason: r },
                                          ),
                                      })
                                    }
                                  >
                                    Rechazar
                                  </button>
                                </>
                              ) : null}
                              {lifecycle.map(([action, label]) => (
                                <button
                                  key={action}
                                  type="button"
                                  className={
                                    action === "disconnect"
                                      ? dangerButton
                                      : pillButton
                                  }
                                  disabled={busy}
                                  onClick={() =>
                                    setAskReason({
                                      label: label.toLowerCase(),
                                      run: (r) =>
                                        void act(`links/${link.id}/${action}`, {
                                          reason: r,
                                        }),
                                    })
                                  }
                                >
                                  {label}
                                </button>
                              ))}
                              {canReturnNative ? (
                                <button
                                  type="button"
                                  className={pillButton}
                                  disabled={busy}
                                  onClick={() =>
                                    setAskReason({
                                      label:
                                        "volver a NATIVE (confirma Stripe y catálogo)",
                                      run: (r) =>
                                        void act(
                                          `organizations/${link.organizationId}/native-mode`,
                                          { reason: r },
                                        ),
                                    })
                                  }
                                >
                                  Devolver la organización a NATIVE
                                </button>
                              ) : null}
                              {!pendingSelected &&
                              lifecycle.length === 0 &&
                              !canReturnNative ? (
                                <p className="text-sm text-white/45">
                                  Sin acciones disponibles en este estado.
                                </p>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
