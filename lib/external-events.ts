import { longDateLabel } from "@/lib/discovery";
import type { Locale } from "@/lib/i18n";

/** Datos de un evento importado de Fourvenues (solo lectura en ParyUp). */
export type ExternalEventInfo = {
  timezone: string | null;
  displayDateRaw: string | null;
  currency: string | null;
  fromPrice: number | null;
  hasAvailableRates: boolean | null;
  /** Estado de venta calculado por el backend a la hora actual. */
  sales?: {
    state: "ON_SALE" | "SOON" | "SOLD_OUT" | "UNAVAILABLE" | "NONE";
    fromPrice: number | null;
    opensAt: string | null;
  } | null;
};

export type ExternalRates = {
  currency: string | null;
  live: boolean;
  ticketRates: {
    id: string;
    name: string;
    onSale: boolean;
    soldOut: boolean;
    /** Lo calcula el backend: available:false no significa agotada. */
    state: "SOON" | "ON_SALE" | "SOLD_OUT" | "UNAVAILABLE";
    validFrom: string | null;
    price: number | null;
  }[];
  listRates: {
    id: string;
    name: string;
    available: boolean;
    open: boolean;
    validFrom: string | null;
    validUntil: string | null;
    signup: { allowed: boolean; reason: "PAID_OR_UNCLEAR" | null };
    max: number | null;
    conditions: ListCondition[];
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
    opensOn: "desde el {date}",
    ticketsSoldOut: "Entradas agotadas",
    ticketsUnavailable: "Entradas no disponibles",
    from: "Desde",
    maxPeople: "máx. {n} personas",
    listInApp: "Apúntate desde la app de ParyUp.",
    reservedHeading: "Reservados",
    reservedEnabled: "Solicita tu reserva desde la app. El local la acepta o la rechaza en Fourvenues.",
    reservedDisabled: "Las solicitudes de reserva desde ParyUp todavía no están habilitadas.",
    menAndWomen: "Hombres y mujeres",
    onlyMen: "Solo hombres",
    onlyWomen: "Solo mujeres",
    noAccess: "Sin acceso indicado",
    fromAge: "Desde {n} años",
    until: "Hasta",
    statedAmount: "Importe indicado: {amount} (condiciones por confirmar)",
    noCost: "Sin coste",
    tierClosed: "Tramo cerrado",
    listPaidUnclear: "Apuntarse desde ParyUp no está disponible: la lista tiene un importe por confirmar.",
    listSoon: "Próximamente",
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
    opensOn: "from {date}",
    ticketsSoldOut: "Tickets sold out",
    ticketsUnavailable: "Tickets unavailable",
    from: "From",
    maxPeople: "max. {n} people",
    listInApp: "Sign up from the ParyUp app.",
    reservedHeading: "Bookings",
    reservedEnabled: "Request your booking from the app. The venue accepts or declines it on Fourvenues.",
    reservedDisabled: "Booking requests through ParyUp aren't enabled yet.",
    menAndWomen: "Men and women",
    onlyMen: "Men only",
    onlyWomen: "Women only",
    noAccess: "No access listed",
    fromAge: "From {n} years old",
    until: "Until",
    statedAmount: "Stated amount: {amount} (conditions to be confirmed)",
    noCost: "No cost",
    tierClosed: "Tier closed",
    listPaidUnclear: "Signing up from ParyUp isn't available: the list has an amount to be confirmed.",
    listSoon: "Coming soon",
  },
} as const;

export const externalCopy = (locale: Locale) => COPY[locale] ?? COPY.es;

/** Solo un día exacto (sin hora) es un día; con hora es un instante y se pasa a la zona del local. */
const DATE_ONLY = /^(\d{4}-\d{2}-\d{2})$/;

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
  const shown = info.displayDateRaw ? new Date(info.displayDateRaw) : null;
  const dayKey =
    info.displayDateRaw?.match(DATE_ONLY)?.[1] ??
    dayFmt.format(shown && !Number.isNaN(shown.getTime()) ? shown : new Date(startIso));
  const endDay = endIso ? dayFmt.format(new Date(endIso)) : null;
  return {
    dayKey,
    dateLabel: longDateLabel(dayKey, currentYear, locale),
    start: time(startIso),
    end: time(endIso),
    endsNextDay: endDay !== null && endDay !== dayFmt.format(new Date(startIso)),
  };
}

