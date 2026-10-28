"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  GiftIcon,
  MapPointIcon,
  RestartIcon,
  TicketIcon,
  UndoIcon,
  WidgetIcon,
} from "@/components/icons/solar";
import { DropdownDisclosure } from "@/components/watermelon/dropdown-disclosure";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { MorphingDiscoveryBar } from "@/components/watermelon/morphing-discovery-bar";
import { DateRibbon } from "@/components/discovery/DateRibbon";
import { MonthCalendar } from "@/components/discovery/MonthCalendar";
import {
  EventFeature,
  EventTile,
  EventTileSkeleton,
} from "@/components/discovery/EventTile";
import {
  useMonthCounts,
  useNightEvents,
  useSearchResults,
} from "@/components/discovery/data";
import type { PublicEvent } from "@/lib/events";
import {
  DISCOVERY_AREAS,
  addDays,
  areaLabel,
  daysBetween,
  discoveryQuery,
  longDateLabel,
  matchesPrice,
  monthKeyOf,
  nightKey,
  relativeDayId,
  shortDateLabel,
  weekdayShort,
  dayOfMonth,
  type PriceFilter,
} from "@/lib/discovery";

// Solo la pestaña seleccionada toma su color. Las etiquetas salen de `price.<id>`.
const PRICE_TABS = [
  {
    id: "any",
    icon: <WidgetIcon className="h-[18px] w-[18px]" />,
    color: "#fb7185",
  },
  {
    id: "free",
    icon: <GiftIcon className="h-[18px] w-[18px]" />,
    color: "#34d399",
  },
  {
    id: "paid",
    icon: <TicketIcon className="h-[18px] w-[18px]" />,
    color: "#fbbf24",
  },
];

export type DiscoveryInitial = {
  area: string;
  date: string;
  price: PriceFilter;
  today: string;
  events: PublicEvent[] | null;
  q?: string;
  /** Resultados de la búsqueda inicial (si la URL trae `?q=`) */
  searchEvents?: PublicEvent[] | null;
};

