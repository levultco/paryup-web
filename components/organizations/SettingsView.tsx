"use client";

import { PaymentsCard } from "@/components/organizations/PaymentsCard";
import { useState } from "react";
import { CheckCircleIcon } from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import {
  Card,
  PageHeader,
  RolePill,
  pillButton,
} from "@/components/organizations/ui";
import { intlLocale } from "@/lib/i18n";
import { ORG_PERMISSIONS } from "@/lib/organizations";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
      <dt className="text-sm text-white/55">{label}</dt>
      <dd className="text-sm text-white">{children}</dd>
    </div>
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
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* sin portapapeles disponible */
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("orgs.st.title")} subtitle={t("orgs.st.subtitle")} />

      <Card title={t("orgs.st.identity")}>
        <dl className="divide-y divide-white/10">
          <Row label={t("orgs.pf.name")}>{org.name}</Row>
          <Row label={t("orgs.st.username")}>
            <span className="flex flex-col items-end">
              <span>@{org.slug}</span>
              <span className="text-xs text-white/40">
                {t("orgs.st.usernameNote")}
              </span>
            </span>
          </Row>
          <Row label={t("orgs.st.created")}>
            {new Intl.DateTimeFormat(intlLocale(locale), {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(org.createdAt))}
          </Row>
          <Row label={t("orgs.st.status")}>
            <span className="flex flex-wrap justify-end gap-2">
              <RolePill>{t("orgs.st.active")}</RolePill>
              <RolePill>
                {org.isVerified
                  ? t("orgs.st.verified")
                  : t("orgs.st.notVerified")}
              </RolePill>
            </span>
          </Row>
          <Row label={t("orgs.st.yourRole")}>
            <RolePill>{t(`orgs.role.${role}`)}</RolePill>
          </Row>
          {showInternalId ? (
            <Row label={t("orgs.st.internalId")}>
              <span className="flex items-center gap-2">
                <code className="text-xs text-white/60">{org.id}</code>
                <button type="button" className={pillButton} onClick={copy}>
                  {copied ? t("orgs.st.copied") : t("orgs.st.copy")}
                </button>
              </span>
            </Row>
          ) : null}
        </dl>
        <p className="mt-4 text-xs text-white/40">
          {t("orgs.pf.verifiedNote")}
        </p>
      </Card>

      {can(ORG_PERMISSIONS.paymentsManage) ? <PaymentsCard /> : null}

      <Card title={t("orgs.st.permissions")}>
        <ul className="flex flex-col gap-3">
          {CAPABILITIES.map((c) => {
            const allowed = can(c.permission);
            return (
              <li
                key={c.key}
                className={`flex items-center gap-3 text-sm ${allowed ? "text-white" : "text-white/40"}`}
              >
                <CheckCircleIcon
                  className={`h-5 w-5 shrink-0 ${allowed ? "text-emerald-400" : "text-white/20"}`}
                />
                {t(`orgs.st.can.${c.key}`)}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