export type SalesTone = "good" | "soon" | "bad" | "muted";

export const SALES_TONE_CLASS: Record<SalesTone, string> = {
  good: "text-emerald-300",
  soon: "text-amber-300",
  bad: "text-red-400",
  muted: "text-white/60",
};

/** Estado de venta: verde a la venta, ámbar próximamente, rojo agotadas, gris no disponibles. */
export function externalSalesBadge(
  info: ExternalEventInfo | null,
  locale: Locale,
): { label: string; tone: SalesTone } | null {
  if (!info) return null;
  const copy = externalCopy(locale);
  const sales = info.sales;
  const price = sales?.fromPrice ?? info.fromPrice;
  const from = price !== null && price !== undefined && price > 0 ? formatMoney(price, info.currency, locale) : null;
  switch (sales?.state) {
    case "ON_SALE":
      return { label: from ? `${copy.from} ${from}` : copy.onSale, tone: "good" };
    case "SOON": {
      const when = sales.opensAt
        ? new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
            day: "numeric",
            month: "short",
            timeZone: safeZone(info.timezone),
          }).format(new Date(sales.opensAt))
        : null;
      return {
        label: [copy.soon, when ? copy.opensOn.replace("{date}", when) : null, from].filter(Boolean).join(" · "),
        tone: "soon",
      };
    }
    case "SOLD_OUT":
      return { label: copy.ticketsSoldOut, tone: "bad" };
    case "UNAVAILABLE":
      return { label: copy.ticketsUnavailable, tone: "muted" };
    default:
      return from ? { label: `${copy.from} ${from}`, tone: "muted" } : null;
  }
}

export const externalPrice = (info: ExternalEventInfo | null, locale: Locale) =>
  externalSalesBadge(info, locale)?.label ?? null;

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
  rate: Pick<ExternalRates["ticketRates"][number], "state">,
  locale: Locale,
) {
  const copy = externalCopy(locale);
  switch (rate.state) {
    case "SOON":
      return copy.soon;
    case "SOLD_OUT":
      return copy.soldOut;
    case "ON_SALE":
      return copy.onSale;
    default:
      return copy.notAvailable;
  }
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


/** Un tramo de lista del backend: men/women son admisión (no importes). */
export type ListCondition = {
  validFrom: string | null;
  validUntil: string | null;
  men: boolean | null;
  women: boolean | null;
  minAge: number | null;
  /** Importe indicado por Fourvenues: no se sabe si es pago online o en puerta. */
  amount: number | null;
  open: boolean | null;
};

export function describeListCondition(
  c: ListCondition,
  opts: { currency: string | null; timezone: string | null; locale: Locale },
) {
  const { locale } = opts;
  const copy = externalCopy(locale);
  const timeZone = safeZone(opts.timezone);
  const when = (iso: string) =>
    new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
    }).format(new Date(iso));
  const parts: string[] = [];
  if (c.men !== null || c.women !== null) {
    parts.push(c.men && c.women ? copy.menAndWomen : c.men ? copy.onlyMen : c.women ? copy.onlyWomen : copy.noAccess);
  }
  if (c.minAge) parts.push(copy.fromAge.replace("{n}", String(c.minAge)));
  if (c.validFrom && c.validUntil) parts.push(`${when(c.validFrom)} – ${when(c.validUntil)}`);
  else if (c.validUntil) parts.push(`${copy.until} ${when(c.validUntil)}`);
  if (c.amount !== null) {
    parts.push(
      c.amount > 0
        ? copy.statedAmount.replace("{amount}", formatMoney(c.amount, opts.currency, locale))
        : copy.noCost,
    );
  }
  if (c.open === false) parts.push(copy.tierClosed);
  return parts.join(" · ");
}
