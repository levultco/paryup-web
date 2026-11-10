"use client";

import { SealCheck } from "@/components/profile/VerifiedBadge";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarAddIcon,
  CalendarDateIcon,
  ChevronRightIcon,
  HistoryIcon,
  PenIcon,
  SettingsIcon,
  UserRoundedIcon,
  UsersGroupIcon,
} from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { FourvenuesHomeView } from "@/components/organizations/FourvenuesHomeView";
import { useOrg } from "@/components/organizations/OrgShell";
import { Flash } from "@/components/organizations/flash";
import { Group } from "@/components/organizations/promoters-ui";
import { PageHeader, RolePill } from "@/components/organizations/ui";
import { orgFetch } from "@/lib/org-api";
import { DISCOVERY_TZ } from "@/lib/discovery";
import { intlLocale } from "@/lib/i18n";
import {
  ORG_PERMISSIONS,
  type OrganizationOverview,
} from "@/lib/organizations";
import {
  StatsSkeleton,
  ListSkeleton,
} from "@/components/organizations/skeletons";

const card = "rounded-[28px] bg-raised shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]";

function Stat({
  label,
  value,
  Icon,
  tone,
  href,
}: {
  label: string;
  value: string;
  Icon: typeof UsersGroupIcon;
  tone: string;
  href?: string;
}) {
  const inner = (
    <>
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}
      >
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-[13px] text-white/50">{label}</span>
        <span className="font-display mt-1 block text-[40px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-white">
          {value}
        </span>
      </span>
    </>
  );
  const cls = `flex flex-col gap-5 p-5 ${card}`;
  return href ? (
    <Link
      href={href}
      className={`${cls} transition-[background-color,transform] duration-150 hover:bg-[color-mix(in_srgb,var(--bg-raised),white_7%)] active:scale-[0.99]`}
    >
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/** Anillo de progreso del perfil. */
function Ring({ done, total }: { done: number; total: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const complete = done === total;
  return (
    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90" aria-hidden>
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          strokeWidth="5"
          className="stroke-white/10"
        />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - done / total)}
          className={`transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none ${complete ? "stroke-[#30d158]" : "stroke-white"}`}
        />
      </svg>
      <span className="absolute text-[13px] font-semibold tabular-nums text-white">
        {done}/{total}
      </span>
    </span>
  );
}

