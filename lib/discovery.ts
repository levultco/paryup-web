import { intlLocale, type Locale } from "@/lib/i18n";

// Reglas de descubrimiento compartidas con la app y el backend.
// Fuentes: paryup-backend/src/home/discovery-areas.ts (ciudades),
// src/common/event-time.helpers.ts (la "noche" va de las 10:00 a las 10:00)
// y paryup-app/src/lib/home/nightSession.ts (el día por defecto).

export const DISCOVERY_TZ = "Europe/Madrid";
export const NIGHT_CUTOFF_HOUR = 10;

export type DiscoveryArea = { id: string; label: string };

// Mismas ciudades que `DISCOVERY_AREAS` del backend. El orden es el de la app.
export const DISCOVERY_AREAS: DiscoveryArea[] = [
  { id: "barcelona", label: "Barcelona" },
  { id: "madrid", label: "Madrid" },
  { id: "valencia", label: "Valencia" },
  { id: "ibiza", label: "Ibiza" },
];
export const DEFAULT_AREA = "barcelona";

export type PriceFilter = "any" | "free" | "paid";

const PRICE_TO_URL: Record<PriceFilter, string | null> = {
  any: null,
  free: "gratis",
  paid: "pago",
};

export type DiscoveryParams = {
  area: string;
  date: string;
  price: PriceFilter;
  /** Búsqueda de texto (recorre todos los próximos eventos, sin día ni ciudad) */
  q?: string;
};

export const MAX_QUERY_LENGTH = 80;

const KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;

export function parseKey(key: string) {
  const match = KEY_PATTERN.exec(key);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== m - 1 ||
    probe.getUTCDate() !== d
  ) {
    return null;
  }
  return { y, m, d };
}

const pad = (value: number, size = 2) => String(value).padStart(size, "0");

export function formatKey(y: number, m: number, d: number) {
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
}

/** Suma días a un YYYY-MM-DD sin pasar por la zona horaria del navegador. */
export function addDays(key: string, days: number) {
  const parts = parseKey(key);
  if (!parts) return key;
  const date = new Date(Date.UTC(parts.y, parts.m - 1, parts.d + days, 12));
  return formatKey(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
}

export function daysBetween(from: string, to: string) {
  const a = parseKey(from);
  const b = parseKey(to);
  if (!a || !b) return 0;
  return Math.round(
    (Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000,
  );
}

/** 0 = lunes … 6 = domingo. */
export function weekdayIndex(key: string) {
  const parts = parseKey(key);
  if (!parts) return 0;
  return (
    (new Date(Date.UTC(parts.y, parts.m - 1, parts.d)).getUTCDay() + 6) % 7
  );
}

export const monthKeyOf = (key: string) => key.slice(0, 7);

export function addMonths(month: string, delta: number) {
  const match = MONTH_PATTERN.exec(month);
  if (!match) return month;
  const index = Number(match[1]) * 12 + (Number(match[2]) - 1) + delta;
  return `${pad(Math.floor(index / 12), 4)}-${pad((index % 12) + 1)}`;
}

export function daysInMonth(month: string) {
  const match = MONTH_PATTERN.exec(month);
  if (!match) return 30;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]), 0)).getUTCDate();
}

/**
 * Día "operativo" de una fecha: antes de las 10:00 todavía cuenta como la
 * noche anterior. Es lo que usa la app para decidir cuál es "hoy".
 */
export function nightKey(now: Date = new Date(), timeZone = DISCOVERY_TZ) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  const key = formatKey(value("year"), value("month"), value("day"));
  return value("hour") % 24 < NIGHT_CUTOFF_HOUR ? addDays(key, -1) : key;
}

/** Parte de una fecha YYYY-MM-DD con Intl, sin pasar por la zona horaria del navegador. */
function part(
  key: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
) {
  const parts = parseKey(key);
  if (!parts) return "";
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: "UTC",
    ...options,
  }).format(new Date(Date.UTC(parts.y, parts.m - 1, parts.d, 12)));
}

export const weekdayShort = (key: string, locale: Locale = "es") =>
  part(key, locale, { weekday: "short" }).replace(".", "");
export const weekdayLong = (key: string, locale: Locale = "es") =>
  part(key, locale, { weekday: "long" });
export const monthName = (month: string, locale: Locale = "es") =>
  month.length >= 7 ? part(`${month}-01`, locale, { month: "long" }) : "";
export const monthShort = (key: string, locale: Locale = "es") =>
  monthName(key.slice(0, 7), locale).slice(0, 3);
