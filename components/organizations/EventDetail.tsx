"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { EventAccess } from "@/components/organizations/EventAccess";
import { EventAttendees } from "@/components/organizations/EventAttendees";
import { EventSales } from "@/components/organizations/EventSales";
import { SalesChart } from "@/components/organizations/SalesChart";
import { StatusBadge } from "@/components/organizations/EventsList";
import { useOrg } from "@/components/organizations/OrgShell";
import { pillButton } from "@/components/organizations/ui";
import { DISCOVERY_TZ } from "@/lib/discovery";
import type { EventStatus } from "@/lib/events-admin";
import { intlLocale } from "@/lib/i18n";
import { orgFetch } from "@/lib/org-api";
import { ORG_PERMISSIONS } from "@/lib/organizations";

type EventSummary = {
  name?: string;
  coverImage?: string | null;
  date?: string;
  location?: string | null;
  status: EventStatus;
};

/** Vista principal de un evento: estadísticas. La edición vive en /settings. */
export function EventDetail({ eventId }: { eventId: string }) {
  const { t, locale } = useI18n();
  const { slug, can } = useOrg();
  const base = `/organizations/${slug}/events`;
  const [event, setEvent] = useState<EventSummary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    orgFetch<EventSummary | { event: EventSummary }>(
      slug,
      `events/${eventId}`,
    ).then((res) => {
      if (!active) return;
      if (!res.ok || !res.data) return setFailed(true);
      const data = res.data as { event?: EventSummary };
      setEvent((data.event ?? res.data) as EventSummary);
    });
    return () => {
      active = false;
    };
  }, [slug, eventId]);

  const dateFormat = new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: DISCOVERY_TZ,
  });

  if (failed) {
    return (
      <div className="flex flex-col items-start gap-4">
        <Link href={base} className="text-sm text-white/55 hover:text-white">
          ← {t("orgs.ed.back")}
        </Link>
        <p className="text-white/55">{t("orgs.ev.err.notFound")}</p>
      </div>
    );
  }
  if (!event) {
    return (
      <div
        aria-hidden
        className="h-40 animate-pulse rounded-3xl bg-white/[0.06]"
      />
    );
  }

  const published = event.status !== "DRAFT";
  const showAccess = published && can(ORG_PERMISSIONS.accessRequestsManage);
  const showSales = published && can(ORG_PERMISSIONS.statsView);
  const showAttendees = published && can(ORG_PERMISSIONS.accessControlView);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={base}
        className="w-fit text-sm text-white/55 transition-colors hover:text-white"
      >
        ← {t("orgs.ed.back")}
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        <span className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/10">
          {event.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.coverImage}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="font-display truncate text-4xl font-semibold text-white">
            {event.name}
          </h1>
          <p className="truncate text-sm text-white/45">
            {[
              event.date ? dateFormat.format(new Date(event.date)) : null,
              event.location,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <StatusBadge status={event.status} />
        <Link href={`${base}/${eventId}/settings`} className={pillButton}>
          {t("orgs.ev.viewSettings")}
        </Link>
      </div>

      {!published ? (
        <p className="rounded-3xl border border-dashed border-white/15 p-8 text-center text-white/55">
          {t("orgs.ev.draftStats")}
        </p>
      ) : null}
      {published && !showAccess && !showSales && !showAttendees ? (
        <p className="text-white/55">{t("orgs.ev.noStatsAccess")}</p>
      ) : null}

      {showSales ? <SalesChart eventId={eventId} /> : null}
      {showSales ? <EventSales eventId={eventId} /> : null}
      {showAccess ? <EventAccess eventId={eventId} /> : null}
      {showAttendees ? <EventAttendees eventId={eventId} /> : null}
    </div>
  );
}
