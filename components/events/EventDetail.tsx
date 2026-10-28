"use client";

import Link from "next/link";
import { ArrowLeftIcon, MapPointIcon } from "@/components/icons/solar";
import { EventActions } from "@/components/events/EventActions";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { PublicEvent } from "@/lib/events";
import { longDateLabel } from "@/lib/discovery";
import { localDayKey, priceLabel, timeLabel } from "@/lib/format";

/** Contenido visible del detalle de un evento; la página del servidor aporta el JSON-LD y los datos. */
export function EventDetail({
  event,
  backHref,
  year,
}: {
  event: PublicEvent;
  backHref: string;
  year: number;
}) {
  const { t, locale } = useI18n();
  const startKey = localDayKey(event.date);
  const endKey = event.endDate ? localDayKey(event.endDate) : null;
  const start = timeLabel(event.date);
  const end = timeLabel(event.endDate);
  const price = priceLabel(event.price, event.soldOut, t, locale);

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
                {longDateLabel(startKey, year, locale)}
              </dd>
              {start ? (
                <dd className="text-white/70">
                  {start}
                  {end
                    ? ` – ${end}${endKey && endKey !== startKey ? ` ${t("detail.nextDay")}` : ""}`
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

          <div className="mt-9">
            {event.soldOut ? (
              <p className="mb-4 text-sm text-muted">{t("detail.soldOut")}</p>
            ) : null}
            <EventActions id={event.id} title={event.name} />
          </div>

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
