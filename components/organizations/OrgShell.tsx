"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  CalendarDays,
  Layers,
  LayoutDashboard,
  Pencil,
  Settings,
  Users,
} from "lucide-react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { OrgAvatar, OrgName } from "@/components/organizations/OrgAvatar";
import { useOrganizations } from "@/components/organizations/useOrganizations";
import type {
  OrganizationContext,
  OrganizationProfile,
} from "@/lib/organizations";

type OrgValue = {
  slug: string;
  org: OrganizationProfile;
  role: OrganizationContext["role"];
  can: (permission: string) => boolean;
  /** Aplica en local los campos guardados para que todas las secciones los vean. */
  patchOrg: (patch: Partial<OrganizationProfile>) => void;
};

const OrgContext = createContext<OrgValue | null>(null);

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgShell");
  return ctx;
}

const NAV = [
  { key: "overview", segment: "", Icon: LayoutDashboard },
  { key: "events", segment: "/events", Icon: CalendarDays },
  { key: "catalog", segment: "/catalog", Icon: Layers },
  { key: "profile", segment: "/profile", Icon: Pencil },
  { key: "team", segment: "/team", Icon: Users },
  { key: "settings", segment: "/settings", Icon: Settings },
] as const;

function ShellSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-6 lg:flex-row lg:gap-10">
      <div className="h-40 animate-pulse rounded-3xl bg-white/[0.07] lg:w-64" />
      <div className="flex flex-1 flex-col gap-4">
        <div className="h-10 w-56 animate-pulse rounded-full bg-white/10" />
        <div className="h-32 animate-pulse rounded-3xl bg-white/[0.07]" />
        <div className="h-64 animate-pulse rounded-3xl bg-white/[0.07]" />
      </div>
    </div>
  );
}

export function OrgShell({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();
  const { t } = useI18n();
  const access = useOrganizations();
  const [ctx, setCtx] = useState<OrganizationContext | null>(null);
  const [state, setState] = useState<"loading" | "notFound" | "error">(
    "loading",
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCtx(null);
      router.replace("/login");
      return;
    }
    if (status !== "authenticated") return;

    let active = true;
    fetch(`/api/organizations/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!active) return;
        if (res.status === 401) router.replace("/login");
        else if (res.status === 404) router.replace("/");
        else if (!res.ok) setState("error");
        else setCtx(await res.json());
      })
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, [status, slug, router]);

  const patchOrg = useCallback((patch: Partial<OrganizationProfile>) => {
    setCtx((c) =>
      c ? { ...c, organization: { ...c.organization, ...patch } } : c,
    );
  }, []);

  const value = useMemo<OrgValue | null>(
    () =>
      ctx
        ? {
            slug,
            org: ctx.organization,
            role: ctx.role,
            can: (p) =>
              ctx.permissions.includes(p) ||
              ctx.permissions.includes("admin:super"),
            patchOrg,
          }
        : null,
    [ctx, slug, patchOrg],
  );

  if (!value) {
    if (state === "loading") return <ShellSkeleton />;
    return (
      <div className="px-6 py-32 text-center">
        <p className="text-muted">
          {state === "notFound"
            ? t("orgs.panel.notFound")
            : t("orgs.loadError")}
        </p>
        <Link
          href="/organizations?all=1"
          className="mt-6 inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm text-white/80 hover:border-white/50"
        >
          {t("orgs.title")}
        </Link>
      </div>
    );
  }

  const base = `/organizations/${slug}`;
  const canSwitch =
    access.status === "ready" &&
    (access.organizations.length > 1 || access.canCreateOrganization);

  return (
    <OrgContext value={value}>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <aside className="lg:sticky lg:top-32 lg:w-64 lg:shrink-0 lg:self-start">
          <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-raised p-3">
            <OrgAvatar org={value.org} size={44} />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="font-display truncate text-[15px] font-semibold text-white">
                <OrgName org={value.org} />
              </span>
              <span className="truncate text-xs text-white/45">
                @{value.org.slug}
              </span>
            </span>
          </div>
          <nav
            aria-label={t("orgs.title")}
            className="-mx-1 mt-3 flex gap-1 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible"
          >
            {NAV.map(({ key, segment, Icon }) => {
              const href = `${base}${segment}`;
              const active =
                segment === "" ? pathname === base : pathname.startsWith(href);
              return (
                <Link
                  key={key}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-white text-black"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {t(`orgs.nav.${key}`)}
                </Link>
              );
            })}
          </nav>
          {canSwitch ? (
            <Link
              href="/organizations?all=1"
              className="mt-3 inline-flex h-10 items-center rounded-full border border-white/15 px-4 text-sm text-white/70 transition-colors hover:border-white/50 hover:text-white"
            >
              {t("orgs.panel.switch")}
            </Link>
          ) : null}
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </OrgContext>
  );
}
