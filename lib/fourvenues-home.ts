import type { MessageKey } from "@/lib/i18n";

/** Estado de la sincronización automática del catálogo (solo vínculos activos). */
export type SyncInfo = {
  phase: "PENDING" | "SYNCING" | "UPDATED" | "ERROR";
  at: string | null;
  withWarnings: boolean;
};

export type ChannelActivityItem = {
  id: string;
  type:
    | "LINK_STATUS"
    | "EVENT_SYNCED"
    | "EVENT_UNAVAILABLE"
    | "LIST_SIGNUP"
    | "BOOKING_REQUEST";
  at: string;
  /** Estado del vínculo (LINK_STATUS) o nombre del evento. Nunca datos personales. */
  label: string;
  /** BOOKING_REQUEST: resultado informado por Fourvenues. */
  detail?: string;
  eventId?: string;
};

export type FourvenuesHome = {
  link: {
    status: string;
    host: { name: string; slug: string; logoUrl: string | null };
    activatedAt: string | null;
    lastSyncAt: string | null;
    lastSyncStatus: string | null;
    sync?: SyncInfo | null;
  } | null;
  catalog: {
    upcoming: number;
    withOnSaleRates: number;
    needsConfirmation: number;
    unavailable: number;
    nextEvent: {
      id: string;
      name: string;
      date: string;
      endDate: string | null;
      location: string;
      externalRef: {
        timezone: string | null;
        displayDateRaw: string | null;
        fromPrice: number | null;
        currency: string | null;
      } | null;
    } | null;
  };
  channel: {
    source: "PARYUP_CHANNEL";
    enabled: { tickets: boolean; lists: boolean; bookings: boolean };
    /** null = no medido: todavía no hay operaciones hechas desde ParyUp. */
    totals: { tickets: number; lists: number; bookings: number } | null;
    bookingBreakdown?: { pending: number; accepted: number; rejected: number } | null;
    hasActivity: boolean;
  };
  activity: ChannelActivityItem[];
};

/** Clave del estado vacío de operaciones del canal, o null si hay datos reales que mostrar. */
export function channelEmptyKey(channel: FourvenuesHome["channel"]): MessageKey | null {
  if (channel.totals || channel.hasActivity) return null;
  return Object.values(channel.enabled).some(Boolean)
    ? "orgs.fvHome.emptyEnabled"
    : "orgs.fvHome.emptyDisabled";
}

const LINK_ACTIVITY: Record<string, MessageKey> = {
  PENDING_REVIEW: "orgs.fvHome.act.PENDING_REVIEW",
  REJECTED: "orgs.fvHome.act.REJECTED",
  CANCELLED: "orgs.fvHome.act.CANCELLED",
  ACTIVE: "orgs.fvHome.act.ACTIVE",
  SUSPENDED: "orgs.fvHome.act.SUSPENDED",
  REVOKED: "orgs.fvHome.act.REVOKED",
  DISCONNECTED: "orgs.fvHome.act.DISCONNECTED",
};

export function activityKey(item: ChannelActivityItem): {
  key: MessageKey;
  params?: Record<string, string>;
} {
  if (item.type === "EVENT_SYNCED") {
    return { key: "orgs.fvHome.act.eventSynced", params: { name: item.label } };
  }
  if (item.type === "EVENT_UNAVAILABLE") {
    return { key: "orgs.fvHome.act.eventUnavailable", params: { name: item.label } };
  }
  if (item.type === "LIST_SIGNUP") {
    return { key: "orgs.fvHome.act.listSignup", params: { name: item.label } };
  }
  if (item.type === "BOOKING_REQUEST") {
    const known = ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "UNCONFIRMED"];
    const key = (
      item.detail && known.includes(item.detail)
        ? `orgs.fvHome.act.booking.${item.detail}`
        : "orgs.fvHome.act.booking"
    ) as MessageKey;
    return { key, params: { name: item.label } };
  }
  return { key: LINK_ACTIVITY[item.label] ?? "orgs.fvHome.act.linkChanged" };
}

/** Estado de la última sincronización: clave + minutos/horas/días transcurridos. */
export function syncState(
  lastSyncAt: string | null | undefined,
  status: string | null | undefined,
  now = Date.now(),
): { key: MessageKey; params?: Record<string, number> } {
  if (!lastSyncAt) return { key: "orgs.fvHome.syncPending" };
  const mins = Math.max(0, Math.round((now - new Date(lastSyncAt).getTime()) / 60_000));
  const base =
    status === "OK"
      ? "orgs.fvHome.sync"
      : status === "PARTIAL"
        ? "orgs.fvHome.syncPartial"
        : "orgs.fvHome.syncFailed";
  if (mins < 1) return { key: `${base}.now` as MessageKey };
  if (mins < 60) return { key: `${base}.min` as MessageKey, params: { n: mins } };
  if (mins < 2880) return { key: `${base}.hours` as MessageKey, params: { n: Math.round(mins / 60) } };
  return { key: `${base}.days` as MessageKey, params: { n: Math.round(mins / 1440) } };
}

/** Clave de texto de la fase de sincronización; `{date}` se rellena con la fecha formateada. */
export function syncPhaseKey(sync: SyncInfo | null | undefined): MessageKey | null {
  if (!sync) return null;
  if (sync.phase === "PENDING") return "orgs.fvSync.pending";
  if (sync.phase === "SYNCING") return "orgs.fvSync.syncing";
  if (sync.phase === "UPDATED") return sync.withWarnings ? "orgs.fvSync.updatedWarn" : "orgs.fvSync.updated";
  return "orgs.fvSync.error";
}
