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
import type { MessageKey } from "@/lib/i18n";

type Host = { id: string; name: string; slug: string };
type Status = {
  commercialMode: "NATIVE" | "FOURVENUES";
  link: {
    id: string;
    status: string;
    rejectionReason: string | null;
    lastSyncAt: string | null;
    host: Host;
  } | null;
};

const OPEN = ["ACTIVE", "SUSPENDED", "REVOKED"];
/** Nombre del canal tal como lo ve la sala en Fourvenues. */
const CHANNEL_NAME = "ParyUp";

const inputClass =
  "w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/60";

/** Vinculación con Fourvenues: solicitud, estado y desconexión (la aprobación la hace ParyUp). */
export function FourvenuesCard() {
  const { t } = useI18n();
  const { slug } = useOrg();
  const [status, setStatus] = useState<Status | null>(null);
  const [hosts, setHosts] = useState<Host[] | null | "error">(null);
  const [hostId, setHostId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

  useEffect(() => {
    if (!canRequest || hosts !== null) return;
    void orgFetch<{ hosts: Host[]; refresh: { ok: boolean } }>(
      slug,
      "fourvenues/hosts",
    ).then((r) =>
      setHosts(r.ok && r.data?.refresh.ok ? r.data.hosts : "error"),
    );
  }, [canRequest, hosts, slug]);

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

  const statusKey = link
    ? (`orgs.fv.status.${link.status}` as MessageKey)
    : null;

  return (
    <Group title="Fourvenues">
      <li className="flex flex-col gap-3 px-4 py-4">
        <p className="text-[13px] text-white/50">{t("orgs.fv.intro")}</p>
        {statusKey && link ? (
          <p className="text-[15px] font-semibold text-white">
            {t(statusKey)} · {link.host.name}
          </p>
        ) : null}
        {link?.status === "REJECTED" && link.rejectionReason ? (
          <p className="text-[13px] text-white/50">{link.rejectionReason}</p>
        ) : null}
        {link?.status === "DISCONNECTED" &&
        status?.commercialMode === "FOURVENUES" ? (
          <p className="text-[13px] text-white/50">
            {t("orgs.fv.disconnectedNote")}
          </p>
        ) : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {pending && link ? (
          <button
            type="button"
            className={pillButton}
            disabled={busy}
            onClick={() =>
              void act(`fourvenues/link-requests/${link.id}/cancel`, {})
            }
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
          hosts === null ? null : hosts === "error" ? (
            <p className="text-sm text-white/50">{t("orgs.fv.hostsError")}</p>
          ) : hosts.length === 0 ? (
            <p className="text-sm text-white/50">
              {t("orgs.fv.noHosts", { channel: CHANNEL_NAME })}
            </p>
          ) : (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void act("fourvenues/link-requests", {
                  hostId,
                  contactName: name.trim(),
                  contactEmail: email.trim(),
                });
              }}
            >
              <select
                className={inputClass}
                value={hostId}
                onChange={(e) => setHostId(e.target.value)}
                required
              >
                <option value="" className="bg-black">
                  {t("orgs.fv.pickHost")}
                </option>
                {hosts.map((h) => (
                  <option key={h.id} value={h.id} className="bg-black">
                    {h.name}
                  </option>
                ))}
              </select>
              <input
                className={inputClass}
                placeholder={t("orgs.fv.contactName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
              <input
                className={inputClass}
                type="email"
                placeholder={t("orgs.fv.contactEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className={primaryButton} disabled={busy}>
                {t("orgs.fv.request")}
              </button>
            </form>
          )
        ) : null}
      </li>
    </Group>
  );
}
