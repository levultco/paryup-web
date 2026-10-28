"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { OrgAvatar } from "@/components/organizations/OrgAvatar";
import {
  Notice,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import type { PendingInvite } from "@/lib/organizations";

/** Invitaciones recibidas: las acepta o rechaza el propio invitado. */
export function PendingInvites({ invites }: { invites: PendingInvite[] }) {
  const { t } = useI18n();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const visible = invites.filter((i) => !hidden.has(i.id));
  if (visible.length === 0) return null;

  const answer = async (id: string, action: "accept" | "decline") => {
    if (busy) return;
    setBusy(id);
    setError(false);
    const res = await fetch(
      `/api/organization-invites/${encodeURIComponent(id)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      },
    ).catch(() => null);
    setBusy(null);
    if (!res?.ok) return setError(true);
    setHidden((h) => new Set(h).add(id));
    if (action === "accept") window.location.reload();
  };

  return (
    <section aria-label={t("orgs.inv.title")} className="mb-8 w-full max-w-xl">
      <h2 className="font-display text-lg font-semibold text-white">
        {t("orgs.inv.title")}
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {visible.map((i) => (
          <li
            key={i.id}
            className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-raised p-4"
          >
            <OrgAvatar
              org={{ name: i.organization.name, logo: i.organization.logo }}
              size={44}
            />
            <span className="min-w-0 flex-1 text-sm text-white/80">
              {t("orgs.inv.text", {
                org: i.organization.name,
                role: t(`orgs.role.${i.roleKey}`),
              })}
            </span>
            <button
              type="button"
              className={primaryButton}
              disabled={busy === i.id}
              onClick={() => answer(i.id, "accept")}
            >
              {t("orgs.inv.accept")}
            </button>
            <button
              type="button"
              className={pillButton}
              disabled={busy === i.id}
              onClick={() => answer(i.id, "decline")}
            >
              {t("orgs.inv.decline")}
            </button>
          </li>
        ))}
      </ul>
      {error ? (
        <div className="mt-3">
          <Notice tone="error">{t("orgs.inv.error")}</Notice>
        </div>
      ) : null}
    </section>
  );
}
