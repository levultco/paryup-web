"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { PublicEvent } from "@/lib/events";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { priceLabel, timeLabel } from "@/lib/format";

/** Cartel de evento: la imagen manda, el texto va debajo sin caja. */
export function EventTile({
  event,
  priority = false,
}: {
  event: PublicEvent;
  priority?: boolean;
}) {
  const { t, locale } = useI18n();
  const time = timeLabel(event.date);
  const price = priceLabel(event.price, event.soldOut, t, locale);
  const meta = [time, event.location].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-raised">
        {event.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImage}
            alt=""
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
            <span className="font-display text-6xl font-semibold text-white/30">
              {event.name.trim().charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {price ? (
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            {price}
          </span>
        ) : null}
      </div>
      <div className="px-1 pt-3">
        <h3 className="font-display line-clamp-2 text-lg font-semibold leading-snug">
          {event.name}
        </h3>
        {meta ? (
          <p className="mt-1 truncate text-sm text-muted">{meta}</p>
        ) : null}
        {event.organization ? (
          <p className="mt-0.5 truncate text-xs text-white/40">
            {event.organization.name}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

/** Un solo evento en el día: cartel grande y detalle al lado. */
export function EventFeature({
  event,
  aside,
}: {
  event: PublicEvent;
  aside?: ReactNode;
}) {
  const { t, locale } = useI18n();
  const time = timeLabel(event.date);
  const price = priceLabel(event.price, event.soldOut, t, locale);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-16">
      <Link
        href={`/events/${event.id}`}
        aria-label={event.name}
        className="relative block aspect-[4/5] overflow-hidden rounded-3xl bg-raised outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        {event.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImage}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
            <span className="font-display text-7xl font-semibold text-white/30">
              {event.name.trim().charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </Link>
      <div className="flex min-w-0 flex-col justify-center">
        {event.organization ? (
          <p className="text-sm text-muted">{event.organization.name}</p>
        ) : null}
        <h2 className="font-display mt-2 text-4xl font-semibold leading-[1.05] sm:text-5xl">
          {event.name}
        </h2>
        <p className="mt-4 text-lg text-white/70">
          {[time, event.location].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/events/${event.id}`}
            className="inline-flex h-12 items-center rounded-full bg-white px-7 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            {t("tile.view")}
          </Link>
          {price ? (
            <span className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80">
              {price}
            </span>
          ) : null}
        </div>
        {aside}
      </div>
    </div>
  );
}

export function EventTileSkeleton() {
  return (
    <div aria-hidden>
      <div className="aspect-[4/5] animate-pulse rounded-3xl bg-white/[0.06]" />
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-white/[0.06]" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-white/[0.06]" />
    </div>
  );
}