export const dayOfMonth = (key: string) => parseKey(key)?.d ?? 0;

/** "martes 27 de octubre" / "Tuesday 27 October" (+ año si no es el actual). */
export function longDateLabel(
  key: string,
  currentYear?: number,
  locale: Locale = "es",
) {
  const parts = parseKey(key);
  if (!parts) return key;
  const weekday = weekdayLong(key, locale);
  const month = monthName(key.slice(0, 7), locale);
  const showYear = currentYear && parts.y !== currentYear;
  if (locale === "en") {
    return `${weekday} ${parts.d} ${month}${showYear ? ` ${parts.y}` : ""}`;
  }
  return `${weekday} ${parts.d} de ${month}${showYear ? ` de ${parts.y}` : ""}`;
}

/** "vie 30 de octubre" / "Fri 30 October" */
export function shortDateLabel(key: string, locale: Locale = "es") {
  const parts = parseKey(key);
  if (!parts) return key;
  const month = monthName(key.slice(0, 7), locale);
  return locale === "en"
    ? `${weekdayShort(key, locale)} ${parts.d} ${month}`
    : `${weekdayShort(key, locale)} ${parts.d} de ${month}`;
}

/** "today" | "tomorrow" | null; el texto lo pone quien llama según el idioma. */
export function relativeDayId(key: string, today: string) {
  const diff = daysBetween(today, key);
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  return null;
}

export function isArea(value: string | undefined | null): value is string {
  return DISCOVERY_AREAS.some((area) => area.id === value);
}

export function areaLabel(id: string) {
  return DISCOVERY_AREAS.find((area) => area.id === id)?.label ?? id;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * Lee `?ciudad=&fecha=&precio=` y descarta lo inválido: una URL compartida
 * nunca debe romper la página. Las fechas pasadas se llevan a hoy.
 */
export function parseDiscoveryParams(
  raw: RawParams,
  today: string,
): DiscoveryParams {
  const area = first(raw.ciudad)?.toLowerCase();
  const date = first(raw.fecha);
  const price = first(raw.precio);
  const q = first(raw.q)?.trim().slice(0, MAX_QUERY_LENGTH);

  const validDate = date && parseKey(date) ? date : today;
  return {
    area: isArea(area) ? area : DEFAULT_AREA,
    date: daysBetween(today, validDate) < 0 ? today : validDate,
    price: price === "gratis" ? "free" : price === "pago" ? "paid" : "any",
    ...(q ? { q } : {}),
  };
}

/** Querystring canónica; omite lo que coincide con el valor por defecto. */
export function discoveryQuery(params: DiscoveryParams, today: string) {
  const qs = new URLSearchParams();
  if (params.area !== DEFAULT_AREA) qs.set("ciudad", params.area);
  if (params.date !== today) qs.set("fecha", params.date);
  const price = PRICE_TO_URL[params.price];
  if (price) qs.set("precio", price);
  if (params.q) qs.set("q", params.q);
  const text = qs.toString();
  return text ? `?${text}` : "";
}

export type RawDayCounts = Record<
  string,
  { count?: number; eventIds?: string[] } | number
>;

/** El backend devuelve `{count, eventIds}` por día (o solo el número en versiones viejas). */
export function normalizeCounts(raw: RawDayCounts) {
  const out: Record<string, { count: number; ids: string[] }> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "number") {
      out[key] = { count: value, ids: [] };
    } else {
      const ids = Array.isArray(value?.eventIds) ? value.eventIds : [];
      out[key] = { count: value?.count ?? ids.length, ids };
    }
  }
  return out;
}

/** Eventos en el orden de `ids`, descartando los que no estén en `pool`. */
export function pickInOrder<T extends { id: string }>(
  ids: string[],
  pool: T[],
) {
  const byId = new Map(pool.map((item) => [item.id, item]));
  return ids.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
}

type Searchable = {
  name: string;
  location: string | null;
  organization: { name: string } | null;
  price: number | null;
};

/** Misma regla que el backend: nombre y sala (y aquí también el organizador). */
export function matchesQuery(event: Searchable, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [event.name, event.location, event.organization?.name].some((value) =>
    value?.toLowerCase().includes(needle),
  );
}

export function matchesPrice(event: Searchable, price: PriceFilter) {
  if (price === "any") return true;
  if (event.price === null) return false;
  return price === "free" ? event.price <= 0 : event.price > 0;
}
