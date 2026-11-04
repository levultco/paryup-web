"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeftIcon } from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { CreateOrganizationForm } from "@/components/organizations/CreateOrganizationForm";
import { useOrganizations } from "@/components/organizations/useOrganizations";
import { FormSkeleton } from "@/components/organizations/skeletons";

/** Solo accesible con permiso; el backend lo vuelve a comprobar al crear. */
export function NewOrganizationView() {
  const router = useRouter();
  const { t } = useI18n();
  const state = useOrganizations();
  const denied = state.status === "ready" && !state.canCreateOrganization;

  useEffect(() => {
    if (state.status === "unauthenticated") {
      router.replace("/login?next=/new");
    } else if (denied) {
      router.replace("/");
    }
  }, [state.status, denied, router]);

  if (state.status === "error") {
    return (
      <p className="px-6 py-40 text-center text-muted">{t("orgs.loadError")}</p>
    );
  }
  if (state.status !== "ready" || denied) {
    return (
      <div className="mx-auto max-w-md">
        <FormSkeleton sections={1} />
      </div>
    );
  }

  const limitReached = state.ownedOrganizations >= state.maxOrganizations;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8">
      <Link
        href="/?all=1"
        className="inline-flex w-fit items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t("orgs.form.back")}
      </Link>
      {limitReached ? (
        <p className="rounded-3xl border border-white/10 bg-raised p-6 text-white/70">
          {t("orgs.limitReached", {
            owned: state.ownedOrganizations,
            max: state.maxOrganizations,
          })}
        </p>
      ) : (
        <CreateOrganizationForm />
      )}
    </div>
  );
}
