"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import type { PublicEvent } from "@/lib/events";
import type { PriceFilter } from "@/lib/discovery";
import { addDays } from "@/lib/discovery";

const FRESH_MS = 60_000;
const MAX_ENTRIES = 80;
// Al arrastrar la tira se pasa por muchos días; solo se pide el que se queda.
const SETTLE_MS = 140;

type Entry<T> = { value: T; ts: number };

function remember<T>(store: Map<string, Entry<T>>, key: string, value: T) {
  store.delete(key);
  store.set(key, { value, ts: Date.now() });
  if (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
}

function fresh<T>(store: Map<string, Entry<T>>, key: string) {
  const entry = store.get(key);
  return entry && Date.now() - entry.ts < FRESH_MS ? entry.value : undefined;
}

const eventsStore = new Map<string, Entry<PublicEvent[]>>();
const eventsInflight = new Map<string, Promise<PublicEvent[]>>();
const searchStore = new Map<string, Entry<PublicEvent[]>>();
const searchInflight = new Map<string, Promise<PublicEvent[]>>();
const countsStore = new Map<string, Entry<Record<string, number>>>();
const countsInflight = new Map<string, Promise<Record<string, number>>>();

const eventsKey = (area: string, price: PriceFilter, date: string) =>
  `${area}|${price}|${date}`;
const countsKey = (area: string, price: PriceFilter, month: string) =>
  `${area}|${price}|${month}`;

/** Una sola petición por clave aunque la pidan varios (selección + precarga). */
function loadEvents(area: string, price: PriceFilter, date: string) {
  const key = eventsKey(area, price, date);
  const cached = fresh(eventsStore, key);
  if (cached) return Promise.resolve(cached);
  const pending = eventsInflight.get(key);
  if (pending) return pending;

  const request = fetch(
    `/api/discovery/events?area=${area}&price=${price}&date=${date}`,
  )
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.json() as Promise<{ events: PublicEvent[] }>;
    })
    .then(({ events }) => {
      remember(eventsStore, key, events);
      return events;
    })
    .finally(() => eventsInflight.delete(key));
  eventsInflight.set(key, request);
  return request;
}

function loadCounts(area: string, price: PriceFilter, month: string) {
  const key = countsKey(area, price, month);
  const cached = fresh(countsStore, key);
  if (cached) return Promise.resolve(cached);
  const pending = countsInflight.get(key);
  if (pending) return pending;

  const request = fetch(
    `/api/discovery/counts?area=${area}&price=${price}&month=${month}`,
  )
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.json() as Promise<{ counts: Record<string, number> }>;
    })
    .then(({ counts }) => {
      remember(countsStore, key, counts);
      return counts;
    })
    .finally(() => countsInflight.delete(key));
  countsInflight.set(key, request);
  return request;
}

export type NightState =
  | { status: "ready"; events: PublicEvent[] }
  | { status: "loading" }
  | { status: "error" };

/**
 * Eventos de la noche seleccionada. Una respuesta que llega tarde nunca pisa
 * la selección actual: el estado se deriva siempre de la clave vigente y la
 * caché, no de "la última respuesta recibida".
 */
export function useNightEvents(
  area: string,
  price: PriceFilter,
  date: string,
  initial?: {
    area: string;
    price: PriceFilter;
    date: string;
    events: PublicEvent[];
  },
): NightState & { retry: () => void } {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const key = eventsKey(area, price, date);

  // El HTML del servidor ya trae la noche inicial: se guarda en la caché.
  useState(() => {
    if (initial) {
      remember(
        eventsStore,
        eventsKey(initial.area, initial.price, initial.date),
        initial.events,
      );
    }
    return true;
  });

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const prefetch = () => {
      for (const offset of [1, 2, -1]) {
        timers.push(
          setTimeout(
            () => {
              if (active)
                loadEvents(area, price, addDays(date, offset)).catch(
                  () => null,
                );
            },
            350 + Math.abs(offset) * 120,
          ),
        );
      }
    };

    if (fresh(eventsStore, key)) {
      prefetch();
    } else {
      timers.push(
        setTimeout(() => {
          loadEvents(area, price, date)
            .then(() => {
              if (!active) return;
              setFailedKey(null);
              rerender();
              prefetch();
            })
            .catch(() => {
              if (active) setFailedKey(key);
            });
        }, SETTLE_MS),
      );
    }

    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, [area, price, date, key, attempt]);

  const retry = useCallback(() => {
    eventsStore.delete(key);
    setFailedKey(null);
    setAttempt((n) => n + 1);
  }, [key]);

  const cached = fresh(eventsStore, key);
  if (cached) return { status: "ready", events: cached, retry };
  if (failedKey === key) return { status: "error", retry };
  return { status: "loading", retry };
}

/** Número de eventos por día en los meses indicados (para los puntos). */
export function useMonthCounts(
  area: string,
  price: PriceFilter,
  months: string[],
) {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const signature = months.join(",");

  useEffect(() => {
    let active = true;
    for (const month of signature.split(",").filter(Boolean)) {
      if (fresh(countsStore, countsKey(area, price, month))) continue;
      loadCounts(area, price, month)
        .then(() => active && rerender())
        .catch(() => null); // sin puntos no pasa nada: la lista sigue funcionando
    }
    return () => {
      active = false;
    };
  }, [area, price, signature]);

  return (dateKey: string): number | undefined =>
    fresh(countsStore, countsKey(area, price, dateKey.slice(0, 7)))?.[dateKey];
}

function loadSearch(term: string) {
  const cached = fresh(searchStore, term);
  if (cached) return Promise.resolve(cached);
  const pending = searchInflight.get(term);
  if (pending) return pending;

  const request = fetch(`/api/discovery/search?q=${encodeURIComponent(term)}`)
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.json() as Promise<{ events: PublicEvent[] }>;
    })
    .then(({ events }) => {
      remember(searchStore, term, events);
      return events;
    })
    .finally(() => searchInflight.delete(term));
  searchInflight.set(term, request);
  return request;
}

export type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; events: PublicEvent[] };

/** Resultados de texto. Se espera a que se deje de escribir y se ignoran respuestas viejas. */
export function useSearchResults(
  query: string,
  initial?: { q: string; events: PublicEvent[] },
): SearchState & { retry: () => void } {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const [failed, setFailed] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const term = query.trim().toLowerCase();

  useState(() => {
    if (initial) remember(searchStore, initial.q.trim().toLowerCase(), initial.events);
    return true;
  });

  useEffect(() => {
    if (!term || fresh(searchStore, term)) return;
    let active = true;
    const timer = setTimeout(() => {
      loadSearch(term)
        .then(() => {
          if (!active) return;
          setFailed(null);
          rerender();
        })
        .catch(() => {
          if (active) setFailed(term);
        });
    }, 260);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [term, attempt]);

  const retry = useCallback(() => {
    searchStore.delete(term);
    setFailed(null);
    setAttempt((n) => n + 1);
  }, [term]);

  if (!term) return { status: "idle", retry };
  const cached = fresh(searchStore, term);
  if (cached) return { status: "ready", events: cached, retry };
  if (failed === term) return { status: "error", retry };
  return { status: "loading", retry };
}
