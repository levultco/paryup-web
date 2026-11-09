"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftIcon } from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { CreateOrganizationPhotos } from "@/components/organizations/CreateOrganizationPhotos";
import {
  CreateOrganizationForm,
  type OrgDraft,
} from "@/components/organizations/CreateOrganizationForm";
import { mainSiteUrl } from "@/lib/site-urls";
import { useOrganizations } from "@/components/organizations/useOrganizations";
import { FormSkeleton } from "@/components/organizations/skeletons";

const pillClass =
  "inline-flex h-10 w-fit items-center gap-1.5 rounded-full bg-white/10 pl-3 pr-4 text-sm font-medium text-white ring-1 ring-white/10 transition-[background-color,transform] duration-100 hover:bg-white/15 active:scale-95";

function BackPill({ href, onClick }: { href?: string; onClick?: () => void }) {
  const { t } = useI18n();
  const content = (
    <>
      <ArrowLeftIcon className="h-4 w-4" />
      {t("orgs.form.back")}
    </>
  );
  return href ? (
    <Link href={href} className={pillClass}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={pillClass}>
      {content}
    </button>
  );
}

/** Solo accesible con permiso; el backend lo vuelve a comprobar al crear. */
export function NewOrganizationView() {
  const router = useRouter();
  const { t } = useI18n();
  const state = useOrganizations();
  const [draft, setDraft] = useState<OrgDraft | null>(null);
  const [step, setStep] = useState<"data" | "photos">("data");
  const denied = state.status === "ready" && !state.canCreateOrganization;

  useEffect(() => {
    if (state.status === "unauthenticated") {
      router.replace("/login?next=/new");
    } else if (denied) {
      window.location.replace(mainSiteUrl("/"));
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

  if (step === "photos" && draft) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <BackPill onClick={() => setStep("data")} />
        <CreateOrganizationPhotos
          slug={draft.slug}
          name={draft.name}
          onBack={() => setStep("data")}
        />
      </div>
    );
  }

  const limitReached = state.ownedOrganizations >= state.maxOrganizations;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8">
      <BackPill href="/?all=1" />
      {limitReached ? (
        <p className="rounded-3xl border border-white/10 bg-raised p-6 text-white/70">
          {t("orgs.limitReached", {
            owned: state.ownedOrganizations,
            max: state.maxOrganizations,
          })}
        </p>
      ) : (
        <CreateOrganizationForm
          initial={draft}
          onNext={(d) => {
            setDraft(d);
            setStep("photos");
          }}
        />
      )}
    </div>
  );
}
