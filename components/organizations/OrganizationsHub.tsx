"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ArrowRightIcon } from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { ShimmerButton } from "@/components/watermelon/shimmer-button";
import { OrgAvatar, OrgName } from "@/components/organizations/OrgAvatar";
import { PendingInvites } from "@/components/organizations/PendingInvites";
import { mainSiteUrl } from "@/lib/site-urls";
import { useOrganizations } from "@/components/organizations/useOrganizations";
import type { OrgRole } from "@/lib/organizations";
import { HubSkeletonView } from "@/components/organizations/skeletons";

/** Punto de entrada: decide entre bienvenida, panel directo o selector. */
export function OrganizationsHub() {
  const router = useRouter();
  const showAll = useSearchParams().get("all") === "1";
  const { t } = useI18n();
  const state = useOrganizations();

  const orgs = state.status === "ready" ? state.organizations : [];
  const canCreate = state.status === "ready" && state.canCreateOrganization;
  const limitReached =
    state.status === "ready" &&
    state.canCreateOrganization &&
    state.ownedOrganizations >= state.maxOrganizations;
  const invites = state.status === "ready" ? state.pendingInvites : [];
  const single =
    state.status === "ready" &&
    orgs.length === 1 &&
    !showAll &&
    invites.length === 0;
  const firstSlug = orgs[0]?.organization.slug;
  const noAccess =
    state.status === "ready" &&
    orgs.length === 0 &&
    !canCreate &&
    invites.length === 0;

  useEffect(() => {
    if (state.status === "unauthenticated") {
      router.replace("/login?next=/");
    } else if (single) {
      router.replace(`/${firstSlug}`);
    } else if (noAccess) {
      // Backstage es solo para quien tiene organización o permiso (se concede desde base de datos).
      window.location.replace(mainSiteUrl("/"));
    }
  }, [state.status, single, noAccess, firstSlug, router]);

  if (state.status === "error") {
    return (
      <p className="px-6 py-40 text-center text-muted">{t("orgs.loadError")}</p>
    );
  }
  if (state.status !== "ready" || single || noAccess)
    return <HubSkeletonView />;

  if (orgs.length === 0 && !canCreate) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-16">
        <PendingInvites invites={invites} />
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
        <PendingInvites invites={invites} />
        <h1 className="font-display text-5xl font-semibold leading-[1.05] text-white sm:text-6xl">
          {t("orgs.welcomeLead")}
          <span className="text-white/45">{t("orgs.welcomeAccent")}</span>
        </h1>
        <p className="mt-5 max-w-md text-lg text-white/55">
          {t("orgs.welcomeText")}
        </p>
        <Link href="/new" className="mt-10">
          <ShimmerButton type="button">
            {t("orgs.welcomeCta")}
            <ArrowRightIcon className="h-4 w-4" />
          </ShimmerButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <PendingInvites invites={invites} />
      <h1 className="font-display text-3xl font-semibold text-white">
        {t("orgs.pickTitle")}
      </h1>
      <p className="mt-2 text-white/55">{t("orgs.pickSubtitle")}</p>
      <ul className="mt-8 flex flex-col gap-3">
        {orgs.map((m) => (
          <li key={m.organizationId}>
            <Link
              href={`/${m.organization.slug}`}
              className="group flex items-center gap-5 rounded-[32px] bg-raised p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition-[background-color,transform] duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--bg-raised),white_5%)] active:scale-[0.985] active:bg-[color-mix(in_srgb,var(--bg-raised),white_8%)]"
            >
              <OrgAvatar org={m.organization} size={64} />
              <span className="flex min-w-0 flex-1 flex-col gap-1.5 leading-tight">
                <span className="font-display text-xl font-semibold text-white">
                  <OrgName org={m.organization} />
                </span>
                <span className="flex min-w-0 items-center gap-2 text-sm">
                  <span className="truncate text-white/45">
                    @{m.organization.slug}
                  </span>
                  <span className="shrink-0 rounded-full bg-white/[0.08] px-2.5 py-0.5 text-xs font-medium text-white/70">
                    {t(`orgs.role.${m.role as OrgRole}`)}
                  </span>
                </span>
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-white/45 transition-[transform,background-color,color] duration-200 group-hover:translate-x-0.5 group-hover:bg-white/[0.14] group-hover:text-white">
                <ArrowRightIcon className="h-[18px] w-[18px]" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {limitReached && state.status === "ready" ? (
        <p className="mt-6 text-sm text-white/55">
          {t("orgs.limitReached", {
            owned: state.ownedOrganizations,
            max: state.maxOrganizations,
          })}
        </p>
      ) : canCreate ? (
        <Link
          href="/new"
          className="mt-6 inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm text-white/80 transition-colors hover:border-white/50 hover:text-white"
        >
          {t("orgs.createAnother")}
        </Link>
      ) : null}
    </div>
  );
}
