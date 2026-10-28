import { cacheLife } from "next/cache";
import { API_URL } from "@/lib/backend";
import {
  getUpcomingEvents,
  toPublicEvent,
  type PublicEvent,
} from "@/lib/events";
import {
  isArea,
  matchesQuery,
  monthKeyOf,
  normalizeCounts,
  parseKey,
  pickInOrder,
  type PriceFilter,
  type RawDayCounts,
} from "@/lib/discovery";

export type DayCount = { count: number; ids: string[] };
export type MonthCounts = Record<string, DayCount>;

const PUBLIC_PAGE_SIZE = 50;
const MAX_PUBLIC_PAGES = 4;

const priceParam = (price: PriceFilter) => (price === "any" ? "" : price);

/**
 * Eventos por noche de todo un mes. Es el mismo endpoint que usa el calendario
 * de la app (`/home/calendar-counts`): aplica ciudad, precio y la regla de la
 * noche (10:00 → 10:00), y de paso sirve para marcar los días con eventos.
 * Lanza si el backend falla para que el error no se quede en caché.
 */
export async function getMonthCounts(
  month: string,
  area: string,
  price: PriceFilter,
): Promise<MonthCounts> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });

  const qs = new URLSearchParams({ month, area });
  if (priceParam(price)) qs.set("price", priceParam(price));
  const res = await fetch(`${API_URL}/home/calendar-counts?${qs}`);
  if (!res.ok) throw new Error(`calendar-counts ${res.status}`);

  return normalizeCounts((await res.json()) as RawDayCounts);
}

/** Todos los eventos públicos de una noche, con el detalle completo. */
async function getPublicNight(date: string): Promise<PublicEvent[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });

  const events: PublicEvent[] = [];
  for (let page = 1; page <= MAX_PUBLIC_PAGES; page++) {
    const res = await fetch(
      `${API_URL}/events/public?date=${date}&limit=${PUBLIC_PAGE_SIZE}&page=${page}`,
    );
    if (!res.ok) throw new Error(`events/public ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("events/public inesperado");
    events.push(...data.map(toPublicEvent));
    if (data.length < PUBLIC_PAGE_SIZE) break;
  }
  return events;
}

/**
 * Eventos de una noche para una ciudad y un filtro de precio.
 *
 * `/home/for-you` no sirve aquí porque excluye los destacados (la app los
 * pinta aparte). Por eso la lista de ids sale de `calendar-counts` (filtros
 * oficiales) y el detalle de `/events/public?date=` (misma ventana de noche).
 */
export async function getNightEvents(
  area: string,
  date: string,
  price: PriceFilter,
): Promise<PublicEvent[]> {
  if (!isArea(area) || !parseKey(date)) return [];
  const counts = await getMonthCounts(monthKeyOf(date), area, price);
  const ids = counts[date]?.ids ?? [];
  if (ids.length === 0) return [];

  const night = await getPublicNight(date);
  return pickInOrder(ids, night);
}

export async function getPublicEvent(id: string): Promise<PublicEvent | null> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });

  const res = await fetch(`${API_URL}/events/public/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`events/public/:id ${res.status}`);
  return toPublicEvent(await res.json());
}

/** Búsqueda de texto entre los próximos eventos públicos. `null` si el backend falla. */
export async function searchUpcoming(q: string): Promise<PublicEvent[] | null> {
  const events = await getUpcomingEvents();
  if (!events) return null;
  return events.filter((event) => matchesQuery(event, q));
}
