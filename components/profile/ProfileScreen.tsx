"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRightIcon,
  ArrowRightUpIcon,
  GlobalIcon,
  TicketIcon,
} from "@/components/icons/solar";
import {
  InstagramLogo,
  SnapchatLogo,
  SoundCloudLogo,
  SpotifyLogo,
  TikTokLogo,
  XLogo,
} from "@/components/icons/brands";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import {
  resolveBadge,
  socialLinksOf,
  type SocialPlatformId,
} from "@/lib/social";
import { ContinuousTabs } from "@/components/watermelon/continuous-tabs";
import {
  DEFAULT_AVATAR_ACCENT,
  FALLBACK_BANNER_COLOR,
} from "@/lib/avatar-accent";
import { DISCOVERY_TZ } from "@/lib/discovery";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { intlLocale, type Locale } from "@/lib/i18n";
import { timeLabel } from "@/lib/format";

export type ProfileUser = {
  id: string;
  name: string;
  nickname: string | null;
  bio: string | null;
  image: string | null;
  avatarTabUrl: string | null;
  banner: string | null;
  isVerified?: boolean;
  isPro?: boolean;
  globalRole?: string | null;
  proExpiresAt?: string | null;
  followersCount?: number;
  followingCount?: number;
  socialLinks?: Record<string, string> | null;
};

export type AttendedEvent = {
  id: string;
  name: string;
  date: string;
  location: string | null;
  coverImage: string | null;
};

const dateFormat = (locale: Locale) =>
  new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: DISCOVERY_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const compact = (locale: Locale) =>
  new Intl.NumberFormat(intlLocale(locale), { notation: "compact" });

const SOCIAL_ICONS: Record<SocialPlatformId, typeof GlobalIcon> = {
  website: GlobalIcon,
  tiktok: TikTokLogo,
  snapchat: SnapchatLogo,
  instagram: InstagramLogo,
  twitter: XLogo,
  spotify: SpotifyLogo,
  soundcloud: SoundCloudLogo,
};

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <p className="font-display text-2xl font-semibold">{title}</p>
      <p className="mt-2 max-w-sm text-white/55">{subtitle}</p>
    </div>
  );
}

/** Perfil propio con el mismo orden que la app: banner, identidad, bio, entradas y pestañas. */
// Banner por defecto de las cuentas VIP sin banner propio (igual que la app).
const VIP_FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80";

const cleanUrl = (value?: string | null) => {
  const text = value?.trim();
  if (
    !text ||
    text.toLowerCase() === "null" ||
    text.toLowerCase() === "undefined"
  ) {
    return null;
  }
  return /^https?:\/\//i.test(text) ? text : null;
};

