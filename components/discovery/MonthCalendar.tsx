"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/i18n/LocaleProvider";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "@/components/icons/solar";
import {
  addMonths,
  daysBetween,
  daysInMonth,
  formatKey,
  monthKeyOf,
  monthName,
  weekdayIndex,
} from "@/lib/discovery";

type Props = {
  selected: string;
  today: string;
  onSelect: (key: string) => void;
  /** Meses que el calendario necesita para los puntos */
  onMonthChange: (month: string) => void;
  getCount: (key: string) => number | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MonthCalendar({
  selected,
  today,
  onSelect,
  onMonthChange,
  getCount,
  open,
  onOpenChange,
}: Props) {
  const { t, locale } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("disc.calendarOpen")}
        className="inline-flex h-12 cursor-pointer items-center gap-2.5 rounded-full bg-secondary pl-4 pr-3.5 text-white transition hover:bg-white/10"
      >
        <CalendarIcon className="h-5 w-5 text-white/80" />
        <span className="inline-block text-sm font-semibold first-letter:uppercase">
          {monthName(monthKeyOf(selected), locale)} {selected.slice(0, 4)}
        </span>
        <ArrowDownIcon
          className={`h-4 w-4 text-white/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <CalendarPanel
            selected={selected}
            today={today}
            getCount={getCount}
            onSelect={(key) => {
              onSelect(key);
              onOpenChange(false);
            }}
            onMonthChange={onMonthChange}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function CalendarPanel({
  selected,
  today,
  getCount,
  onSelect,
  onMonthChange,
}: {
  selected: string;
  today: string;
  getCount: (key: string) => number | undefined;
  onSelect: (key: string) => void;
  onMonthChange: (month: string) => void;
}) {
  const { t, locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const [month, setMonth] = useState(monthKeyOf(selected));

  useEffect(() => {
    onMonthChange(month);
  }, [month, onMonthChange]);

  const total = daysInMonth(month);
  const lead = weekdayIndex(`${month}-01`);
  const year = month.slice(0, 4);
  const canGoBack = month > monthKeyOf(today);

  return (
    <motion.div
      role="dialog"
      aria-label={t("disc.calendarLabel")}
      initial={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
      className="absolute right-0 top-full z-40 mt-3 w-[min(21rem,calc(100vw-2.5rem))] rounded-3xl border border-white/5 bg-secondary p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, -1))}
          disabled={!canGoBack}
          aria-label={t("disc.prevMonth")}
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <p
          aria-live="polite"
          className="font-display text-base font-semibold first-letter:uppercase"
        >
          {monthName(month, locale)}{" "}
          <span className="text-white/50">{year}</span>
        </p>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          aria-label={t("disc.nextMonth")}
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {t("disc.weekdayHeads")
          .split(",")
          .map((head, index) => (
            <span
              key={`${head}-${index}`}
              className="pb-1 text-[11px] font-semibold text-white/40"
            >
              {head}
            </span>
          ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`gap-${i}`} />
        ))}
        {Array.from({ length: total }, (_, i) => {
          const key = formatKey(
            Number(month.slice(0, 4)),
            Number(month.slice(5, 7)),
            i + 1,
          );
          const past = daysBetween(today, key) < 0;
          const active = key === selected;
          const count = getCount(key);
          return (
            <button
              key={key}
              type="button"
              disabled={past}
              aria-pressed={active}
              aria-current={key === today ? "date" : undefined}
              aria-label={`${locale === "en" ? `${monthName(month, locale)} ${i + 1}` : `${i + 1} de ${monthName(month, locale)}`}${
                count
                  ? `, ${t(count === 1 ? "disc.eventsOne" : "disc.eventsMany", { n: count })}`
                  : ""
              }`}
              onClick={() => onSelect(key)}
              className={`relative mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm tabular-nums transition-colors ${
                active
                  ? "bg-white font-semibold text-black"
                  : past
                    ? "text-white/20"
                    : "text-white hover:bg-white/10"
              } ${key === today && !active ? "font-semibold underline decoration-white/40 underline-offset-4" : ""}`}
            >
              {i + 1}
              <span
                aria-hidden
                className={`absolute bottom-1 h-1 w-1 rounded-full ${
                  count
                    ? active
                      ? "bg-black"
                      : "bg-white/70"
                    : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
