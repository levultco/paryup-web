"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import {
  Card,
  Notice,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { DISCOVERY_TZ } from "@/lib/discovery";
import { intlLocale } from "@/lib/i18n";
import { orgFetch } from "@/lib/org-api";
import type { AccessRequest, ListEntry, RequestStatus } from "@/lib/reserved";

const REQUEST_FILTERS: (RequestStatus | "")[] = [
  "PENDING",
  "APPROVED_PENDING_PAYMENT",
  "CONFIRMED",
  "",
];
const LIST_FILTERS = ["", "ACTIVE", "USED"] as const;

function Person({ name, image }: { name: string; image: string | null }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold text-white">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        name.trim().charAt(0).toUpperCase() || "P"
      )}
    </span>
  );
}

/** Solicitudes de lista y reservado, e inscritos en lista, de un evento. Los datos personales se reducen al mínimo. */
export function EventAccess({ eventId }: { eventId: string }) {
  const { t, locale } = useI18n();
  const { slug } = useOrg();
  const [tab, setTab] = useState<"requests" | "list">("requests");
  const [reqFilter, setReqFilter] = useState<RequestStatus | "">("PENDING");
  const [listFilter, setListFilter] =
    useState<(typeof LIST_FILTERS)[number]>("");
  const [requests, setRequests] = useState<AccessRequest[] | null>(null);
  const [entries, setEntries] = useState<ListEntry[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const time = new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: DISCOVERY_TZ,
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });

  const loadRequests = useCallback(async () => {
    const res = await orgFetch<AccessRequest[] | { requests: AccessRequest[] }>(
      slug,
      `events/${eventId}/access-requests${reqFilter ? `?status=${reqFilter}` : ""}`,
    );
    if (!res.ok || !res.data) return setError(t("orgs.ac.loadError"));
    setError(null);
    setRequests(Array.isArray(res.data) ? res.data : (res.data.requests ?? []));
  }, [slug, eventId, reqFilter, t]);

  const loadEntries = useCallback(
    async (after?: string | null) => {
      const params = new URLSearchParams({ limit: "20" });
      if (listFilter) params.set("status", listFilter);
      if (after) params.set("cursor", after);
      const res = await orgFetch<{
        entries: ListEntry[];
        nextCursor: string | null;
      }>(slug, `events/${eventId}/list/entries?${params}`);
      if (!res.ok || !res.data) return setError(t("orgs.ac.loadError"));
      setError(null);
      setEntries((prev) =>
        after && prev ? [...prev, ...res.data!.entries] : res.data!.entries,
      );
      setCursor(res.data.nextCursor);
    },
    [slug, eventId, listFilter, t],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tab === "requests") void loadRequests();
    else void loadEntries();
  }, [tab, loadRequests, loadEntries]);

  const act = async (id: string, action: "approve" | "reject" | "cancel") => {
    setBusy(id);
    const res = await orgFetch(
      slug,
      `events/${eventId}/access-requests/${id}/${action}`,
      { method: "POST", body: {} },
    );
    setBusy(null);
    if (!res.ok) return setError(t("orgs.ac.actionError"));
    await loadRequests();
  };

  return (
    <Card title={t("orgs.ac.title")}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          className="flex rounded-full border border-white/15 p-1"
        >
          {(["requests", "list"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-1.5 text-sm ${tab === key ? "bg-white text-black" : "text-white/60"}`}
            >
              {t(key === "requests" ? "orgs.ac.requests" : "orgs.ac.list")}
            </button>
          ))}
        </div>
        {tab === "requests" ? (
          <select
            value={reqFilter}
            onChange={(e) => {
              setRequests(null);
              setReqFilter(e.target.value as RequestStatus | "");
            }}
            aria-label={t("orgs.ev.col.status")}
            className="h-10 rounded-full border border-white/15 bg-black px-4 text-sm text-white"
          >
            {REQUEST_FILTERS.map((f) => (
              <option key={f || "all"} value={f}>
                {f ? t(`orgs.ac.st.${f}`) : t("orgs.ac.all")}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={listFilter}
            onChange={(e) => {
              setEntries(null);
              setListFilter(e.target.value as (typeof LIST_FILTERS)[number]);
            }}
            aria-label={t("orgs.ev.col.status")}
            className="h-10 rounded-full border border-white/15 bg-black px-4 text-sm text-white"
          >
            {LIST_FILTERS.map((f) => (
              <option key={f || "all"} value={f}>
                {f ? t(`orgs.ac.ls.${f}`) : t("orgs.ac.all")}
              </option>
            ))}
          </select>
        )}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}

      {tab === "requests" ? (
        requests === null ? (
          <div
            aria-hidden
            className="h-24 animate-pulse rounded-2xl bg-white/[0.05]"
          />
        ) : requests.length === 0 ? (
          <p className="text-sm text-white/45">{t("orgs.ac.empty")}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/10">
            {requests.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Person name={r.requester.name} image={r.requester.image} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
                  <span className="truncate text-sm font-medium text-white">
                    {r.requester.name}
                    <span className="ml-2 rounded-full border border-white/15 px-2 py-0.5 text-xs font-normal text-white/60">
                      {t(`orgs.ac.kind.${r.kind}`)}
                    </span>
                  </span>
                  <span className="truncate text-xs text-white/45">
                    {[
                      r.partySize === 1
                        ? t("orgs.ac.partyOne")
                        : r.partySize
                          ? t("orgs.ac.party", { count: r.partySize })
                          : null,
                      r.reservedTableType
                        ? `${r.reservedTableType.area?.name ? `${r.reservedTableType.area.name} · ` : ""}${r.reservedTableType.name}`
                        : null,
                      r.totalPayNowAmount
                        ? t("orgs.ac.payNow", { amount: r.totalPayNowAmount })
                        : null,
                      t(`orgs.ac.st.${r.status}`),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  {r.contactName || r.contactPhone ? (
                    <span className="truncate text-xs text-white/35">
                      {t("orgs.ac.contact")}:{" "}
                      {[r.contactName, r.contactPhone]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  ) : null}
                  {r.notes ? (
                    <span className="text-xs text-white/35">{r.notes}</span>
                  ) : null}
                </span>
                <span className="flex gap-2">
                  {r.status === "PENDING" ? (
                    <>
                      <button
                        type="button"
                        className={primaryButton}
                        disabled={busy === r.id}
                        onClick={() => act(r.id, "approve")}
                      >
                        {t("orgs.ac.approve")}
                      </button>
                      <button
                        type="button"
                        className={pillButton}
                        disabled={busy === r.id}
                        onClick={() => act(r.id, "reject")}
                      >
                        {t("orgs.ac.reject")}
                      </button>
                    </>
                  ) : r.status === "APPROVED" ||
                    r.status === "APPROVED_PENDING_PAYMENT" ||
                    r.status === "CONFIRMED" ? (
                    <button
                      type="button"
                      className={pillButton}
                      disabled={busy === r.id}
                      onClick={() => act(r.id, "cancel")}
                    >
                      {t("orgs.ac.cancel")}
                    </button>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : entries === null ? (
        <div
          aria-hidden
          className="h-24 animate-pulse rounded-2xl bg-white/[0.05]"
        />
      ) : entries.length === 0 ? (
        <p className="text-sm text-white/45">{t("orgs.ac.emptyList")}</p>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-white/10">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Person name={e.user.name} image={e.user.image} />
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium text-white">
                    {e.user.name}
                  </span>
                  <span className="truncate text-xs text-white/45">
                    {[
                      e.ticket.name,
                      e.partySize === 1
                        ? t("orgs.ac.partyOne")
                        : t("orgs.ac.party", { count: e.partySize }),
                      e.usedAt
                        ? t("orgs.ac.usedAt", {
                            time: time.format(new Date(e.usedAt)),
                          })
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span
                  className="font-mono text-xs text-white/50"
                  aria-label={t("orgs.ac.code")}
                >
                  {e.accessCode}
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
                  {t(`orgs.ac.ls.${e.status}`)}
                </span>
              </li>
            ))}
          </ul>
          {cursor ? (
            <button
              type="button"
              className={`${pillButton} mt-4`}
              onClick={() => loadEntries(cursor)}
            >
              {t("orgs.ac.loadMore")}
            </button>
          ) : null}
        </>
      )}
    </Card>
  );
}
