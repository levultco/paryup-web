"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeftIcon, MapPointIcon } from "@/components/icons/solar";
import { EventActions } from "@/components/events/EventActions";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { PublicEvent } from "@/lib/events";
import { longDateLabel } from "@/lib/discovery";
import {
  describeListCondition,
  externalCopy,
  externalPrice,
  externalWhen,
  formatMoney,
  rateStatus,
  type ExternalRates,
} from "@/lib/external-events";
import { localDayKey, priceLabel, timeLabel } from "@/lib/format";

/** Contenido visible del detalle de un evento; la página del servidor aporta el JSON-LD y los datos. */
export function EventDetail({
  event,
  backHref,
  year,
  externalRates,
}: {
  event: PublicEvent;
  backHref: string;
  year: number;
  /** Solo eventos Fourvenues; null si Fourvenues no respondió. */
  externalRates?: ExternalRates | null;
}) {
  const { t, locale } = useI18n();
  const [nowMs] = useState(() => new Date().getTime());
  const startKey = localDayKey(event.date);
  const endKey = event.endDate ? localDayKey(event.endDate) : null;
  const start = timeLabel(event.date);
  const end = timeLabel(event.endDate);
  const isExternal = event.source === "FOURVENUES" && event.external !== null;
  const copy = externalCopy(locale);
  const when = isExternal
    ? externalWhen(event.date, event.endDate, event.external!, locale, year)
    : null;
  const price = isExternal
    ? externalPrice(event.external, locale)
    : priceLabel(event.price, event.soldOut, t, locale);

  return (
    <>
      <Link
        href={backHref}
        className="mb-8 inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm transition hover:bg-white/10"
      >
        <ArrowLeftIcon className="h-5 w-5" /> {t("detail.back")}
      </Link>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div className="overflow-hidden rounded-3xl bg-raised">
          {event.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.coverImage}
              alt={event.name}
              fetchPriority="high"
              decoding="async"
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center">
              <span className="font-display text-8xl font-semibold text-white/25">
                {event.name.trim().charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {event.organization ? (
            <p className="mb-3 text-sm text-muted">{event.organization.name}</p>
          ) : null}
          <h1 className="font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
            {event.name}
          </h1>

          <dl className="mt-8 space-y-5">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-white/40">
                {t("detail.when")}
              </dt>
              <dd className="mt-1 text-lg first-letter:uppercase">
                {when ? when.dateLabel : longDateLabel(startKey, year, locale)}
              </dd>
              {(when ? when.start : start) ? (
                <dd className="text-white/70">
                  {when ? when.start : start}
                  {(when ? when.end : end)
                    ? ` – ${when ? when.end : end}${(when ? when.endsNextDay : endKey && endKey !== startKey) ? ` ${t("detail.nextDay")}` : ""}`
                    : ""}
                </dd>
              ) : null}
            </div>
            {event.location ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-white/40">
                  {t("detail.where")}
                </dt>
                <dd className="mt-1 flex items-start gap-2 text-lg">
                  <MapPointIcon className="mt-1 h-5 w-5 shrink-0 text-white/50" />
                  <span>
                    {event.location}
                    {event.address ? (
                      <span className="block text-base text-white/60">
                        {event.address}
                      </span>
                    ) : null}
                  </span>
                </dd>
              </div>
            ) : null}
            {price ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-white/40">
                  {t("detail.tickets")}
                </dt>
                <dd className="mt-1 text-lg">{price}</dd>
              </div>
            ) : null}
          </dl>

          {isExternal ? (
            <section className="mt-9 space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em] text-white/40">
                {copy.heading}
              </h2>
              {externalRates === null || externalRates === undefined ? (
                <p className="text-sm text-muted">{copy.unavailable}</p>
              ) : externalRates.ticketRates.length === 0 &&
                externalRates.listRates.length === 0 ? (
                <p className="text-sm text-muted">{copy.none}</p>
              ) : (
                <ul className="space-y-3">
                  {externalRates.ticketRates.map((rate) => (
                    <li key={rate.id} className="flex items-center justify-between gap-4">
                      <span>
                        <span className="block font-medium">{rate.name}</span>
                        <span className="block text-sm text-white/60">
                          {rateStatus(rate, locale)}
                        </span>
                      </span>
                      {rate.price !== null ? (
                        <span className="font-medium">
                          {formatMoney(rate.price, externalRates.currency, locale)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                  {externalRates.listRates.map((rate) => (
                    <li key={rate.id}>
                      <span className="block font-medium">{rate.name}</span>
                      <span className="block text-sm text-white/60">
                        {rate.open
                          ? copy.listOpen
                          : rate.validFrom && new Date(rate.validFrom).getTime() > nowMs
                            ? copy.listSoon
                            : copy.listClosed}
                        {rate.max ? ` · ${copy.maxPeople.replace("{n}", String(rate.max))}` : ""}
                      </span>
                      {rate.conditions.map((condition, i) => {
                        const line = describeListCondition(condition, {
                          currency: externalRates.currency,
                          timezone: event.external?.timezone ?? null,
                          locale,
                        });
                        return line ? (
                          <span key={i} className="block text-sm text-white/60">
                            {line}
                          </span>
                        ) : null;
                      })}
                      {rate.open && !rate.signup.allowed ? (
                        <span className="mt-1 block text-sm text-white/60">{copy.listPaidUnclear}</span>
                      ) : rate.open && externalRates.writes.lists ? (
                        <span className="mt-1 block text-sm text-white/60">{copy.listInApp}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              {externalRates ? (
                <div>
                  <span className="block font-medium">{copy.reservedHeading}</span>
                  <span className="block text-sm text-white/60">
                    {externalRates.writes.bookings ? copy.reservedEnabled : copy.reservedDisabled}
                  </span>
                </div>
              ) : null}
              {externalRates && !externalRates.live ? (
                <p className="text-xs text-white/50">{copy.stale}</p>
              ) : null}
              <p className="text-sm text-muted">{copy.notEnabled}</p>
            </section>
          ) : (
            <div className="mt-9">
              {event.soldOut ? (
                <p className="mb-4 text-sm text-muted">{t("detail.soldOut")}</p>
              ) : null}
              <EventActions id={event.id} title={event.name} />
            </div>
          )}

          {event.description ? (
            <p className="mt-10 max-w-xl whitespace-pre-line leading-7 text-white/75">
              {event.description}
            </p>
          ) : null}

          {event.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function EventLoadError() {
  const { t } = useI18n();
  return <p className="py-32 text-center text-muted">{t("detail.error")}</p>;
}

export function LoadingText() {
  const { t } = useI18n();
  return <p className="py-32 text-center text-muted">{t("common.loading")}</p>;
}
