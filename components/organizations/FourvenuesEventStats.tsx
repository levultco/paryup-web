"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import { Card } from "@/components/organizations/ui";
import { StatsSkeleton } from "@/components/organizations/skeletons";
import { DISCOVERY_TZ } from "@/lib/discovery";
import { intlLocale, type MessageKey } from "@/lib/i18n";
import { orgFetch } from "@/lib/org-api";

type Sales = {
  currency: string | null;
  live: boolean;
  totals: { sold: number; available: number };
  rates: {
    id: string;
    name: string;
    state: "ON_SALE" | "SOON" | "SOLD_OUT" | "UNAVAILABLE" | "NONE";
    price: number | null;
    sold: number | null;
    available: number | null;
  }[];
};

type Activity = {
  lists: {
    id: string;
    fullName: string;
    partySize: number;
    fvEntered: boolean;
    createdAt: string;
  }[];
  bookings: {
    id: string;
    fullName: string;
    quantity: number;
    zoneSlug: string;
    fvStatus: string | null;
    createdAt: string;
  }[];
};

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <p className="text-xs text-white/45">{label}</p>
      <p className="font-display mt-1 text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

const BOOKING_KEY: Record<string, MessageKey> = {
  pending: "orgs.fv.b.pending",
  accepted: "orgs.fv.b.accepted",
  rejected: "orgs.fv.b.rejected",
};

/** Estadísticas de un evento Fourvenues: ventas leídas de Fourvenues y actividad del canal ParyUp. */
export function FourvenuesEventStats({ eventId }: { eventId: string }) {
  const { t, locale } = useI18n();
  const { slug } = useOrg();
  const loc = intlLocale(locale);
  const [sales, setSales] = useState<Sales | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      orgFetch<Sales>(slug, `fourvenues/events/${eventId}/sales`),
      orgFetch<Activity>(slug, `fourvenues/events/${eventId}/activity`),
    ]).then(([s, a]) => {
      if (!active) return;
      if (s.ok && s.data) setSales(s.data);
      if (a.ok && a.data) setActivity(a.data);
      if (!s.ok && !a.ok) setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [slug, eventId]);

  if (failed) return <p className="text-white/55">{t("orgs.fv.error")}</p>;
  if (!sales && !activity) return <StatsSkeleton />;

  const currency = sales?.currency ?? "EUR";
  const money = (n: number | null) =>
    n == null || n <= 0
      ? "—"
      : new Intl.NumberFormat(loc, { style: "currency", currency }).format(n);
  const date = new Intl.DateTimeFormat(loc, {
    timeZone: DISCOVERY_TZ,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const guests = activity?.lists.reduce((n, l) => n + l.partySize, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {sales ? (
          <>
            <Tile label={t("orgs.fv.sold")} value={String(sales.totals.sold)} />
            <Tile
              label={t("orgs.fv.available")}
              value={String(sales.totals.available)}
            />
          </>
        ) : null}
        {activity ? (
          <>
            <Tile
              label={t("orgs.fv.lists")}
              value={`${activity.lists.length} · ${guests} ${t("orgs.fv.people")}`}
            />
            <Tile
              label={t("orgs.fv.bookings")}
              value={String(activity.bookings.length)}
            />
          </>
        ) : null}
      </div>

      {sales ? (
        <Card title={t("orgs.fv.rates")}>
          <p className="-mt-3 mb-4 text-xs text-white/40">
            {t("orgs.fv.ratesHint")}
            {sales.live ? "" : ` ${t("orgs.fv.stale")}`}
          </p>
          {sales.rates.length === 0 ? (
            <p className="text-white/55">{t("orgs.fv.noRates")}</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {sales.rates.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{r.name}</p>
                    <p className="text-xs text-white/45">
                      {t(`orgs.fv.state.${r.state}` as MessageKey)} ·{" "}
                      {money(r.price)}
                    </p>
                  </div>
                  <p className="text-right text-sm text-white/70">
                    <span className="font-semibold text-white">
                      {r.sold ?? 0}
                    </span>{" "}
                    {t("orgs.fv.sold").toLowerCase()}
                    {r.available != null ? ` · ${r.available}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      {activity ? (
        <Card title={t("orgs.fv.attendees")}>
          {activity.lists.length === 0 ? (
            <p className="text-white/55">{t("orgs.fv.noAttendees")}</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {activity.lists.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {l.fullName}
                    </p>
                    <p className="text-xs text-white/45">
                      {l.partySize} {t("orgs.fv.people")} ·{" "}
                      {date.format(new Date(l.createdAt))}
                    </p>
                  </div>
                  <span className="text-xs text-white/60">
                    {l.fvEntered ? t("orgs.fv.entered") : t("orgs.fv.signedUp")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      {activity ? (
        <Card title={t("orgs.fv.bookingsTitle")}>
          {activity.bookings.length === 0 ? (
            <p className="text-white/55">{t("orgs.fv.noBookings")}</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {activity.bookings.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {b.fullName}
                    </p>
                    <p className="text-xs text-white/45">
                      {b.quantity} {t("orgs.fv.people")} · {b.zoneSlug} ·{" "}
                      {date.format(new Date(b.createdAt))}
                    </p>
                  </div>
                  <span className="text-xs text-white/60">
                    {t(
                      BOOKING_KEY[(b.fvStatus ?? "").toLowerCase()] ??
                        "orgs.fv.b.review",
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}
    </div>
  );
}
