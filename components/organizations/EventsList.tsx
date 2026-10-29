"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarIcon } from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import {
  PageHeader,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { DISCOVERY_TZ } from "@/lib/discovery";
import { intlLocale } from "@/lib/i18n";
import { ORG_PERMISSIONS } from "@/lib/organizations";
import type { EventStatus, ManagedEventsPage } from "@/lib/events-admin";

const LIMIT = 20;
type Timeframe = "upcoming" | "past" | "all";

export function StatusBadge({ status }: { status: EventStatus }) {
  const { t } = useI18n();
  const tone =
    status === "PUBLISHED"
      ? "bg-emerald-400/10 text-emerald-300"
      : status === "DRAFT"
        ? "bg-amber-400/10 text-amber-300"
        : status === "CANCELLED"
          ? "bg-red-500/10 text-red-300"
          : "bg-white/10 text-white/55";
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs ${tone}`}
    >
      {t(`orgs.ev.status.${status}`)}
    </span>
  );
}

export function EventsList() {
  const { t, locale } = useI18n();
  const { slug, org, can } = useOrg();
  const canCreate = can(ORG_PERMISSIONS.eventsCreate);
  const base = `/organizations/${slug}/events`;

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
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label={t("orgs.ev.col.status")}
          className="h-10 rounded-full border border-white/15 bg-black px-4 text-sm text-white outline-none focus:border-white/60"
        >
          <option value="">{t("orgs.ev.status.all")}</option>
          {(["DRAFT", "PUBLISHED", "CANCELLED"] as const).map((s) => (
            <option key={s} value={s}>
              {t(`orgs.ev.status.${s}`)}
            </option>
          ))}
        </select>
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
        <div aria-hidden className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-2xl bg-white/[0.06]"
            />
          ))}
        </div>
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
          <ul className="flex flex-col divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-raised">
            {data.items.map((event) => (
              <li key={event.id}>
                <Link
                  href={`${base}/${event.id}`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-white/[0.04]"
                >
                  <span className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                    {event.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.coverImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate font-medium text-white">
                      {event.name}
                    </span>
                    <span className="truncate text-sm text-white/45">
                      {dateFormat.format(new Date(event.date))}
                    </span>
                    <span className="truncate text-xs text-white/35">
                      {event.location}
                    </span>
                  </span>
                  <span className="hidden shrink-0 flex-col items-end gap-1 text-xs text-white/45 sm:flex">
                    <span>
                      {event.ticketsCount === 1
                        ? t("orgs.ev.ticketsOne")
                        : t("orgs.ev.ticketsCount", {
                            count: event.ticketsCount,
                          })}
                    </span>
                    <span className="flex gap-1.5">
                      {event.minAge ? (
                        <span className="rounded-full border border-white/15 px-2 py-0.5">
                          {t("orgs.ev.minAgeChip", { age: event.minAge })}
                        </span>
                      ) : null}
                      {!event.isPublic ? (
                        <span className="rounded-full border border-white/15 px-2 py-0.5">
                          {t("orgs.ev.private")}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <StatusBadge status={event.status} />
                </Link>
              </li>
            ))}
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