function EventBadge({ upcoming, label }: { upcoming: boolean; label: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-2.5 pr-3 text-xs font-semibold ${
        upcoming
          ? "bg-[#30d158]/15 text-[#30d158]"
          : "bg-white/10 text-white/55"
      }`}
    >
      {upcoming ? (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"
        />
      ) : null}
      {label}
    </span>
  );
}

function NavRow({
  href,
  Icon,
  label,
  trailing,
}: {
  href: string;
  Icon: typeof UsersGroupIcon;
  label: string;
  trailing?: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-white/[0.05] active:bg-white/[0.08]"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-white/80">
          <Icon aria-hidden className="h-[18px] w-[18px]" />
        </span>
        <span className="flex-1 text-[15px] text-white/90">{label}</span>
        {trailing ? (
          <span className="text-sm text-white/45">{trailing}</span>
        ) : null}
        <ChevronRightIcon
          aria-hidden
          className="h-4 w-4 shrink-0 text-white/25 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </Link>
    </li>
  );
}

/** Inicio: en FOURVENUES es el resumen del canal; en NATIVE, el resumen de siempre. */
export function OverviewView() {
  const { capabilities } = useOrg();
  return capabilities.channelHome ? <FourvenuesHomeView /> : <NativeOverviewView />;
}

function NativeOverviewView() {
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

  const base = `/${slug}`;
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

  const canCreate = can(ORG_PERMISSIONS.eventsCreate);
  const created = useMemo(
    () =>
      justCreated
        ? { tone: "success" as const, text: t("orgs.panel.created") }
        : null,
    [justCreated, t],
  );
  const doneCount = fields.length - missing.length;

  return (
    <div className="flex flex-col gap-7">
      <Flash message={created} />

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
        <p className={`p-6 text-center text-white/55 ${card}`}>
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
                Icon={UserRoundedIcon}
                tone="bg-sky-400/15 text-sky-300"
                label={t(
                  data.followersCount === 1
                    ? "orgs.panel.followerOne"
                    : "orgs.panel.followers",
                )}
                value={number.format(data.followersCount)}
              />
              <Stat
                Icon={CalendarDateIcon}
                tone="bg-[#30d158]/15 text-[#30d158]"
                label={t("orgs.panel.upcoming")}
                value={number.format(data.upcomingEvents)}
                href={`${base}/events`}
              />
              <Stat
                Icon={HistoryIcon}
                tone="bg-white/10 text-white/70"
                label={t("orgs.panel.past")}
                value={number.format(data.pastEvents)}
                href={`${base}/events`}
              />
            </>
          ) : (
            <StatsSkeleton count={3} />
          )}
        </section>
      )}

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[1fr_22rem]">
        <section className="flex flex-col gap-2">
          <h2 className="px-4 text-[13px] font-medium uppercase tracking-[0.04em] text-white/40">
            {t("orgs.ov.recent")}
          </h2>
          {!data ? (
            <ListSkeleton rows={3} avatar={false} />
          ) : data.recentEvents.length > 0 ? (
            <ul
              className={`divide-y divide-white/[0.07] overflow-hidden ${card}`}
            >
              {data.recentEvents.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`${base}/events/${e.id}`}
                    className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.05] active:bg-white/[0.08]"
                  >
                    <span
                      className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10 ${e.upcoming ? "" : "opacity-60 saturate-50"}`}
                    >
                      {e.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={e.coverImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[16px] font-semibold tracking-[-0.01em] text-white">
                        {e.name}
                      </span>
                      <span className="truncate text-[13px] text-white/50">
                        {day.format(new Date(e.date))}
                        {e.location ? ` · ${e.location}` : ""}
                      </span>
                    </span>
                    <EventBadge
                      upcoming={e.upcoming}
                      label={
                        e.upcoming
                          ? t("orgs.panel.badgeUpcoming")
                          : t("orgs.panel.badgePast")
                      }
                    />
                    <ChevronRightIcon
                      aria-hidden
                      className="hidden h-4 w-4 shrink-0 text-white/25 transition-transform duration-200 group-hover:translate-x-0.5 sm:block"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div
              className={`flex flex-col items-center px-6 py-14 text-center ${card}`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.08] text-white/70">
                <CalendarAddIcon aria-hidden className="h-6 w-6" />
              </span>
              <p className="font-display mt-4 text-xl font-semibold text-white">
                {t("orgs.panel.emptyEventsTitle")}
              </p>
              <p className="mt-2 max-w-sm text-sm text-white/50">
                {t("orgs.panel.emptyEventsText")}
              </p>
              {canCreate ? (
                <Link
                  href={`${base}/events/new`}
                  className="mt-6 inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-black transition-[opacity,transform] duration-100 hover:opacity-90 active:scale-[0.97]"
                >
                  {t("orgs.ev.create")}
                </Link>
              ) : null}
            </div>
          )}
        </section>

        <div className="flex flex-col gap-7">
          <section className={`p-5 ${card}`}>
            <div className="flex items-center gap-4">
              <Ring done={doneCount} total={fields.length} />
              <div className="min-w-0">
                <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-white">
                  {t("orgs.ov.profileStatus")}
                </h2>
                <p
                  className={`text-[13px] ${missing.length === 0 ? "text-[#30d158]" : "text-white/50"}`}
                >
                  {missing.length === 0
                    ? t("orgs.ov.complete")
                    : !canEdit
                      ? t("orgs.ov.readOnlyHint")
                      : `${doneCount}/${fields.length}`}
                </p>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-white/[0.07]">
              {fields.map((f) => (
                <li
                  key={f.key}
                  className="flex items-center gap-3 py-2.5 text-[15px]"
                >
                  {f.done ? (
                    <SealCheck className="h-5 w-5 shrink-0" />
                  ) : (
                    <span className="h-5 w-5 shrink-0 rounded-full border border-white/20" />
                  )}
                  <span className={f.done ? "text-white/90" : "text-white/55"}>
                    {t(`orgs.field.${f.key}`)}
                  </span>
                  {!f.done && canEdit ? (
                    <Link
                      href={`${base}/profile#${f.key}`}
                      className="ml-auto inline-flex h-8 items-center rounded-full bg-white/[0.1] px-3.5 text-[13px] font-medium text-white transition-[background-color,transform] duration-100 hover:bg-white/[0.18] active:scale-95"
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
          </section>

          <Group title={t("orgs.ov.quick")}>
            <NavRow
              href={`${base}/team`}
              Icon={UsersGroupIcon}
              label={t("orgs.ov.team")}
              trailing={
                !data
                  ? "…"
                  : data.membersCount === 1
                    ? t("orgs.ov.membersOne")
                    : t("orgs.ov.membersMany", { count: data.membersCount })
              }
            />
            <NavRow
              href={`${base}/profile`}
              Icon={PenIcon}
              label={t("orgs.ov.editProfile")}
            />
            <NavRow
              href={`${base}/settings`}
              Icon={SettingsIcon}
              label={t("orgs.ov.settings")}
            />
          </Group>
        </div>
      </div>
    </div>
  );
}
