"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import { Card, pillButton } from "@/components/organizations/ui";
import { DISCOVERY_TZ } from "@/lib/discovery";
import { intlLocale } from "@/lib/i18n";
import { orgFetch } from "@/lib/org-api";
import { formatMoney, type SalesOrder, type SalesSummary } from "@/lib/sales";

const STATUS_FILTERS = ["", "PAID", "PENDING", "REFUNDED", "FAILED"] as const;

function Tile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <p className="text-xs text-white/45">{label}</p>
      <p className="font-display mt-1 text-2xl font-semibold text-white">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-white/35">{hint}</p> : null}
    </div>
  );
}

/** Ventas del evento: cifras y órdenes reales del backend, sin cálculos propios. */
export function EventSales({ eventId }: { eventId: string }) {
  const { t, locale } = useI18n();
  const { slug } = useOrg();
  const loc = intlLocale(locale);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [orders, setOrders] = useState<SalesOrder[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("");
  const [failed, setFailed] = useState(false);

  const date = new Intl.DateTimeFormat(loc, {
    timeZone: DISCOVERY_TZ,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  // Por entrada solo se muestra la moneda del evento (los importes nunca se suman entre monedas).
  const money = (cents: number) =>
    formatMoney(cents, summary?.totals.amounts[0]?.currency ?? "EUR", loc);

  useEffect(() => {
    let active = true;
    orgFetch<SalesSummary>(slug, `events/${eventId}/sales`).then((res) => {
      if (!active) return;
      if (res.ok && res.data) setSummary(res.data);
      else setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [slug, eventId]);

  const loadOrders = useCallback(
    async (after?: string | null) => {
      const params = new URLSearchParams({ limit: "10" });
      if (status) params.set("status", status);
      if (after) params.set("cursor", after);
      const res = await orgFetch<{
        orders: SalesOrder[];
        nextCursor: string | null;
      }>(slug, `events/${eventId}/orders?${params}`);
      if (!res.ok || !res.data) return setFailed(true);
      setOrders((prev) =>
        after && prev ? [...prev, ...res.data!.orders] : res.data!.orders,
      );
      setCursor(res.data.nextCursor);
    },
    [slug, eventId, status],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOrders();
  }, [loadOrders]);

  return (
    <Card title={t("orgs.sl.title")}>
      {failed ? (
        <p className="text-sm text-white/55">{t("orgs.sl.loadError")}</p>
      ) : null}
      {summary ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile
              label={t("orgs.sl.sold")}
              value={String(summary.totals.ticketsSold)}
            />
            <Tile
              label={t("orgs.sl.checkedIn")}
              value={String(summary.totals.checkedIn)}
            />
            {summary.totals.amounts.map((a) => (
              <Fragment key={a.currency}>
                <Tile
                  label={`${t("orgs.sl.revenue")} (${a.currency})`}
                  value={formatMoney(a.ticketRevenue, a.currency, loc)}
                  hint={t("orgs.sl.revenueHint")}
                />
                <Tile
                  label={`${t("orgs.sl.billed")} (${a.currency})`}
                  value={formatMoney(a.billedAmount, a.currency, loc)}
                  hint={`${t("orgs.sl.fee")}: ${formatMoney(a.platformFeeAmount, a.currency, loc)}`}
                />
              </Fragment>
            ))}
          </div>
          {summary.totals.amounts.some(
            (a) => a.reservedRevenue > 0 || a.refundedAmount > 0,
          ) ? (
            <p className="mt-3 text-xs text-white/50">
              {summary.totals.amounts
                .filter((a) => a.reservedRevenue > 0 || a.refundedAmount > 0)
                .map((a) =>
                  [
                    a.reservedRevenue > 0
                      ? `${t("orgs.sl.reservedRevenue")}: ${formatMoney(a.reservedRevenue, a.currency, loc)}`
                      : null,
                    a.refundedAmount > 0
                      ? `${t("orgs.sl.refunded")}: ${formatMoney(a.refundedAmount, a.currency, loc)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · "),
                )
                .join(" · ")}
            </p>
          ) : null}
          <p className="mt-3 text-xs text-white/40">
            {t("orgs.sl.paidOrders")}: {summary.totals.paidOrders} ·{" "}
            {t("orgs.sl.pendingOrders")}: {summary.totals.pendingOrders}
          </p>

          <h3 className="font-display mt-6 text-base font-semibold text-white">
            {t("orgs.sl.byTicket")}
          </h3>
          <ul className="mt-3 flex flex-col divide-y divide-white/10">
            {summary.tickets.map((tk) => {
              const used = tk.capacity
                ? Math.min(
                    100,
                    Math.round(
                      ((tk.capacity - (tk.remaining ?? 0)) / tk.capacity) * 100,
                    ),
                  )
                : null;
              return (
                <li
                  key={tk.id}
                  className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white">
                      {tk.name}
                    </span>
                    <span className="text-sm text-white/70">
                      {money(tk.revenue)}
                    </span>
                  </div>
                  {used !== null ? (
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-white/10"
                      role="progressbar"
                      aria-valuenow={used}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-white/70"
                        style={{ width: `${used}%` }}
                      />
                    </div>
                  ) : null}
                  <p className="text-xs text-white/45">
                    {[
                      `${tk.sold} ${t("orgs.sl.sold").toLowerCase()}`,
                      tk.remaining === null
                        ? t("orgs.sl.unlimited")
                        : `${t("orgs.sl.remaining")} ${tk.remaining}`,
                      tk.reserved
                        ? `${tk.reserved} ${t("orgs.sl.reserved")}`
                        : null,
                      tk.listed ? `${tk.listed} ${t("orgs.sl.listed")}` : null,
                      tk.refunded
                        ? `${tk.refunded} ${t("orgs.sl.refundedTickets")}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      ) : !failed ? (
        <div
          aria-hidden
          className="h-28 animate-pulse rounded-2xl bg-white/[0.05]"
        />
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-white">
          {t("orgs.sl.orders")}
        </h3>
        <select
          value={status}
          onChange={(e) => {
            setOrders(null);
            setStatus(e.target.value as (typeof STATUS_FILTERS)[number]);
          }}
          aria-label={t("orgs.ev.col.status")}
          className="h-9 rounded-full border border-white/15 bg-black px-3 text-sm text-white"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s || "all"} value={s}>
              {s ? t(`orgs.sl.os.${s}`) : t("orgs.sl.all")}
            </option>
          ))}
        </select>
      </div>
      {orders === null ? (
        <div
          aria-hidden
          className="mt-3 h-16 animate-pulse rounded-2xl bg-white/[0.05]"
        />
      ) : orders.length === 0 ? (
        <p className="mt-3 text-sm text-white/45">{t("orgs.sl.noOrders")}</p>
      ) : (
        <>
          <ul className="mt-3 flex flex-col divide-y divide-white/10">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium text-white">
                    {o.user.name}
                  </span>
                  <span className="truncate text-xs text-white/45">
                    {o.lines
                      .map(
                        (l) =>
                          `${l.quantity}× ${l.ticketNameSnapshot}${l.releaseNameSnapshot ? ` (${l.releaseNameSnapshot})` : ""}`,
                      )
                      .join(", ")}{" "}
                    · {date.format(new Date(o.paidAt ?? o.createdAt))}
                  </span>
                  {o.refundAmount ? (
                    <span className="text-xs text-amber-300/80">
                      {t("orgs.sl.refundAmount", {
                        amount: formatMoney(o.refundAmount, o.currency, loc),
                      })}
                    </span>
                  ) : null}
                </span>
                <span className="text-sm text-white/80">
                  {formatMoney(o.totalAmount, o.currency, loc)}
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
                  {t(`orgs.sl.os.${o.status}`)}
                </span>
              </li>
            ))}
          </ul>
          {cursor ? (
            <button
              type="button"
              className={`${pillButton} mt-4`}
              onClick={() => loadOrders(cursor)}
            >
              {t("orgs.sl.loadMore")}
            </button>
          ) : null}
        </>
      )}
    </Card>
  );
}
