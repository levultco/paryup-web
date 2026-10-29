"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import {
  Card,
  Notice,
  RolePill,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";

type Status = {
  canSellPaidTickets?: boolean;
  needsOnboarding?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
};

/** Estado de Stripe Connect y enlace para completarlo; usa los endpoints que ya usa la app. */
export function PaymentsCard() {
  const { t } = useI18n();
  const { slug } = useOrg();
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const url = `/api/organizations/${encodeURIComponent(slug)}/payments`;

  const call = useCallback(
    async (action?: "refresh" | "onboarding") => {
      const res = await fetch(url, {
        ...(action
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action }),
            }
          : {}),
      }).catch(() => null);
      return res?.ok ? await res.json().catch(() => null) : null;
    },
    [url],
  );

  useEffect(() => {
    let active = true;
    call().then((data) => {
      if (!active) return;
      if (data) setStatus(data);
      else setError(true);
    });
    return () => {
      active = false;
    };
  }, [call]);

  const refresh = async () => {
    setBusy(true);
    const data = await call("refresh");
    setBusy(false);
    if (data) {
      setStatus(data);
      setError(false);
    } else setError(true);
  };

  const configure = async () => {
    setBusy(true);
    const data = await call("onboarding");
    setBusy(false);
    if (data?.url) window.open(data.url, "_blank", "noopener,noreferrer");
    else setError(true);
  };

  const ready = status?.canSellPaidTickets === true;

  return (
    <Card title={t("orgs.st.payments")}>
      <p className="text-sm text-white/55">{t("orgs.st.paymentsText")}</p>
      {error ? (
        <div className="mt-4">
          <Notice tone="error">{t("orgs.st.paymentsError")}</Notice>
        </div>
      ) : null}
      {status ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <RolePill>
            {ready ? t("orgs.st.paymentsReady") : t("orgs.st.paymentsPending")}
          </RolePill>
          {!ready ? (
            <button
              type="button"
              className={primaryButton}
              disabled={busy}
              onClick={configure}
            >
              {t("orgs.st.configure")}
            </button>
          ) : null}
          <button
            type="button"
            className={pillButton}
            disabled={busy}
            onClick={refresh}
          >
            {t("orgs.st.refreshStatus")}
          </button>
        </div>
      ) : null}
      {status && !ready ? (
        <p className="mt-3 text-xs text-white/40">
          {t("orgs.st.paymentsHint")}
        </p>
      ) : null}
    </Card>
  );
}