export function DiscoveryView({ initial }: { initial: DiscoveryInitial }) {
  const { t, locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const [area, setArea] = useState(initial.area);
  const [price, setPrice] = useState<PriceFilter>(initial.price);
  const [date, setDate] = useState(initial.date);
  const [today, setToday] = useState(initial.today);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<string | null>(null);
  const [query, setQuery] = useState(initial.q ?? "");
  const [searching, setSearching] = useState(Boolean(initial.q));
  const term = query.trim();
  const searchMode = term.length > 0;
  const plural = (n: number) =>
    t(n === 1 ? "disc.eventsOne" : "disc.eventsMany", { n });
  const priceTabs = PRICE_TABS.map((tab) => ({
    ...tab,
    label: t(`price.${tab.id}`),
  }));
  const priceSuffix =
    price === "free"
      ? t("disc.suffixFree")
      : price === "paid"
        ? t("disc.suffixPaid")
        : "";
  const year = Number(today.slice(0, 4));

  // "Hoy" cambia a las 10:00 (la noche termina entonces), con la pestaña abierta.
  useEffect(() => {
    const timer = setInterval(() => setToday(nightKey()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const selected = daysBetween(today, date) < 0 ? today : date;

  // La URL siempre refleja lo que se ve, para poder compartirla.
  useEffect(() => {
    const qs = discoveryQuery(
      { area, date: selected, price, ...(term ? { q: term } : {}) },
      today,
    );
    const next = `/events${qs}`;
    if (window.location.pathname + window.location.search !== next) {
      window.history.replaceState(window.history.state, "", next);
    }
  }, [area, selected, price, today, term]);

  const night = useNightEvents(
    area,
    price,
    selected,
    initial.events
      ? {
          area: initial.area,
          price: initial.price,
          date: initial.date,
          events: initial.events,
        }
      : undefined,
  );

  const search = useSearchResults(
    term,
    initial.q && initial.searchEvents
      ? { q: initial.q, events: initial.searchEvents }
      : undefined,
  );
  const results =
    search.status === "ready"
      ? search.events.filter((event) => matchesPrice(event, price))
      : [];

  const empty = night.status === "ready" && night.events.length === 0;
  // Con pocos eventos la página se queda vacía: se sugieren los próximos días con planes.
  const sparse = night.status === "ready" && night.events.length <= 3;
  const months = useMemo(() => {
    const set = new Set([
      monthKeyOf(addDays(selected, -8)),
      monthKeyOf(addDays(selected, 8)),
    ]);
    if (calendarMonth) set.add(calendarMonth);
    if (empty || sparse) {
      set.add(monthKeyOf(addDays(selected, 31)));
      set.add(monthKeyOf(addDays(selected, 62)));
    }
    return [...set];
  }, [selected, calendarMonth, empty, sparse]);
  const getCount = useMonthCounts(area, price, months);

  let nextBusy: { key: string; count: number } | null = null;
  if (empty) {
    for (let offset = 1; offset <= 62 && !nextBusy; offset++) {
      const key = addDays(selected, offset);
      const count = getCount(key);
      if (count) nextBusy = { key, count };
    }
  }

  const upcoming: { key: string; count: number }[] = [];
  if (sparse) {
    for (let offset = 1; offset <= 45 && upcoming.length < 6; offset++) {
      const key = addDays(selected, offset);
      const count = getCount(key);
      if (count) upcoming.push({ key, count });
    }
  }

  const select = useCallback((key: string) => setDate(key), []);
  // Relativo a la última selección y con tope en "hoy": aguanta ráfagas de teclas.
  const shift = useCallback(
    (days: number) =>
      setDate((prev) => {
        const base = daysBetween(today, prev) < 0 ? today : prev;
        const target = addDays(base, days);
        return daysBetween(today, target) < 0 ? today : target;
      }),
    [today],
  );
  const relativeId = relativeDayId(selected, today);
  const relative = relativeId
    ? t(relativeId === "today" ? "disc.today" : "disc.tomorrow")
    : null;

  const upcomingSection = (
    <div>
      <h2 className="font-display text-xl font-semibold">
        {t("disc.upcomingDays")}
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {upcoming.map(({ key, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setDate(key);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-secondary px-5 text-sm transition hover:bg-white/10"
          >
            <span className="font-semibold capitalize">
              {weekdayShort(key, locale)} {dayOfMonth(key)}
            </span>
            <span className="text-white/60">{plural(count)}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section>
      <h1 className="sr-only">{t("disc.title")}</h1>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <MorphingDiscoveryBar
          categories={priceTabs}
          value={price}
          onChange={(id) => setPrice(id as PriceFilter)}
          query={query}
          onQueryChange={setQuery}
          searching={searching}
          onSearchingChange={setSearching}
        />
        {searchMode ? null : (
          <div className="flex flex-wrap items-center gap-3">
            <DropdownDisclosure
              title={t("disc.cityTitle")}
              label={t("disc.city")}
              triggerIcon={<MapPointIcon className="h-4 w-4" />}
              value={area}
              onChange={setArea}
              items={DISCOVERY_AREAS.map((item) => ({
                ...item,
                description: t(`area.${item.id}.desc`),
              }))}
            />
            <MonthCalendar
              selected={selected}
              today={today}
              onSelect={select}
              onMonthChange={setCalendarMonth}
              getCount={getCount}
              open={calendarOpen}
              onOpenChange={setCalendarOpen}
            />
          </div>
        )}
      </div>

      {searchMode ? (
        <div
          className="mt-6 border-t border-white/10 pt-5"
          aria-busy={search.status === "loading"}
        >
          <p aria-live="polite" className="text-sm text-white/70">
            {search.status === "ready"
              ? t("disc.searchResults", {
                  count: plural(results.length),
                  q: term,
                })
              : t("disc.searching", { q: term })}
          </p>

          {search.status === "loading" ? (
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 5 }, (_, i) => (
                <EventTileSkeleton key={i} />
              ))}
            </div>
          ) : null}

          {search.status === "error" ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <p className="font-display text-2xl font-semibold">
                {t("disc.searchErrorTitle")}
              </p>
              <button
                type="button"
                onClick={search.retry}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                <RestartIcon className="h-5 w-5" /> {t("common.retry")}
              </button>
            </div>
          ) : null}

          {search.status === "ready" && results.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {results.map((event, index) => (
                <EventTile key={event.id} event={event} priority={index < 4} />
              ))}
            </div>
          ) : null}

          {search.status === "ready" && results.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="font-display text-3xl font-semibold">
                {t("disc.noResults")}
              </p>
              <p className="max-w-md text-muted">
                {t("disc.noResultsBody", { q: term, price: priceSuffix })}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearching(false);
                }}
                className="inline-flex h-11 items-center rounded-full border border-white/15 px-6 text-sm font-medium transition hover:bg-white/10"
              >
                {t("disc.clearSearch")}
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex min-h-9 flex-wrap items-center gap-x-4 gap-y-2">
              <p aria-live="polite" className="text-sm text-white/70">
                {relative ? (
                  <span className="font-semibold text-white">
                    {relative} ·{" "}
                  </span>
                ) : null}
                <span className="inline-block first-letter:uppercase">
                  {longDateLabel(selected, year, locale)}
                </span>
              </p>
              <AnimatePresence initial={false}>
                {selected !== today ? (
                  <motion.button
                    key="back-to-today"
                    type="button"
                    onClick={() => setDate(today)}
                    initial={{ opacity: 0, x: reduceMotion ? 0 : -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduceMotion ? 0 : -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-black transition-colors hover:bg-white/90"
                  >
                    <UndoIcon className="h-5 w-5" />
                    {t("disc.backToToday")}
                  </motion.button>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="mt-1">
              <DateRibbon
                selected={selected}
                today={today}
                onSelect={select}
                onShift={shift}
                getCount={getCount}
              />
            </div>
          </div>

          <div className="mt-4" aria-busy={night.status === "loading"}>
            {night.status === "loading" ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {Array.from({ length: 5 }, (_, i) => (
                  <EventTileSkeleton key={i} />
                ))}
              </div>
            ) : null}

            {night.status === "error" ? (
              <div className="flex flex-col items-center gap-4 py-24 text-center">
                <p className="font-display text-2xl font-semibold">
                  {t("disc.loadErrorTitle")}
                </p>
                <p className="max-w-sm text-muted">{t("disc.loadErrorText")}</p>
                <button
                  type="button"
                  onClick={night.retry}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  <RestartIcon className="h-5 w-5" /> {t("common.retry")}
                </button>
              </div>
            ) : null}

            {night.status === "ready" && night.events.length > 0 ? (
              <motion.div
                key={`${area}|${price}|${selected}`}
                initial={{ opacity: reduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {night.events.length === 1 ? (
                  <EventFeature
                    event={night.events[0]}
                    aside={
                      upcoming.length > 0 ? (
                        <div className="mt-12 border-t border-white/10 pt-6">
                          {upcomingSection}
                        </div>
                      ) : null
                    }
                  />
                ) : (
                  <>
                    <p className="mb-5 text-sm text-muted">
                      {plural(night.events.length)}
                    </p>
                    <div
                      className={`grid gap-x-4 gap-y-9 ${
                        night.events.length === 1
                          ? "max-w-md grid-cols-1"
                          : night.events.length === 2
                            ? "max-w-3xl grid-cols-2"
                            : night.events.length === 3
                              ? "max-w-5xl grid-cols-2 md:grid-cols-3"
                              : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                      }`}
                    >
                      {night.events.map((event, index) => (
                        <EventTile
                          key={event.id}
                          event={event}
                          priority={index < 4}
                        />
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            ) : null}

            {sparse && upcoming.length > 0 && night.events.length > 1 ? (
              <div className="mt-14 border-t border-white/10 pt-8">
                {upcomingSection}
              </div>
            ) : null}

            {empty ? (
              <div className="flex flex-col items-center gap-5 py-20 text-center">
                <p className="font-display text-3xl font-semibold">
                  {t(
                    relativeId === "today"
                      ? "disc.emptyTitleToday"
                      : relativeId === "tomorrow"
                        ? "disc.emptyTitleTomorrow"
                        : "disc.emptyTitleDay",
                  )}
                </p>
                <p className="max-w-md text-muted">
                  {t("disc.emptyBody", {
                    city: areaLabel(area),
                    price: priceSuffix,
                    date: longDateLabel(selected, year, locale),
                  })}
                </p>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
                  {nextBusy ? (
                    <button
                      type="button"
                      onClick={() => setDate(nextBusy.key)}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
                    >
                      {t("disc.goToBusy", {
                        date: shortDateLabel(nextBusy.key, locale),
                        count: plural(nextBusy.count),
                      })}
                    </button>
                  ) : null}
                  {price !== "any" ? (
                    <button
                      type="button"
                      onClick={() => setPrice("any")}
                      className="inline-flex h-11 items-center rounded-full border border-white/15 px-6 text-sm font-medium transition hover:bg-white/10"
                    >
                      {t("disc.removePrice")}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setCalendarOpen(true)}
                    className="inline-flex h-11 items-center rounded-full border border-white/15 px-6 text-sm font-medium transition hover:bg-white/10"
                  >
                    {t("disc.openCalendar")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