export function ProfileScreen({
  user,
  events,
  accent = null,
}: {
  user: ProfileUser;
  events: AttendedEvent[];
  /** Color del avatar (hex) para el banner automático; viene calculado del servidor */
  accent?: string | null;
}) {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState("attended");
  const avatar = cleanUrl(user.image) ?? cleanUrl(user.avatarTabUrl);
  const isVip = (user.globalRole ?? "").toUpperCase().includes("VIP");
  const banner = cleanUrl(user.banner) ?? (isVip ? VIP_FALLBACK_BANNER : null);
  // Sin banner: degradado con el color del avatar y el avatar desenfocado encima,
  // como en la app. Sin avatar se usa el acento por defecto.
  const bannerAccent = accent ?? (avatar ? null : DEFAULT_AVATAR_ACCENT);
  const links = socialLinksOf(user.socialLinks);
  const badge = resolveBadge(user);
  const followers = user.followersCount ?? 0;
  const following = user.followingCount ?? 0;

  return (
    <div>
      {/* Banner: la imagen del usuario o, si no hay, su avatar desenfocado */}
      <div className="relative h-[300px] w-full overflow-hidden bg-[#303038] sm:h-[360px]">
        {banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="relative h-full w-full overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(138deg, ${bannerAccent ?? FALLBACK_BANNER_COLOR}, ${
                bannerAccent ? `${bannerAccent}99` : FALLBACK_BANNER_COLOR
              })`,
            }}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt=""
                className="absolute inset-0 h-full w-full scale-[1.6] object-cover opacity-50 blur-[60px]"
              />
            ) : null}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[12%] via-black/35 via-[58%] to-black" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-[clamp(1.25rem,3vw,2rem)]">
        <div className="-mt-14 flex items-center gap-5">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-black bg-[#151515]">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF3D71] via-[#7C3AED] to-[#00D1FF]">
                <span className="font-display text-4xl font-bold text-white">
                  {user.name.trim().charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display truncate text-2xl font-extrabold sm:text-3xl">
                {user.name}
              </h1>
              {badge ? <VerifiedBadge type={badge} /> : null}
            </div>
            {user.nickname ? (
              <p className="mt-0.5 text-[15px] font-semibold text-[#A5ADB8]">
                @{user.nickname}
              </p>
            ) : null}
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm text-white/55">
              <span>
                <strong className="font-bold text-white">
                  {compact(locale).format(followers)}
                </strong>{" "}
                {followers === 1
                  ? t("profile.follower")
                  : t("profile.followers")}
              </span>
              <span aria-hidden className="h-3 w-px bg-white/20" />
              <span>
                <strong className="font-bold text-white">
                  {compact(locale).format(following)}
                </strong>{" "}
                {t("profile.following")}
              </span>
            </p>
          </div>
        </div>

        {user.bio ? (
          <p className="mt-5 whitespace-pre-line text-[15px] leading-[22px] text-[#D5DAE1]">
            {user.bio}
          </p>
        ) : null}

        <Link
          href="/tickets"
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#F2F2F2] text-base text-black transition hover:bg-white"
        >
          <TicketIcon className="h-6 w-6" />
          {t("profile.myTickets")}
          <ArrowRightIcon className="h-[18px] w-[18px]" />
        </Link>

        <div className="mt-8">
          <ContinuousTabs
            value={tab}
            onChange={setTab}
            tabs={[
              {
                id: "attended",
                label: `${t("profile.attended")} ${events.length}`,
              },
              { id: "links", label: `${t("profile.links")} ${links.length}` },
            ]}
          />
        </div>

        <div className="pb-28 pt-6">
          {tab === "attended" ? (
            events.length === 0 ? (
              <EmptyState
                title={t("profile.emptyAttendedTitle")}
                subtitle={t("profile.emptyAttendedText")}
              />
            ) : (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
                {events.map((event) => (
                  <li key={event.id}>
                    <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#0e0e0e]">
                      {event.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.coverImage}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="font-display text-5xl font-semibold text-white/25">
                            {event.name.trim().charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="font-display mt-3 line-clamp-2 text-base font-semibold leading-snug">
                      {event.name}
                    </p>
                    <p className="mt-1 truncate text-sm text-white/55">
                      {[
                        dateFormat(locale).format(new Date(event.date)),
                        timeLabel(event.date),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {event.location ? (
                      <p className="truncate text-xs text-white/40">
                        {event.location}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )
          ) : links.length === 0 ? (
            <EmptyState
              title={t("profile.emptyLinksTitle")}
              subtitle={t("profile.emptyLinksText")}
            />
          ) : (
            <ul className="grid grid-cols-2 gap-2">
              {links.map((link, index) => {
                const Icon = SOCIAL_ICONS[link.id];
                const lastOdd =
                  links.length % 2 === 1 && index === links.length - 1;
                return (
                  <li key={link.id} className={lastOdd ? "col-span-2" : ""}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: link.color,
                        color: link.textColor,
                      }}
                      className="flex h-[60px] items-center justify-between gap-2.5 rounded-2xl px-4 ring-1 ring-inset ring-white/10 transition hover:brightness-110 active:scale-[0.99]"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon className="h-6 w-6 shrink-0" />
                        <span className="truncate text-base font-bold">
                          {link.name}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] bg-white/20"
                      >
                        <ArrowRightUpIcon className="h-4 w-4" />
                      </span>
                      <span className="sr-only">{t("profile.newTab")}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
