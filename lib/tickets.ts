import { nightKey } from "@/lib/discovery";

// Mismas reglas que paryup-app/src/lib/tickets/ticketsApi.ts y la pantalla de entradas.

export type TicketStatus =
  "ACTIVE" | "USED" | "EXPIRED" | "CANCELLED" | "REFUNDED";

export type MyTicket = {
  id: string;
  isAdmissionTicket?: boolean;
  accessType?: "TICKET" | "LIST";
  status?: TicketStatus;
  quantity: number;
  event: {
    id: string;
    name: string;
    date: string;
    endDate?: string | null;
    location?: string | null;
    coverImage?: string | null;
  };
  ticket?: { id: string; name: string; price: number; currency: string } | null;
  qrToken?: string;
  eventEndDate?: string | null;
  organizationName?: string;
};

export type TicketGroups = {
  tonight: MyTicket[];
  upcoming: MyTicket[];
  past: MyTicket[];
};

type Temporal = "ACTIVE" | "NOT_STARTED" | "ENDED" | "UNKNOWN";

const TICKET_QR_PREFIX = "pup:tix:";

function toDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function temporalStatus(ticket: MyTicket, now: Date): Temporal {
  const start = toDate(ticket.event.date);
  if (!start) return "UNKNOWN";
  const end = toDate(ticket.event.endDate ?? ticket.eventEndDate);
  const validEnd = end && end.getTime() >= start.getTime() ? end : null;

  if (validEnd && start <= now && validEnd >= now) return "ACTIVE";
  if (start > now) return "NOT_STARTED";
  if ((validEnd ?? start) < now) return "ENDED";
  return "UNKNOWN";
}

export function isPastTicket(ticket: MyTicket, now: Date) {
  return (
    ticket.status === "USED" ||
    ticket.status === "EXPIRED" ||
    ticket.status === "CANCELLED" ||
    ticket.status === "REFUNDED" ||
    temporalStatus(ticket, now) === "ENDED"
  );
}

/**
 * Esta noche / próximas / anteriores. La "noche" va de las 10:00 a las 10:00
 * (Madrid), así que una entrada para las 02:00 del sábado cuenta para el viernes.
 */
export function groupTickets(tickets: MyTicket[], now: Date): TicketGroups {
  const tonight = nightKey(now);
  const time = (ticket: MyTicket) => toDate(ticket.event.date)?.getTime() ?? 0;
  const result: TicketGroups = { tonight: [], upcoming: [], past: [] };

  for (const ticket of [...tickets].sort((a, b) => time(a) - time(b))) {
    if (isPastTicket(ticket, now)) result.past.push(ticket);
    else if (nightKey(new Date(ticket.event.date)) <= tonight) {
      result.tonight.push(ticket);
    } else result.upcoming.push(ticket);
  }
  result.past.reverse();
  return result;
}

type T = (key: string, params?: Record<string, string | number>) => string;

export const typeLabel = (ticket: MyTicket, t: T) =>
  ticket.accessType === "LIST"
    ? t("ticket.typeList")
    : (ticket.ticket?.name ?? t("ticket.typeTicket"));

export function availabilityLabel(ticket: MyTicket, now: Date, t: T) {
  if (ticket.status === "USED") return t("ticket.used");
  if (ticket.status === "EXPIRED") return t("ticket.expired");
  if (ticket.status === "CANCELLED") return t("ticket.cancelled");
  if (ticket.status === "REFUNDED") return t("ticket.refunded");

  const status = temporalStatus(ticket, now);
  if (status === "ENDED") return t("ticket.ended");
  if (status === "NOT_STARTED") return t("ticket.next");
  if (ticket.accessType === "LIST") return t("ticket.inList");
  return t("ticket.active");
}

/** El QR solo se enseña mientras el evento está en curso y la entrada sigue activa. */
export function isQrUsable(ticket: MyTicket, now: Date) {
  if (ticket.status && ticket.status !== "ACTIVE") return false;
  return temporalStatus(ticket, now) === "ACTIVE";
}

export function qrUnavailableReason(ticket: MyTicket, now: Date, t: T) {
  if (ticket.status === "USED") return t("ticket.used");
  if (ticket.status === "EXPIRED") return t("ticket.expired");
  if (ticket.status === "CANCELLED") return t("ticket.cancelled");
  if (ticket.status === "REFUNDED") return t("ticket.refunded");
  const status = temporalStatus(ticket, now);
  if (status === "ENDED") return t("ticket.ended");
  if (status === "NOT_STARTED") return t("ticket.qrNotStarted");
  return t("ticket.qrUnavailable");
}

export function qrValue(ticket: MyTicket, now: Date) {
  if (!isQrUsable(ticket, now)) return null;
  return (
    ticket.qrToken ||
    (ticket.isAdmissionTicket ? null : `${TICKET_QR_PREFIX}${ticket.id}`)
  );
}
