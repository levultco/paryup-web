"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import {
  CardIcon,
  RefreshIcon,
  ShieldCheckIcon,
} from "@/components/icons/solar";
import { Group } from "@/components/organizations/promoters-ui";
import { primaryButton } from "@/components/organizations/ui";
import { Sk } from "@/components/organizations/skeletons";

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
    <div>
      <Group title={t("orgs.st.payments")}>
        <li className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              !status
                ? "bg-white/[0.08] text-white/60"
                : ready
                  ? "bg-[#30d158]/15 text-[#30d158]"
                  : "bg-[#ffd60a]/15 text-[#ffd60a]"
            }`}
          >
            {ready ? (
              <ShieldCheckIcon aria-hidden className="h-5 w-5" />
            ) : (
              <CardIcon aria-hidden className="h-5 w-5" />
            )}
          </span>
          <span className="flex min-w-0 flex-1 basis-52 flex-col gap-0.5">
            {status ? (
              <>
                <span className="text-[16px] font-semibold tracking-[-0.01em] text-white">
                  {ready
                    ? t("orgs.st.paymentsReady")
                    : t("orgs.st.paymentsPending")}
                </span>
                <span className="text-[13px] text-white/50">
                  {t("orgs.st.paymentsText")}
                </span>
              </>
            ) : error ? (
              <span className="text-[15px] text-red-400">
                {t("orgs.st.paymentsError")}
              </span>
            ) : (
              <>
                <Sk className="h-4 w-36 rounded-full" />
                <Sk className="mt-1 h-3.5 w-56 max-w-full rounded-full" />
              </>
            )}
          </span>
          <span className="flex items-center gap-2">
            {status && !ready ? (
              <button
                type="button"
                className={primaryButton}
                disabled={busy}
                onClick={configure}
              >
                {t("orgs.st.configure")}
              </button>
            ) : null}
            {status || error ? (
              <button
                type="button"
                aria-label={t("orgs.st.refreshStatus")}
                title={t("orgs.st.refreshStatus")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2e2e2e] text-white transition-[background-color,transform] duration-100 hover:bg-[#3a3a3a] active:scale-90 disabled:opacity-40"
                disabled={busy}
                onClick={refresh}
              >
                <RefreshIcon
                  aria-hidden
                  className={`h-4 w-4 ${busy ? "animate-spin" : ""}`}
                />
              </button>
            ) : null}
          </span>
        </li>
      </Group>
      {status && !ready ? (
        <p className="mt-3 px-4 text-xs text-white/40">
          {t("orgs.st.paymentsHint")}
        </p>
      ) : null}
    </div>
  );
}
