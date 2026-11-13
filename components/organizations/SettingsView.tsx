"use client";

import { SealCheck } from "@/components/profile/VerifiedBadge";
import { CheckIcon, CopyIcon, LockIcon } from "@/components/icons/solar";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { OrgAvatar, OrgName } from "@/components/organizations/OrgAvatar";
import { useOrg } from "@/components/organizations/OrgShell";
import { useOrganizations } from "@/components/organizations/useOrganizations";
import { FourvenuesCard } from "@/components/organizations/FourvenuesCard";
import { PaymentsCard } from "@/components/organizations/PaymentsCard";
import { Group } from "@/components/organizations/promoters-ui";
import { PageHeader, pillButton } from "@/components/organizations/ui";
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

type SectionId = "identity" | "subscription" | "payments" | "integrations" | "roles";

const SECTION_LABEL: Record<SectionId, string> = {
  identity: "Identidad",
  subscription: "Suscripción",
  payments: "Pagos",
  integrations: "Integraciones",
  roles: "Roles y permisos",
};

const CAPABILITIES = [
  { key: "profileEdit", permission: ORG_PERMISSIONS.profileEdit },
  { key: "staffInvite", permission: ORG_PERMISSIONS.staffInvite },
  { key: "staffManage", permission: ORG_PERMISSIONS.staffManage },
  { key: "rolesManage", permission: ORG_PERMISSIONS.rolesManage },
] as const;

/** Datos del plan Backstage de esta organización (solo los ve OWNER/MANAGER). */
function useBackstagePlan() {
  const { slug } = useOrg();
  const access = useOrganizations();
  if (access.status !== "ready") return null;
  const m = access.organizations.find((o) => o.organization.slug === slug);
  if (!m || (m.role !== "OWNER" && m.role !== "MANAGER")) return null;
  return m;
}

const PLAN_LABEL = {
  NONE: "Sin plan",
  TRIAL: "Periodo de prueba",
  ACTIVE: "Activo",
  LIMITED: "Limitado por impago",
} as const;

type Billing = {
  hasSubscription: boolean;
  canManage: boolean;
  price: { amount: number; currency: string; interval: string; taxIncluded: boolean } | null;
  nextBillingAt: string | null;
  hasPaymentMethod: boolean;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
};

