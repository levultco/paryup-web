"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import { Group } from "@/components/organizations/promoters-ui";
import {
  dangerButton,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { orgFetch } from "@/lib/org-api";
import { syncPhaseKey, type SyncInfo } from "@/lib/fourvenues-home";
import type { MessageKey } from "@/lib/i18n";

type Status = {
  commercialMode: "NATIVE" | "FOURVENUES";
  link: {
    id: string;
    status: string;
    rejectionReason: string | null;
    lastSyncAt: string | null;
    eventsSync?: SyncInfo | null;
    /** Solo existe una vez vinculada; el propietario nunca ve otras salas. */
    host: { name: string } | null;
  } | null;
};

const OPEN = ["ACTIVE", "SUSPENDED", "REVOKED"];

/** Vinculación con Fourvenues: solicitud, estado y desconexión (la aprobación la hace ParyUp). */
export function FourvenuesCard() {
  const { t, locale } = useI18n();
  const { slug } = useOrg();
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await orgFetch<Status>(slug, "fourvenues/status");
    if (r.ok) setStatus(r.data);
    else setError(t("orgs.fv.loadError"));
  }, [slug, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const link = status?.link ?? null;
  const pending = link?.status === "PENDING_REVIEW";
  const open = !!link && OPEN.includes(link.status);
  const canRequest = !!status && !pending && !open;
  const rejected = link?.status === "REJECTED";

  const act = async (path: string, body: unknown) => {
    setBusy(true);
    setError(null);
    const r = await orgFetch<{ message?: string }>(slug, path, {
      method: "POST",
      body,
    });
    setBusy(false);
    if (!r.ok) setError(r.data?.message ?? t("orgs.fv.actionError"));
    await load();
  };

  return (
    <Group title="Fourvenues">
      <li className="flex flex-col gap-3 px-4 py-4">
        {canRequest && !rejected ? (
          <p className="text-[13px] text-white/50">{t("orgs.fv.intro")}</p>
        ) : null}

        {pending ? (
          <>
            <p className="text-[15px] font-semibold text-white">{t("orgs.fv.status.PENDING_REVIEW")}</p>
            <p className="text-[13px] text-white/50">{t("orgs.fv.pendingText")}</p>
          </>
        ) : null}

        {link?.status === "ACTIVE" ? (
          <>
            <p className="text-[15px] font-semibold text-white">{t("orgs.fv.status.ACTIVE")}</p>
            {link.host ? (
              <p className="text-[13px] text-white/50">{t("orgs.fv.connectedTo", { name: link.host.name })}</p>
            ) : null}
            {syncPhaseKey(link.eventsSync) ? (
              <p className="text-[13px] text-white/50">
                {t(syncPhaseKey(link.eventsSync)!, {
                  date: link.eventsSync?.at
                    ? new Date(link.eventsSync.at).toLocaleString(locale === "es" ? "es-ES" : "en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "",
                })}
              </p>
            ) : null}
          </>
        ) : null}

        {link && open && link.status !== "ACTIVE" ? (
          <p className="text-[15px] font-semibold text-white">
            {t(`orgs.fv.status.${link.status}` as MessageKey)}
            {link.host ? ` · ${link.host.name}` : ""}
          </p>
        ) : null}

        {rejected ? (
          <>
            <p className="text-[15px] font-semibold text-white">{t("orgs.fv.status.REJECTED")}</p>
            {link?.rejectionReason ? (
              <p className="text-[13px] text-white/50">{link.rejectionReason}</p>
            ) : null}
          </>
        ) : null}

        {link?.status === "DISCONNECTED" && status?.commercialMode === "FOURVENUES" ? (
          <p className="text-[13px] text-white/50">{t("orgs.fv.disconnectedNote")}</p>
        ) : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {pending && link ? (
          <button
            type="button"
            className={pillButton}
            disabled={busy}
            onClick={() => void act(`fourvenues/link-requests/${link.id}/cancel`, {})}
          >
            {t("orgs.fv.cancel")}
          </button>
        ) : null}
        {open ? (
          <button
            type="button"
            className={dangerButton}
            disabled={busy}
            onClick={() => {
              if (window.confirm(t("orgs.fv.disconnectConfirm")))
                void act("fourvenues/link/disconnect", {
                  reason: "Desconexión solicitada desde la web",
                });
            }}
          >
            {t("orgs.fv.disconnect")}
          </button>
        ) : null}

        {canRequest ? (
          <button
            type="button"
            className={primaryButton}
            disabled={busy}
            onClick={() => void act("fourvenues/link-requests", {})}
          >
            {rejected ? t("orgs.fv.requestAgain") : t("orgs.fv.request")}
          </button>
        ) : null}
      </li>
    </Group>
  );
}
