"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import { Card, pillButton } from "@/components/organizations/ui";
import { DISCOVERY_TZ } from "@/lib/discovery";
import { intlLocale } from "@/lib/i18n";
import { orgFetch } from "@/lib/org-api";
import type { Attendee } from "@/lib/sales";

const STATUSES = ["", "ACTIVE", "USED", "CANCELLED", "REFUNDED"] as const;

/** Entradas emitidas del evento. Solo nombre y entrada: el contacto de los compradores no se expone. */
export function EventAttendees({ eventId }: { eventId: string }) {
  const { t, locale } = useI18n();
  const { slug } = useOrg();
  const [items, setItems] = useState<Attendee[] | null>(null);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [failed, setFailed] = useState(false);

  const time = new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: DISCOVERY_TZ,
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(
    async (after?: string | null) => {
      const params = new URLSearchParams({ limit: "25" });
      if (status) params.set("status", status);
      if (query) params.set("search", query);
      if (after) params.set("cursor", after);
      const res = await orgFetch<{
        attendees: Attendee[];
        total: number;
        nextCursor: string | null;
      }>(slug, `events/${eventId}/attendees?${params}`);
      if (!res.ok || !res.data) return setFailed(true);
      setFailed(false);
      setItems((prev) =>
        after && prev ? [...prev, ...res.data!.attendees] : res.data!.attendees,
      );
      setTotal(res.data.total);
      setCursor(res.data.nextCursor);
    },
    [slug, eventId, status, query],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <Card title={t("orgs.sl.attendees")}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setItems(null);
            setSearch(e.target.value);
          }}
          placeholder={t("orgs.sl.searchAttendee")}
          aria-label={t("orgs.sl.searchAttendee")}
          className="h-10 min-w-0 flex-1 rounded-full border border-white/15 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/60 sm:max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => {
            setItems(null);
            setStatus(e.target.value as (typeof STATUSES)[number]);
          }}
          aria-label={t("orgs.ev.col.status")}
          className="h-10 rounded-full border border-white/15 bg-black px-4 text-sm text-white"
        >
          {STATUSES.map((s) => (
            <option key={s || "all"} value={s}>
              {s ? t(`orgs.sl.as.${s}`) : t("orgs.sl.all")}
            </option>
          ))}
        </select>
        {items ? (
          <span className="text-xs text-white/40">
            {t("orgs.sl.attendeesCount", { count: total })}
          </span>
        ) : null}
      </div>
      {failed ? (
        <p className="text-sm text-white/55">{t("orgs.sl.loadError")}</p>
      ) : items === null ? (
        <div
          aria-hidden
          className="h-24 animate-pulse rounded-2xl bg-white/[0.05]"
        />
      ) : items.length === 0 ? (
        <p className="text-sm text-white/45">{t("orgs.sl.noAttendees")}</p>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-white/10">
            {items.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold text-white">
                  {a.holder.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.holder.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    a.holder.name.trim().charAt(0).toUpperCase() || "P"
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium text-white">
                    {a.holder.name}
                  </span>
                  <span className="truncate text-xs text-white/45">
                    {[
                      a.ticketName,
                      a.releaseName,
                      a.usedAt ? time.format(new Date(a.usedAt)) : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                {a.codeLastFour ? (
                  <span className="font-mono text-xs text-white/40">
                    ···· {a.codeLastFour}
                  </span>
                ) : null}
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
                  {t(`orgs.sl.as.${a.status}`)}
                </span>
              </li>
            ))}
          </ul>
          {cursor ? (
            <button
              type="button"
              className={`${pillButton} mt-4`}
              onClick={() => load(cursor)}
            >
              {t("orgs.sl.loadMore")}
            </button>
          ) : null}
        </>
      )}
      <p className="mt-4 text-xs text-white/35">{t("orgs.sl.privacy")}</p>
    </Card>
  );
}
