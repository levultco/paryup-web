"use client";

import { SealCheck } from "@/components/profile/VerifiedBadge";
import { CheckIcon, CopyIcon, LockIcon } from "@/components/icons/solar";
import { useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { OrgAvatar, OrgName } from "@/components/organizations/OrgAvatar";
import { useOrg } from "@/components/organizations/OrgShell";
import { FourvenuesCard } from "@/components/organizations/FourvenuesCard";
import { PaymentsCard } from "@/components/organizations/PaymentsCard";
import { Group } from "@/components/organizations/promoters-ui";
import { PageHeader } from "@/components/organizations/ui";
import { intlLocale } from "@/lib/i18n";
import { ORG_PERMISSIONS } from "@/lib/organizations";
import { notify } from "@/lib/toast";

function Row({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3.5">
      <span className="flex flex-col">
        <span className="text-[15px] text-white/90">{label}</span>
        {note ? (
          <span className="mt-0.5 flex items-center gap-1 text-xs text-white/40">
            <LockIcon aria-hidden className="h-3 w-3" />
            {note}
          </span>
        ) : null}
      </span>
      <span className="min-w-0 text-[15px] text-white/60">{children}</span>
    </li>
  );
}

function Chip({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "green";
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-2.5 pr-3 text-xs font-semibold ${
        tone === "green"
          ? "bg-[#30d158]/15 text-[#30d158]"
          : "bg-white/10 text-white/70"
      }`}
    >
      {tone === "green" ? (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"
        />
      ) : null}
      {children}
    </span>
  );
}

const CAPABILITIES = [
  { key: "profileEdit", permission: ORG_PERMISSIONS.profileEdit },
  { key: "staffInvite", permission: ORG_PERMISSIONS.staffInvite },
  { key: "staffManage", permission: ORG_PERMISSIONS.staffManage },
  { key: "rolesManage", permission: ORG_PERMISSIONS.rolesManage },
] as const;

export function SettingsView() {
  const { t, locale } = useI18n();
  const { org, role, can } = useOrg();
  const [copied, setCopied] = useState(false);
  // Identificador interno solo para quien gestiona el equipo (soporte e integraciones futuras).
  const showInternalId = can(ORG_PERMISSIONS.rolesManage);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(org.id);
      setCopied(true);
      notify("success", t("orgs.st.copied"));
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* sin portapapeles disponible */
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <PageHeader title={t("orgs.st.title")} subtitle={t("orgs.st.subtitle")} />

      <section className="flex flex-col items-center gap-4 rounded-[22px] bg-raised px-6 py-8 text-center ring-1 ring-white/[0.08] sm:flex-row sm:text-left">
        <OrgAvatar org={org} size={72} />
        <div className="flex min-w-0 flex-col items-center gap-1 sm:items-start">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-white">
            <OrgName org={org} />
          </h2>
          <p className="text-sm text-white/50">@{org.slug}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Chip tone="green">{t("orgs.st.active")}</Chip>
            {!org.isVerified ? <Chip>{t("orgs.st.notVerified")}</Chip> : null}
            <Chip>{t(`orgs.role.${role}`)}</Chip>
          </div>
        </div>
      </section>

      <div>
        <Group title={t("orgs.st.identity")}>
          <Row label={t("orgs.pf.name")}>{org.name}</Row>
          <Row label={t("orgs.st.username")} note={t("orgs.st.usernameNote")}>
            @{org.slug}
          </Row>
          <Row label={t("orgs.st.created")}>
            {new Intl.DateTimeFormat(intlLocale(locale), {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(org.createdAt))}
          </Row>
          {showInternalId ? (
            <Row label={t("orgs.st.internalId")}>
              <span className="flex items-center gap-2">
                <code className="truncate font-mono text-xs text-white/50">
                  {org.id}
                </code>
                <button
                  type="button"
                  onClick={copy}
                  aria-label={t("orgs.st.copy")}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.1] text-white/80 transition-[background-color,transform] duration-100 hover:bg-white/[0.18] hover:text-white active:scale-90"
                >
                  {copied ? (
                    <CheckIcon aria-hidden className="h-4 w-4 text-[#30d158]" />
                  ) : (
                    <CopyIcon aria-hidden className="h-4 w-4" />
                  )}
                </button>
              </span>
            </Row>
          ) : null}
        </Group>
        <p className="mt-3 px-4 text-xs text-white/40">
          {t("orgs.pf.verifiedNote")}
        </p>
      </div>

      {can(ORG_PERMISSIONS.paymentsManage) ? <PaymentsCard /> : null}

      {can(ORG_PERMISSIONS.fourvenuesLinkManage) ? <FourvenuesCard /> : null}

      <Group title={t("orgs.st.permissions")}>
        {CAPABILITIES.map((c) => {
          const allowed = can(c.permission);
          return (
            <li key={c.key} className="flex items-center gap-3.5 px-4 py-3.5">
              {allowed ? (
                <SealCheck className="h-6 w-6 shrink-0" />
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/35">
                  <LockIcon aria-hidden className="h-3 w-3" />
                </span>
              )}
              <span
                className={`text-[15px] ${allowed ? "text-white/90" : "text-white/40"}`}
              >
                {t(`orgs.st.can.${c.key}`)}
              </span>
            </li>
          );
        })}
      </Group>
    </div>
  );
}
