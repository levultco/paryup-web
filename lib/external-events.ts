import { longDateLabel } from "@/lib/discovery";
import type { Locale } from "@/lib/i18n";

/** Datos de un evento importado de Fourvenues (solo lectura en ParyUp). */
export type ExternalEventInfo = {
  timezone: string | null;
  displayDateRaw: string | null;
  currency: string | null;
  fromPrice: number | null;
  hasAvailableRates: boolean | null;
};

export type ExternalRates = {
  currency: string | null;
  live: boolean;
  ticketRates: {
    id: string;
    name: string;
    onSale: boolean;
    soldOut: boolean;
    validFrom: string | null;
    price: number | null;
  }[];
  listRates: {
    id: string;
    name: string;
    available: boolean;
    max: number | null;
    conditions: Record<string, string | number | boolean>[];
  }[];
  /** Falso hasta validar las escrituras en Alpha: la web no ofrece acciones activas. */
  writes: { lists: boolean; bookings: boolean };
};

// Textos propios del bloque Fourvenues (es/en); el resto de la web usa el diccionario general.
const COPY = {
  es: {
    heading: "Entradas y listas",
    notEnabled:
      "La compra de entradas de este evento todavía no está habilitada en ParyUp.",
    unavailable: "No se pudieron cargar las tarifas ahora mismo.",
    none: "Este evento no tiene tarifas publicadas.",
    onSale: "A la venta",
    soldOut: "Agotada",
    soon: "Próximamente",
    notAvailable: "No disponible",
    listOpen: "Lista abierta",
    listClosed: "Lista cerrada",
    stale: "Precios de la última sincronización; pueden haber cambiado.",
    noRates: "Sin entradas a la venta",
    from: "Desde",
    maxPeople: "máx. {n} personas",
    listInApp: "Apúntate desde la app de ParyUp.",
    reservedHeading: "Reservados",
    reservedEnabled: "Solicita tu reserva desde la app. El local la acepta o la rechaza en Fourvenues.",
    reservedDisabled: "Las solicitudes de reserva desde ParyUp todavía no están habilitadas.",
    free: "gratis",
    minAge: "Edad mínima",
    men: "Hombres",
    women: "Mujeres",
    sinceTime: "Desde",
  },
  en: {
    heading: "Tickets and guest lists",
    notEnabled:
      "Ticket purchase for this event is not available on ParyUp yet.",
    unavailable: "Rates could not be loaded right now.",
    none: "This event has no published rates.",
    onSale: "On sale",
    soldOut: "Sold out",
    soon: "Coming soon",
    notAvailable: "Not available",
    listOpen: "List open",
    listClosed: "List closed",
    stale: "Prices from the last sync; they may have changed.",
    noRates: "No tickets on sale",
    from: "From",
    maxPeople: "max. {n} people",
    listInApp: "Sign up from the ParyUp app.",
    reservedHeading: "Bookings",
    reservedEnabled: "Request your booking from the app. The venue accepts or declines it on Fourvenues.",
    reservedDisabled: "Booking requests through ParyUp aren't enabled yet.",
    free: "free",
    minAge: "Minimum age",
    men: "Men",
    women: "Women",
    sinceTime: "From",
  },
} as const;

export const externalCopy = (locale: Locale) => COPY[locale] ?? COPY.es;

const DATE_ONLY = /^(\d{4}-\d{2}-\d{2})/;

function safeZone(timeZone: string | null) {
  if (!timeZone) return undefined;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone });
    return timeZone;
  } catch {
    return undefined;
  }
}

/**
 * Cuándo es un evento Fourvenues: el día es `display_date` (en eventos nocturnos no coincide con
 * el inicio real) y las horas se muestran en la zona horaria del local, igual en servidor y cliente.
 */
export function externalWhen(
  startIso: string,
  endIso: string | null,
  info: Pick<ExternalEventInfo, "timezone" | "displayDateRaw">,
  locale: Locale,
  currentYear?: number,
) {
  const timeZone = safeZone(info.timezone);
  const dayFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeFmt = new Intl.DateTimeFormat("es-ES", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const time = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : timeFmt.format(d);
  };
  const dayKey = info.displayDateRaw?.match(DATE_ONLY)?.[1] ?? dayFmt.format(new Date(startIso));
  const endDay = endIso ? dayFmt.format(new Date(endIso)) : null;
  return {
    dayKey,
    dateLabel: longDateLabel(dayKey, currentYear, locale),
    start: time(startIso),
    end: time(endIso),
    endsNextDay: endDay !== null && endDay !== dayFmt.format(new Date(startIso)),
  };
}

export function externalPrice(
  info: ExternalEventInfo | null,
  locale: Locale,
): string | null {
  if (!info) return null;
  const copy = externalCopy(locale);
  if (info.fromPrice !== null && info.fromPrice > 0) {
    return `${copy.from} ${formatMoney(info.fromPrice, info.currency, locale)}`;
  }
  return info.hasAvailableRates === false ? copy.noRates : null;
}

export function formatMoney(amount: number, currency: string | null, locale: Locale) {
  try {
    return new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-GB", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return String(amount);
  }
}

export function rateStatus(
  rate: ExternalRates["ticketRates"][number],
  locale: Locale,
  now = Date.now(),
) {
  const copy = externalCopy(locale);
  if (rate.soldOut) return copy.soldOut;
  if (rate.onSale) return copy.onSale;
  return rate.validFrom && new Date(rate.validFrom).getTime() > now
    ? copy.soon
    : copy.notAvailable;
}

export type ExternalSyncState = "ACTIVE" | "MISSING" | "UNAVAILABLE" | "SUSPENDED";

const SYNC_LABEL: Record<Locale, Record<ExternalSyncState, string>> = {
  es: {
    ACTIVE: "Sincronizado",
    MISSING: "Pendiente de confirmar",
    UNAVAILABLE: "No disponible",
    SUSPENDED: "Suspendido",
  },
  en: {
    ACTIVE: "Synced",
    MISSING: "Pending confirmation",
    UNAVAILABLE: "Unavailable",
    SUSPENDED: "Suspended",
  },
};

export const syncStateLabel = (state: ExternalSyncState, locale: Locale) =>
  (SYNC_LABEL[locale] ?? SYNC_LABEL.es)[state];

/** Una línea legible por tramo de lista; las claves que no conocemos se muestran tal cual. */
export function describeListCondition(
  condition: Record<string, string | number | boolean>,
  currency: string | null,
  locale: Locale,
) {
  const copy = externalCopy(locale);
  const labels: Record<string, string> = {
    men: copy.men,
    women: copy.women,
    age: copy.minAge,
    from: copy.sinceTime,
  };
  return Object.entries(condition)
    .filter(([, v]) => v !== "" && v !== false)
    .map(([key, value]) => {
      const label = labels[key] ?? key;
      if (typeof value === "number" && (key === "men" || key === "women" || key === "price")) {
        return `${label}: ${value > 0 ? formatMoney(value, currency, locale) : copy.free}`;
      }
      return `${label}: ${value === true ? "✓" : value}`;
    })
    .join(" · ");
}
