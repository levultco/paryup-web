"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarIcon, CheckCircleIcon } from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import {
  Card,
  PageHeader,
  RolePill,
  pillButton,
} from "@/components/organizations/ui";
import { orgFetch } from "@/lib/org-api";
import { DISCOVERY_TZ } from "@/lib/discovery";
import { intlLocale } from "@/lib/i18n";
import {
  ORG_PERMISSIONS,
  type OrganizationOverview,
} from "@/lib/organizations";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-raised p-5">
      <p className="text-sm text-white/55">{label}</p>
      <p className="font-display mt-3 text-4xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

export function OverviewView() {
  const justCreated = useSearchParams().get("created") === "1";
  const { t, locale } = useI18n();
  const { slug, org, role, can } = useOrg();
  const [data, setData] = useState<OrganizationOverview | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    orgFetch<OrganizationOverview>(slug, "overview").then((res) => {
      if (!active) return;
      if (res.ok && res.data) setData(res.data);
      else setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  const base = `/organizations/${slug}`;
  const canEdit = can(ORG_PERMISSIONS.profileEdit);
  const number = new Intl.NumberFormat(intlLocale(locale));
  const day = new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: DISCOVERY_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const hasLinks =
    !!org.socialLinks &&
    Object.values(org.socialLinks).some(
      (v) => typeof v === "string" && v.trim(),
    );
  const fields = [
    { key: "logo", done: !!org.logo },
    { key: "banner", done: !!org.banner },
    { key: "bio", done: !!org.bio?.trim() },
    { key: "city", done: !!org.city?.trim() },
    { key: "links", done: hasLinks },
  ] as const;
  const missing = fields.filter((f) => !f.done);

  return (
    <div className="flex flex-col gap-6">
      {justCreated ? (
        <p
          role="status"
          className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
        >
          {t("orgs.panel.created")}
        </p>
      ) : null}

      <PageHeader
        title={t("orgs.panel.overviewTitle")}
        subtitle={[
          org.city,
          t("orgs.panel.since", {
            date: new Intl.DateTimeFormat(intlLocale(locale), {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(org.createdAt)),
          }),
        ]
          .filter(Boolean)
          .join(" · ")}
        aside={
          <RolePill>
            {t("orgs.panel.yourRole")}: {t(`orgs.role.${role}`)}
          </RolePill>
        }
      />

      {failed ? (
        <p className="rounded-3xl border border-white/10 bg-raised p-6 text-center text-white/55">
          {t("orgs.ov.error")}
        </p>
      ) : (
        <section
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          aria-busy={!data}
        >
          {data ? (
            <>
              <Stat
                label={t("orgs.panel.followers")}
                value={number.format(data.followersCount)}
              />
              <Stat
                label={t("orgs.panel.upcoming")}
                value={number.format(data.upcomingEvents)}
              />
              <Stat
                label={t("orgs.panel.past")}
                value={number.format(data.pastEvents)}
              />
            </>
          ) : (
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[108px] animate-pulse rounded-3xl bg-white/[0.07]"
              />
            ))
          )}
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_21rem]">
        <Card title={t("orgs.ov.recent")}>
          {!data ? (
            <div
              aria-hidden
              className="h-40 animate-pulse rounded-2xl bg-white/[0.05]"
            />
          ) : data.recentEvents.length > 0 ? (
            <ul className="flex flex-col divide-y divide-white/10">
              {data.recentEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                    {e.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={e.coverImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate font-medium text-white">
                      {e.name}
                    </span>
                    <span className="truncate text-sm text-white/45">
                      {day.format(new Date(e.date))}
                      {e.location ? ` · ${e.location}` : ""}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
                      e.upcoming
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-white/10 text-white/55"
                    }`}
                  >
                    {e.upcoming
                      ? t("orgs.panel.badgeUpcoming")
                      : t("orgs.panel.badgePast")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <CalendarIcon className="h-8 w-8 text-white/40" />
              <p className="font-display mt-4 text-xl font-semibold text-white">
                {t("orgs.panel.emptyEventsTitle")}
              </p>
              <p className="mt-2 max-w-sm text-sm text-white/55">
                {t("orgs.panel.emptyEventsText")}
              </p>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card title={t("orgs.ov.profileStatus")}>
            <ul className="flex flex-col gap-3">
              {fields.map((f) => (
                <li key={f.key} className="flex items-center gap-3 text-sm">
                  <CheckCircleIcon
                    className={`h-5 w-5 shrink-0 ${f.done ? "text-emerald-400" : "text-white/25"}`}
                  />
                  <span className={f.done ? "text-white" : "text-white/55"}>
                    {t(`orgs.field.${f.key}`)}
                  </span>
                  {!f.done && canEdit ? (
                    <Link
                      href={`${base}/profile#${f.key}`}
                      className="ml-auto rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 transition-colors hover:border-white/50 hover:text-white"
                    >
                      {t("orgs.ov.fix")}
                    </Link>
                  ) : f.done ? null : (
                    <span className="ml-auto text-xs text-white/40">
                      {t("orgs.ov.missing")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {missing.length === 0 ? (
              <p className="mt-4 text-xs text-emerald-300/80">
                {t("orgs.ov.complete")}
              </p>
            ) : !canEdit ? (
              <p className="mt-4 text-xs text-white/40">
                {t("orgs.ov.readOnlyHint")}
              </p>
            ) : null}
          </Card>

          <Card title={t("orgs.ov.team")}>
            <Link
              href={`${base}/team`}
              className="group flex items-center justify-between rounded-2xl text-white/80 transition-colors hover:text-white"
            >
              <span>
                {!data
                  ? "…"
                  : data.membersCount === 1
                    ? t("orgs.ov.membersOne")
                    : t("orgs.ov.membersMany", { count: data.membersCount })}
              </span>
              <span className="text-sm text-white/45 transition-colors group-hover:text-white">
                {t("orgs.ov.manageTeam")} →
              </span>
            </Link>
          </Card>

          <Card title={t("orgs.ov.quick")}>
            <div className="flex flex-wrap gap-2">
              <Link href={`${base}/profile`} className={pillButton}>
                {t("orgs.ov.editProfile")}
              </Link>
              <Link href={`${base}/team`} className={pillButton}>
                {t("orgs.ov.manageTeam")}
              </Link>
              <Link href={`${base}/settings`} className={pillButton}>
                {t("orgs.ov.settings")}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
