"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import { PageHeader, RolePill } from "@/components/organizations/ui";
import { ListSkeleton } from "@/components/organizations/skeletons";
import { externalPrice, externalWhen } from "@/lib/external-events";
import {
  activityKey,
  channelEmptyKey,
  syncPhaseKey,
  syncState,
  type FourvenuesHome,
} from "@/lib/fourvenues-home";
import { intlLocale } from "@/lib/i18n";
import { orgFetch } from "@/lib/org-api";

const card = "rounded-[28px] bg-raised p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] sm:p-7";

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span className="font-display block text-[40px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-white">
        {value}
      </span>
      <span className="mt-1 block text-[13px] text-white/50">{label}</span>
    </div>
  );
}

/**
 * Inicio de una organización FOURVENUES: estado del canal, catálogo sincronizado y actividad
 * verificable en una sola pantalla. No muestra cifras globales del local ni de Stripe: el
 * backend solo entrega lo que registra ParyUp.
 */
export function FourvenuesHomeView() {
  const { t, locale } = useI18n();
  const { slug, role } = useOrg();
  const [home, setHome] = useState<FourvenuesHome | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    let active = true;
    orgFetch<FourvenuesHome>(slug, "fourvenues/home").then((res) => {
      if (!active) return;
      if (res.ok && res.data) {
        setHome(res.data);
        setFailed(false);
      } else setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => load(), [load]);

  const day = new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "short" });
  const link = home?.link;
  const emptyKey = home ? channelEmptyKey(home.channel) : null;
  const next = home?.catalog.nextEvent;
  const nextWhen = next?.externalRef
    ? externalWhen(next.date, next.endDate, next.externalRef, locale)
    : null;
  const nextPrice = next?.externalRef
    ? externalPrice({ ...next.externalRef, hasAvailableRates: null }, locale)
    : null;
  const sync = syncState(link?.lastSyncAt, link?.lastSyncStatus);
  const phaseKey = syncPhaseKey(link?.sync);
  const dateTime = new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title={t("orgs.fvHome.title")}
        subtitle={link ? `${link.host.name} · ${t(`orgs.fv.status.${link.status}` as never)}` : undefined}
        aside={
          <RolePill>
            {t("orgs.panel.yourRole")}: {t(`orgs.role.${role}`)}
          </RolePill>
        }
      />

      {failed && !home ? (
        <p className={`${card} text-center text-white/55`}>
          {t("orgs.fvHome.loadError")}
        </p>
      ) : !home ? (
        <ListSkeleton />
      ) : (
        <>
          <section className={card} aria-labelledby="fv-channel">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="fv-channel" className="font-display text-lg font-semibold text-white">
                {t("orgs.fvHome.channelTitle")}
              </h2>
              <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] text-white/60">
                {t("orgs.fvHome.onlyParyUp")}
              </span>
            </div>
            {emptyKey ? (
              <p className="max-w-2xl text-sm leading-6 text-white/60">{t(emptyKey)}</p>
            ) : home.channel.totals ? (
              <div className="grid grid-cols-3 gap-4">
                {home.channel.enabled.tickets ? (
                  <Metric label={t("orgs.fvHome.tickets")} value={home.channel.totals.tickets} />
                ) : null}
                <Metric label={t("orgs.fvHome.lists")} value={home.channel.totals.lists} />
                <Metric label={t("orgs.fvHome.bookings")} value={home.channel.totals.bookings} />
              </div>
            ) : null}
            {home.channel.bookingBreakdown && home.channel.totals?.bookings ? (
              <p className="mt-4 text-sm text-white/50">
                {t("orgs.fvHome.bookingBreakdown", home.channel.bookingBreakdown)}
              </p>
            ) : null}
          </section>

          <section className={card} aria-labelledby="fv-catalog">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="fv-catalog" className="font-display text-lg font-semibold text-white">
                {t("orgs.fvHome.catalogTitle")}
              </h2>
              <Link href={`/${slug}/events`} className="text-sm text-white/60 underline-offset-4 hover:underline">
                {t("orgs.fvHome.viewEvents")}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Metric label={t("orgs.fvHome.upcoming")} value={home.catalog.upcoming} />
              <Metric label={t("orgs.fvHome.withRates")} value={home.catalog.withOnSaleRates} />
              {home.catalog.needsConfirmation > 0 ? (
                <Metric label={t("orgs.fvHome.needsConfirmation")} value={home.catalog.needsConfirmation} />
              ) : null}
              {home.catalog.unavailable > 0 ? (
                <Metric label={t("orgs.fvHome.unavailable")} value={home.catalog.unavailable} />
              ) : null}
            </div>
            <div className="mt-6 border-t border-white/[0.06] pt-5">
              {next ? (
                <Link href={`/events/${next.id}`} className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                    {t("orgs.fvHome.nextEvent")}
                  </span>
                  <span className="mt-1 block text-lg font-semibold text-white">{next.name}</span>
                  <span className="block text-sm text-white/60">
                    {nextWhen
                      ? `${nextWhen.dateLabel}${nextWhen.start ? ` · ${nextWhen.start}` : ""}`
                      : day.format(new Date(next.date))}
                    {nextPrice ? ` · ${nextPrice}` : ""}
                  </span>
                </Link>
              ) : (
                <p className="text-sm text-white/60">
                  {t(link?.status === "ACTIVE" ? "orgs.fvHome.noEvents" : "orgs.fvHome.noEventsInactive")}
                </p>
              )}
            </div>
            <p className="mt-4 text-xs text-white/40">
              {phaseKey
                ? t(phaseKey, { date: link?.sync?.at ? dateTime.format(new Date(link.sync.at)) : "" })
                : t(sync.key, sync.params)}
            </p>
          </section>

          <section className={card} aria-labelledby="fv-activity">
            <h2 id="fv-activity" className="font-display mb-4 text-lg font-semibold text-white">
              {t("orgs.fvHome.activityTitle")}
            </h2>
            {home.activity.length === 0 ? (
              <p className="text-sm text-white/60">{t("orgs.fvHome.noActivity")}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {home.activity.slice(0, 10).map((item) => {
                  const a = activityKey(item);
                  return (
                    <li key={item.id} className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-white/80">{t(a.key, a.params)}</span>
                      <time dateTime={item.at} className="shrink-0 text-white/40">
                        {day.format(new Date(item.at))}
                      </time>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
