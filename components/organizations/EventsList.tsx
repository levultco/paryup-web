"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarIcon,
  ChevronRightIcon,
  MapPointIcon,
  TicketIcon,
} from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import {
  PageHeader,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { DISCOVERY_TZ } from "@/lib/discovery";
import { syncStateLabel } from "@/lib/external-events";
import { intlLocale } from "@/lib/i18n";
import { ORG_PERMISSIONS } from "@/lib/organizations";
import type { EventStatus, ManagedEventsPage } from "@/lib/events-admin";
import { Select } from "@/components/organizations/select";
import { EventCardsSkeleton } from "@/components/organizations/skeletons";

const LIMIT = 20;
type Timeframe = "upcoming" | "past" | "all";

const STATUS_TONE: Record<EventStatus, string> = {
  PUBLISHED: "bg-[#30d158]/15 text-[#30d158]",
  DRAFT: "bg-[#ffd60a]/15 text-[#ffd60a]",
  CANCELLED: "bg-[#ff453a]/15 text-[#ff453a]",
  COMPLETED: "bg-white/10 text-white/55",
};

export function StatusBadge({ status }: { status: EventStatus }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-2.5 pr-3 text-xs font-semibold ${STATUS_TONE[status]}`}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"
      />
      {t(`orgs.ev.status.${status}`)}
    </span>
  );
}

export function EventsList() {
  const { t, locale } = useI18n();
  const { slug, org, can } = useOrg();
  const canCreate = can(ORG_PERMISSIONS.eventsCreate);
  const base = `/${slug}/events`;

  const [timeframe, setTimeframe] = useState<Timeframe>("upcoming");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ManagedEventsPage | null>(null);
  const [failed, setFailed] = useState(false);

  // La búsqueda espera a que se deje de escribir y vuelve a la primera página.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
      timeframe,
    });
    if (status) params.set("status", status);
    if (query) params.set("search", query);
    fetch(
      `/api/organizations/${encodeURIComponent(slug)}/events/manage?${params}`,
      {
        signal: controller.signal,
      },
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("list");
        setFailed(false);
        setData(await res.json());
      })
      .catch((error) => {
        if (error?.name !== "AbortError") setFailed(true);
      });
    return () => controller.abort();
  }, [slug, page, timeframe, status, query]);

  const dateFormat = new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: DISCOVERY_TZ,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  const dayFormat = new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: DISCOVERY_TZ,
    day: "numeric",
  });
  const monthFormat = new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: DISCOVERY_TZ,
    month: "short",
  });
  const filtered = !!(status || query || timeframe !== "all");
  const from = data && data.total > 0 ? (data.page - 1) * data.limit + 1 : 0;
  const to = data ? Math.min(data.total, data.page * data.limit) : 0;
  const pages = data ? Math.ceil(data.total / data.limit) : 1;

  const changeTimeframe = (value: Timeframe) => {
    setTimeframe(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("orgs.ev.title")}
        subtitle={t("orgs.ev.subtitle", { name: org.name })}
        aside={
          canCreate ? (
            <Link href={`${base}/new`} className={primaryButton}>
              {t("orgs.ev.create")}
            </Link>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          className="flex rounded-full border border-white/15 p-1"
        >
          {(["upcoming", "past", "all"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={timeframe === value}
              onClick={() => changeTimeframe(value)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                timeframe === value
                  ? "bg-white text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {t(`orgs.ev.tf.${value}`)}
            </button>
          ))}
        </div>
        <Select
          size="sm"
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          label={t("orgs.ev.col.status")}
          options={[
            { value: "", label: t("orgs.ev.status.all") },
            ...(["DRAFT", "PUBLISHED", "CANCELLED"] as const).map((s) => ({
              value: s as string,
              label: t(`orgs.ev.status.${s}`),
            })),
          ]}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("orgs.ev.search")}
          aria-label={t("orgs.ev.search")}
          className="h-10 min-w-0 flex-1 rounded-full border border-white/15 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/60 sm:max-w-xs"
        />
      </div>

      {failed ? (
        <p className="rounded-3xl border border-white/10 bg-raised p-6 text-center text-white/55">
          {t("orgs.ev.loadError")}
        </p>
      ) : !data ? (
        <EventCardsSkeleton rows={3} />
      ) : data.items.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
          <CalendarIcon className="h-8 w-8 text-white/40" />
          <p className="font-display mt-4 text-2xl font-semibold text-white">
            {filtered && data.total === 0 && (query || status)
              ? t("orgs.ev.noResults")
              : t("orgs.ev.empty")}
          </p>
          {!(query || status) ? (
            <p className="mt-2 max-w-sm text-white/55">
              {t("orgs.ev.emptyText")}
            </p>
          ) : null}
          {canCreate && !(query || status) ? (
            <Link href={`${base}/new`} className={`${primaryButton} mt-6`}>
              {t("orgs.ev.create")}
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {data.items.map((event) => {
              const when = new Date(event.date);
              const faded =
                event.status === "CANCELLED" || event.status === "COMPLETED";
              return (
                <li key={event.id}>
                  <Link
                    href={`${base}/${event.id}`}
                    className="group flex items-center gap-4 rounded-[22px] bg-raised p-3 pr-5 ring-1 ring-white/[0.08] transition-[background-color,transform] duration-150 hover:bg-[color-mix(in_srgb,var(--bg-raised),white_7%)] active:scale-[0.99] sm:gap-5"
                  >
                    <span
                      className={`relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl bg-white/10 sm:h-24 sm:w-24 ${faded ? "opacity-60 saturate-50" : ""}`}
                    >
                      {event.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.coverImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                      <span className="absolute left-1.5 top-1.5 flex min-w-9 flex-col items-center rounded-lg bg-black/55 px-1.5 py-1 leading-none backdrop-blur-md">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-white/70">
                          {monthFormat.format(when).replace(".", "")}
                        </span>
                        <span className="mt-0.5 text-[15px] font-semibold tabular-nums text-white">
                          {dayFormat.format(when)}
                        </span>
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="truncate text-[17px] font-semibold tracking-[-0.015em] text-white">
                        {event.name}
                      </span>
                      <span className="truncate text-sm text-white/60">
                        {dateFormat.format(when)}
                      </span>
                      <span className="flex items-center gap-1 truncate text-[13px] text-white/40">
                        <MapPointIcon
                          aria-hidden
                          className="h-3.5 w-3.5 shrink-0"
                        />
                        <span className="truncate">{event.location}</span>
                      </span>
                      {event.minAge || !event.isPublic ? (
                        <span className="mt-1 flex gap-1.5">
                          {event.minAge ? (
                            <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] text-white/60">
                              {t("orgs.ev.minAgeChip", { age: event.minAge })}
                            </span>
                          ) : null}
                          {!event.isPublic ? (
                            <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] text-white/60">
                              {t("orgs.ev.private")}
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-2">
                      <StatusBadge status={event.status} />
                      {event.source === "FOURVENUES" && event.externalRef ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            event.externalRef.syncState === "ACTIVE"
                              ? "bg-white/[0.08] text-white/60"
                              : event.externalRef.syncState === "MISSING"
                                ? "bg-amber-400/15 text-amber-200"
                                : "bg-red-500/15 text-red-300"
                          }`}
                        >
                          {syncStateLabel(event.externalRef.syncState, locale)}
                        </span>
                      ) : null}
                      <span
                        title={
                          event.ticketsCount === 1
                            ? t("orgs.ev.ticketsOne")
                            : t("orgs.ev.ticketsCount", {
                                count: event.ticketsCount,
                              })
                        }
                        className="inline-flex items-center gap-1.5 text-[13px] tabular-nums text-white/50"
                      >
                        <TicketIcon aria-hidden className="h-3.5 w-3.5" />
                        {event.ticketsCount}
                      </span>
                    </span>
                    <ChevronRightIcon
                      aria-hidden
                      className="hidden h-4 w-4 shrink-0 text-white/25 transition-transform duration-200 group-hover:translate-x-0.5 sm:block"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/45">
            <span>{t("orgs.ev.range", { from, to, total: data.total })}</span>
            <span className="flex gap-2">
              <button
                type="button"
                className={pillButton}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t("orgs.ev.prev")}
              </button>
              <button
                type="button"
                className={pillButton}
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("orgs.ev.next")}
              </button>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