function SubscriptionSection() {
  const { locale } = useI18n();
  const { slug } = useOrg();
  const m = useBackstagePlan();
  const [now] = useState(() => Date.now());
  const [billing, setBilling] = useState<Billing | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const url = `/api/organizations/${encodeURIComponent(slug)}/billing`;

  useEffect(() => {
    let active = true;
    fetch(url)
      .then((r) => (r.ok ? (r.json() as Promise<Billing>) : null))
      .catch(() => null)
      .then((data) => {
        if (active) setBilling(data);
      });
    return () => {
      active = false;
    };
  }, [url]);

  if (!m) return null;
  const status = m.backstagePlanStatus ?? "NONE";
  const fmtDate = (iso: string | Date) =>
    new Date(iso).toLocaleDateString(intlLocale(locale), {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const ends = m.backstageTrialEndsAt ? new Date(m.backstageTrialEndsAt) : null;
  const days = ends ? Math.max(0, Math.ceil((ends.getTime() - now) / 86_400_000)) : null;
  const price = billing?.price
    ? `${new Intl.NumberFormat(intlLocale(locale), {
        style: "currency",
        currency: billing.price.currency.toUpperCase(),
      }).format(billing.price.amount / 100)} / ${billing.price.interval === "year" ? "año" : "mes"}${
        billing.price.taxIncluded ? "" : " + IVA"
      }`
    : null;

  const manage = async () => {
    setBusy(true);
    setError(false);
    const res = await fetch(url, { method: "POST" }).catch(() => null);
    const data = res?.ok ? await res.json().catch(() => null) : null;
    setBusy(false);
    if (data?.url) window.location.assign(data.url);
    else setError(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <Group title="Suscripción">
        <Row label="Plan Backstage">
          <span className="text-sm text-white/70">{PLAN_LABEL[status]}</span>
        </Row>
        {price ? (
          <Row label="Precio">
            <span className="text-sm text-white/70">{price}</span>
          </Row>
        ) : null}
        {status === "TRIAL" && ends && days !== null ? (
          <>
            <Row label="Días de prueba restantes">
              <span className="text-sm text-white/70">{days}</span>
            </Row>
            <Row label="Fin de la prueba">
              <span className="text-sm text-white/70">{fmtDate(ends)}</span>
            </Row>
          </>
        ) : null}
        {billing?.nextBillingAt ? (
          <Row
            label={status === "TRIAL" ? "Primer cobro" : "Próximo cobro"}
            note={
              billing.autoRenew
                ? "Se cobrará automáticamente con tu método de pago."
                : undefined
            }
          >
            <span className="text-sm text-white/70">{fmtDate(billing.nextBillingAt)}</span>
          </Row>
        ) : null}
        {billing?.hasSubscription && !billing.hasPaymentMethod ? (
          <li className="px-4 py-3.5 text-[13px] text-[#ffd60a]">
            No hay un método de pago configurado: la suscripción no se renovará
            sola.
          </li>
        ) : null}
        {billing?.cancelAtPeriodEnd ? (
          <li className="px-4 py-3.5 text-[13px] text-white/50">
            La suscripción está cancelada y no se renovará.
          </li>
        ) : null}
        {status === "LIMITED" ? (
          <li className="px-4 py-3.5 text-[13px] text-white/50">
            No se pudo cobrar la suscripción: no puedes crear eventos nuevos ni
            usar promotores hasta actualizar el método de pago.
          </li>
        ) : null}
        {billing?.canManage ? (
          <li className="flex flex-wrap items-center gap-3 px-4 py-4">
            <button type="button" className={pillButton} disabled={busy} onClick={manage}>
              Gestionar suscripción
            </button>
            <span className="text-xs text-white/40">
              Método de pago, facturas y cancelación en Stripe.
            </span>
            {error ? (
              <span className="w-full text-sm text-red-400">
                No se pudo abrir la gestión de la suscripción.
              </span>
            ) : null}
          </li>
        ) : null}
      </Group>
    </div>
  );
}

function RolesSection() {
  const { t } = useI18n();
  const { role, can } = useOrg();
  return (
    <div className="flex flex-col gap-3">
      <Group title="Roles y permisos">
        <Row label="Tu rol">
          <Chip>{t(`orgs.role.${role}`)}</Chip>
        </Row>
        <li>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-[15px] text-white/90 [&::-webkit-details-marker]:hidden">
              Ver mis permisos
              <span
                aria-hidden
                className="text-white/40 transition-transform duration-150 group-open:rotate-90"
              >
                ›
              </span>
            </summary>
            <ul className="divide-y divide-white/[0.07] border-t border-white/[0.07]">
              {CAPABILITIES.map((c) => {
                const allowed = can(c.permission);
                return (
                  <li key={c.key} className="flex items-center gap-3.5 px-4 py-3">
                    {allowed ? (
                      <SealCheck className="h-5 w-5 shrink-0" />
                    ) : (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/35">
                        <LockIcon aria-hidden className="h-3 w-3" />
                      </span>
                    )}
                    <span
                      className={`text-[14px] ${allowed ? "text-white/90" : "text-white/40"}`}
                    >
                      {t(`orgs.st.can.${c.key}`)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </details>
        </li>
      </Group>
    </div>
  );
}

export function SettingsView() {
  const { t, locale } = useI18n();
  const { org, role, can, slug, capabilities } = useOrg();
  const access = useOrganizations();
  const membership =
    access.status === "ready"
      ? access.organizations.find((o) => o.organization.slug === slug)
      : undefined;
  // Stripe Connect lo decide el backend (capability): una org Fourvenues no lo tiene y no se muestra.
  const pendingFourvenues = membership?.fourvenuesLinkStatus === "PENDING_REVIEW";
  const sections: SectionId[] = [
    "identity",
    ...(membership?.role === "OWNER" || membership?.role === "MANAGER"
      ? (["subscription"] as const)
      : []),
    ...(can(ORG_PERMISSIONS.paymentsManage) && capabilities.stripeConnect
      ? (["payments"] as const)
      : []),
    ...(can(ORG_PERMISSIONS.fourvenuesLinkManage) ? (["integrations"] as const) : []),
    "roles",
  ];
  const [selected, setSelected] = useState<SectionId>("identity");
  const section = sections.includes(selected) ? selected : "identity";
  const setSection = setSelected;
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

      <section className="flex flex-col items-center gap-4 rounded-[28px] bg-raised px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] sm:flex-row sm:text-left">
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

      <div role="tablist" aria-label="Secciones de ajustes" className="flex flex-wrap gap-2">
        {sections.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={section === id}
            onClick={() => setSection(id)}
            className={`h-10 rounded-full px-4 text-sm font-medium transition-[background-color,color,transform] duration-100 active:scale-[0.97] ${
              section === id
                ? "bg-[#f4efe6] text-[#1b1916]"
                : "bg-white/[0.07] text-white/70 hover:bg-white/[0.13] hover:text-white"
            }`}
          >
            {SECTION_LABEL[id]}
          </button>
        ))}
      </div>

      {section === "identity" ? (
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
      ) : null}

      {section === "subscription" ? <SubscriptionSection /> : null}

      {section === "payments" ? (
        <>
          {pendingFourvenues ? (
            <p className="rounded-[20px] bg-white/[0.06] px-5 py-3 text-sm text-white/60">
              Tienes una solicitud de Fourvenues pendiente. Los pagos de Stripe
              solo se usan para las ventas nativas de ParyUp; no hacen falta
              para las ventas gestionadas por Fourvenues.
            </p>
          ) : null}
          <PaymentsCard />
        </>
      ) : null}

      {section === "integrations" ? <FourvenuesCard /> : null}

      {section === "roles" ? <RolesSection /> : null}
    </div>
  );
}
