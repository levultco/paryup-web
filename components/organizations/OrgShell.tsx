"use client";

import { ArrowLeftRight } from "lucide-react";
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
  CalendarIcon,
  LayersIcon,
  PenIcon,
  SettingsIcon,
  SpeakerIcon,
  UsersGroupIcon,
  WidgetIcon,
} from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { OrgAvatar, OrgName } from "@/components/organizations/OrgAvatar";
import { useOrganizations } from "@/components/organizations/useOrganizations";
import {
  hasOrgAccess,
  type OrgCapabilities,
  type OrganizationContext,
  type OrganizationProfile,
} from "@/lib/organizations";
import { ShellSkeletonView } from "@/components/organizations/skeletons";

type OrgValue = {
  slug: string;
  org: OrganizationProfile;
  role: OrganizationContext["role"];
  commercialMode: OrganizationContext["commercialMode"];
  capabilities: OrgCapabilities;
  /** Permiso del rol ∩ capacidad de la modalidad (NATIVE / FOURVENUES). */
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

const NAV: readonly {
  key: string;
  segment: string;
  Icon: typeof UsersGroupIcon;
  permission?: string;
  /** Sección solo con esta capacidad (catálogo nativo no existe en FOURVENUES). */
  capability?: keyof OrgCapabilities;
}[] = [
  { key: "overview", segment: "", Icon: WidgetIcon },
  { key: "events", segment: "/events", Icon: CalendarIcon },
  {
    key: "catalog",
    segment: "/catalog",
    Icon: LayersIcon,
    capability: "nativeTicketing",
  },
  { key: "profile", segment: "/profile", Icon: PenIcon },
  { key: "team", segment: "/team", Icon: UsersGroupIcon },
  {
    key: "promoters",
    segment: "/promoters",
    Icon: SpeakerIcon,
    permission: "promoters:manage",
  },
  { key: "settings", segment: "/settings", Icon: SettingsIcon },
];

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

  // Aviso del plan Backstage: prueba en curso o modo limitado por impago.
  const planNotice = (() => {
    if (access.status !== "ready") return null;
    const m = access.organizations.find((o) => o.organization.slug === slug);
    if (m?.role !== "OWNER" && m?.role !== "MANAGER") return null;
    if (m?.backstagePlanStatus === "LIMITED") {
      return (
        <div className="mb-6 rounded-[20px] bg-[#3a1c1c] px-5 py-4 text-sm text-red-100">
          <p className="font-medium">Tu plan está en modo limitado</p>
          <p className="mt-1 text-red-100/70">
            No se pudo cobrar la suscripción. No puedes crear eventos nuevos ni
            usar promotores, pero tus datos y lo ya vendido siguen intactos.
            Actualiza tu método de pago para recuperar todo.
          </p>
        </div>
      );
    }
    if (m?.backstagePlanStatus === "TRIAL" && m.backstageTrialEndsAt) {
      const days = Math.max(
        0,
        Math.ceil(
          (new Date(m.backstageTrialEndsAt).getTime() - Date.now()) / 86_400_000,
        ),
      );
      // Durante la prueba el detalle vive en Ajustes; aquí solo avisa al propietario al final.
      if (m.role !== "OWNER" || days > 7) return null;
      return (
        <div className="mb-6 rounded-[20px] bg-white/[0.06] px-5 py-3 text-sm text-white/70">
          Prueba de Backstage: te {days === 1 ? "queda 1 día" : `quedan ${days} días`}.
          Revisa tu suscripción en{" "}
          <Link href={`/${slug}/settings`} className="underline underline-offset-2 hover:text-white">
            Ajustes
          </Link>
          .
        </div>
      );
    }
    return null;
  })();

  const value = useMemo<OrgValue | null>(
    () =>
      ctx
        ? {
            slug,
            org: ctx.organization,
            role: ctx.role,
            commercialMode: ctx.commercialMode,
            capabilities: ctx.capabilities,
            can: (p) => hasOrgAccess(ctx.permissions, ctx.capabilities, p),
            patchOrg,
          }
        : null,
    [ctx, slug, patchOrg],
  );

  if (!value) {
    if (state === "loading") return <ShellSkeletonView />;
    return (
      <div className="px-6 py-32 text-center">
        <p className="text-muted">
          {state === "notFound"
            ? t("orgs.panel.notFound")
            : t("orgs.loadError")}
        </p>
        <Link
          href="/?all=1"
          className="mt-6 inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm text-white/80 hover:border-white/50"
        >
          {t("orgs.title")}
        </Link>
      </div>
    );
  }

  const base = `/${slug}`;
  const canSwitch =
    access.status === "ready" &&
    (access.organizations.length > 1 || access.canCreateOrganization);

  return (
    <OrgContext value={value}>
      <div className="org-panel flex flex-col gap-6 lg:flex-row lg:gap-12">
        <aside className="lg:sticky lg:top-32 lg:w-64 lg:shrink-0 lg:self-start">
          <div className="flex items-center gap-3 rounded-[28px] bg-raised p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
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
            {NAV.filter(
              (n) =>
                (!n.permission || value.can(n.permission)) &&
                (!n.capability || value.capabilities[n.capability]),
            ).map(
              ({ key, segment, Icon }) => {
                const href = `${base}${segment}`;
                const active =
                  segment === ""
                    ? pathname === base
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={key}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex shrink-0 items-center gap-3 rounded-full px-4 py-3 text-sm transition-colors ${
                      active
                        ? "bg-[#f4efe6] font-medium text-[#1b1916]"
                        : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {t(
                      key === "overview" && value.capabilities.channelHome
                        ? "orgs.nav.home"
                        : `orgs.nav.${key}`,
                    )}
                  </Link>
                );
              },
            )}
          </nav>
          {canSwitch ? (
            <Link
              href="/?all=1"
              className="switch-org group mt-3 inline-flex h-11 items-center gap-2.5 rounded-full px-5 text-sm font-medium text-white/75 transition-[color,transform] duration-200 hover:text-white active:scale-[0.97]"
            >
              <ArrowLeftRight
                aria-hidden
                className="h-4 w-4 text-white/50 transition-[transform,color] duration-300 group-hover:rotate-180 group-hover:text-white"
              />
              {t("orgs.panel.switch")}
            </Link>
          ) : null}
        </aside>
        <div className="min-w-0 flex-1">
          {planNotice}
          {children}
        </div>
      </div>
    </OrgContext>
  );
}
