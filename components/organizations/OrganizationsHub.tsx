"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ArrowRightIcon } from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { ShimmerButton } from "@/components/watermelon/shimmer-button";
import { OrgAvatar, OrgName } from "@/components/organizations/OrgAvatar";
import { PendingInvites } from "@/components/organizations/PendingInvites";
import { useOrganizations } from "@/components/organizations/useOrganizations";
import type { OrgRole } from "@/lib/organizations";

function HubSkeleton() {
  return (
    <div aria-hidden className="mx-auto flex w-full max-w-xl flex-col gap-3">
      <div className="h-8 w-64 animate-pulse rounded-full bg-white/10" />
      <div className="h-20 animate-pulse rounded-3xl bg-white/[0.07]" />
      <div className="h-20 animate-pulse rounded-3xl bg-white/[0.07]" />
    </div>
  );
}

/** Punto de entrada: decide entre bienvenida, panel directo o selector. */
export function OrganizationsHub() {
  const router = useRouter();
  const showAll = useSearchParams().get("all") === "1";
  const { t } = useI18n();
  const state = useOrganizations();

  const orgs = state.status === "ready" ? state.organizations : [];
  const canCreate = state.status === "ready" && state.canCreateOrganization;
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
      router.replace("/login?next=/organizations");
    } else if (single) {
      router.replace(`/organizations/${firstSlug}`);
    } else if (noAccess) {
      router.replace("/");
    }
  }, [state.status, single, noAccess, firstSlug, router]);

  if (state.status === "error") {
    return (
      <p className="px-6 py-40 text-center text-muted">{t("orgs.loadError")}</p>
    );
  }
  if (state.status !== "ready" || single || noAccess) return <HubSkeleton />;

  if (orgs.length === 0 && !canCreate) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center py-16">
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
        <Link href="/organizations/new" className="mt-10">
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
              href={`/organizations/${m.organization.slug}`}
              className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-raised p-4 transition-colors hover:border-white/30 hover:bg-white/[0.06]"
            >
              <OrgAvatar org={m.organization} />
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="font-display text-lg font-semibold text-white">
                  <OrgName org={m.organization} />
                </span>
                <span className="truncate text-sm text-white/45">
                  @{m.organization.slug} · {t(`orgs.role.${m.role as OrgRole}`)}
                </span>
              </span>
              <ArrowRightIcon className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
            </Link>
          </li>
        ))}
      </ul>
      {canCreate ? (
        <Link
          href="/organizations/new"
          className="mt-6 inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm text-white/80 transition-colors hover:border-white/50 hover:text-white"
        >
          {t("orgs.createAnother")}
        </Link>
      ) : null}
    </div>
  );
}
