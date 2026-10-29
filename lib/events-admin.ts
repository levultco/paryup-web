// Tipos y errores de la gestión de eventos de organización (`/api/organizations/[slug]/events`).

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type ManagedEvent = {
  id: string;
  name: string;
  date: string;
  endDate: string | null;
  location: string;
  coverImage: string | null;
  status: EventStatus;
  isPublic: boolean;
  capacity: number | null;
  minAge: number | null;
  ticketsCount: number;
};

export type ManagedEventsPage = {
  items: ManagedEvent[];
  total: number;
  page: number;
  limit: number;
};

/** Edades que el backend admite (`ALLOWED_MIN_AGES`). */
export const MIN_AGES = [16, 18, 25] as const;

/** Códigos de negocio que devuelve el backend -> clave de traducción. */
const ERROR_KEYS: Record<string, string> = {
  PAYMENTS_NOT_READY: "orgs.ev.err.payments",
  EVENT_HAS_COMMITMENTS: "orgs.ev.err.commitments",
  EVENT_HAS_DEPENDENCIES: "orgs.ev.err.dependencies",
  EVENT_PAST: "orgs.ev.err.past",
  EVENT_STATUS_TRANSITION: "orgs.ev.err.transition",
  TICKET_HAS_DEPENDENCIES: "orgs.ev.err.ticketDependencies",
  TICKET_CAPACITY_BELOW_COMMITTED: "orgs.ev.err.capacity",
  MIN_AGE_NOT_MET: "orgs.ev.err.minAge",
  BIRTHDATE_REQUIRED: "orgs.ev.err.birthdate",
};

export function eventErrorKey(status: number, data: unknown): string {
  const code = (data as { code?: unknown } | null)?.code;
  if (typeof code === "string" && ERROR_KEYS[code]) return ERROR_KEYS[code];
  if (status === 403) return "orgs.ev.err.forbidden";
  if (status === 404) return "orgs.ev.err.notFound";
  if (status === 400) return "orgs.ev.err.invalid";
  return "orgs.ev.err.generic";
}
