import type { Locale } from "@/lib/i18n";

export type ExternalListEntry = {
  id: string;
  state: "SENDING" | "CONFIRMED" | "FAILED" | "UNKNOWN";
  partySize: number;
  qrCode: string | null;
  entered: boolean;
  createdAt: string;
  event: { id: string; name: string; date: string } | null;
};

export type ExternalBooking = {
  id: string;
  outcome:
    | "SENDING"
    | "UNCONFIRMED"
    | "FAILED"
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "CANCELLED"
    | "CLOSED";
  quantity: number;
  qrCode: string | null;
  createdAt: string;
  event: { id: string; name: string; date: string } | null;
};

const COPY = {
  es: {
    title: "Fourvenues",
    hint: "Listas y solicitudes de reserva en eventos gestionados en Fourvenues",
    list: "Lista",
    booking: "Reserva",
    people: "{n} personas",
    qr: "QR de Fourvenues",
    qrPending: "Fourvenues todavía no ha devuelto el QR.",
    listState: {
      CONFIRMED: "Inscripción confirmada",
      UNKNOWN: "Pendiente de confirmar con Fourvenues",
      FAILED: "No se pudo completar",
      SENDING: "Enviando…",
      ENTERED: "Ya has entrado",
    },
    bookingState: {
      PENDING: "Pendiente: el local la revisará en Fourvenues",
      ACCEPTED: "Aceptada por el local",
      REJECTED: "Rechazada por el local",
      CANCELLED: "Cancelada",
      CLOSED: "Cerrada",
      UNCONFIRMED: "Pendiente de confirmar con Fourvenues",
      FAILED: "No se pudo enviar",
      SENDING: "Enviando…",
    },
  },
  en: {
    title: "Fourvenues",
    hint: "Guest lists and booking requests for events managed on Fourvenues",
    list: "Guest list",
    booking: "Booking",
    people: "{n} people",
    qr: "Fourvenues QR",
    qrPending: "Fourvenues hasn't returned the QR yet.",
    listState: {
      CONFIRMED: "Sign-up confirmed",
      UNKNOWN: "Awaiting confirmation from Fourvenues",
      FAILED: "Couldn't be completed",
      SENDING: "Sending…",
      ENTERED: "You've checked in",
    },
    bookingState: {
      PENDING: "Pending: the venue will review it on Fourvenues",
      ACCEPTED: "Accepted by the venue",
      REJECTED: "Declined by the venue",
      CANCELLED: "Cancelled",
      CLOSED: "Closed",
      UNCONFIRMED: "Awaiting confirmation from Fourvenues",
      FAILED: "Couldn't be sent",
      SENDING: "Sending…",
    },
  },
} as const;

export const registrationCopy = (locale: Locale) => COPY[locale] ?? COPY.es;

export function listStateLabel(entry: Pick<ExternalListEntry, "state" | "entered">, locale: Locale) {
  const c = registrationCopy(locale).listState;
  return entry.state === "CONFIRMED" && entry.entered ? c.ENTERED : c[entry.state];
}

export const bookingStateLabel = (outcome: ExternalBooking["outcome"], locale: Locale) =>
  registrationCopy(locale).bookingState[outcome];

/** Solo se enseña el QR de una lista confirmada (lo devuelve Fourvenues) o de una reserva ya aceptada. */
export const visibleListQr = (entry: ExternalListEntry) =>
  entry.state === "CONFIRMED" ? entry.qrCode : null;
export const visibleBookingQr = (booking: ExternalBooking) =>
  booking.outcome === "ACCEPTED" ? booking.qrCode : null;
