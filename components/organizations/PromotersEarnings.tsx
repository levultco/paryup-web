"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import { Avatar, Group } from "@/components/organizations/promoters-ui";
import {
  Notice,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { intlLocale } from "@/lib/i18n";
import { orgFetch } from "@/lib/org-api";
import { ORG_PERMISSIONS } from "@/lib/organizations";
import { EarningsSkeleton } from "@/components/organizations/skeletons";
import { Flash } from "@/components/organizations/flash";

type Entry = {
  kind: "ACCRUAL" | "REVERSAL" | "ADJUSTMENT";
  status: string;
  sourceType: string;
  amount: number;
  baseAmount: number | null;
  currency: string;
  promoter: { id: string; name: string; nickname: string | null };
};
type Balance = {
  promoterUserId: string;
  currency: string;
  unsettled: number;
  inReview: number;
  settledUnpaid: number;
  paid: number;
};
type SettlementStatus = "DRAFT" | "CLOSED" | "PAID" | "VOIDED";
type Settlement = {
  id: string;
  status: SettlementStatus;
  currency: string;
  totalAmount: number;
  entryCount: number;
  createdAt: string;
  promoter: { id: string; name: string };
};

type Row = {
  key: string;
  promoterId: string;
  name: string;
  currency: string;
  sales: number;
  sold: number;
  earned: number;
};

function SettlementRow({
  s,
  money,
  busy,
  onAction,
}: {
  s: Settlement;
  money: (cents: number, currency: string) => string;
  busy: boolean;
  onAction: (
    s: Settlement,
    action: "close" | "pay" | "void",
    body: Record<string, string>,
  ) => void;
}) {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<"pay" | "void" | null>(null);
  const [text, setText] = useState("");
  const date = new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
  }).format(new Date(s.createdAt));

  return (
    <li className="px-4 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 text-sm">
          <span className="font-medium text-white">{s.promoter.name}</span>
          <span className="ml-2 text-xs text-white/45">
            {date} · {s.entryCount}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white">
            {money(s.totalAmount, s.currency)}
          </span>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
            {t(`orgs.earn.st.${s.status}`)}
          </span>
        </div>
      </div>
      {s.status === "DRAFT" || s.status === "CLOSED" ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {mode ? (
            <>
              <input
                className="h-10 w-64 rounded-full border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-white/60"
                placeholder={
                  mode === "pay" ? t("orgs.earn.method") : t("orgs.earn.reason")
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                type="button"
                className={primaryButton}
                disabled={busy || text.trim().length < (mode === "pay" ? 2 : 3)}
                onClick={() =>
                  onAction(
                    s,
                    mode,
                    mode === "pay"
                      ? { paymentMethod: text.trim() }
                      : { reason: text.trim() },
                  )
                }
              >
                {t("orgs.earn.confirm")}
              </button>
              <button
                type="button"
                className={pillButton}
                onClick={() => {
                  setMode(null);
                  setText("");
                }}
              >
                {t("orgs.earn.cancel")}
              </button>
            </>
          ) : (
            <>
              {s.status === "DRAFT" ? (
                <button
                  type="button"
                  className={primaryButton}
                  disabled={busy}
                  onClick={() => onAction(s, "close", {})}
                >
                  {t("orgs.earn.close")}
                </button>
              ) : (
                <button
                  type="button"
                  className={primaryButton}
                  disabled={busy}
                  onClick={() => setMode("pay")}
                >
                  {t("orgs.earn.pay")}
                </button>
              )}
              {s.status === "DRAFT" ? (
                <button
                  type="button"
                  className={pillButton}
                  disabled={busy}
                  onClick={() => setMode("void")}
                >
                  {t("orgs.earn.void")}
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </li>
  );
}

export function PromotersEarnings({ refreshKey }: { refreshKey: number }) {
  const { t, locale } = useI18n();
  const { slug, can } = useOrg();
  const canSettle = can(ORG_PERMISSIONS.promotersSettle);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  const money = useCallback(
    (cents: number, currency: string) =>
      new Intl.NumberFormat(intlLocale(locale), {
        style: "currency",
        currency,
      }).format(cents / 100),
    [locale],
  );

  const load = useCallback(async () => {
    const [c, b, s] = await Promise.all([
      orgFetch<{ entries: Entry[] }>(slug, "promoters/commissions"),
      canSettle
        ? orgFetch<{ balances: Balance[] }>(slug, "promoters/balances")
        : Promise.resolve(null),
      canSettle
        ? orgFetch<{ settlements: Settlement[] }>(slug, "promoters/settlements")
        : Promise.resolve(null),
    ]);
    if (!c.ok || !c.data) return setFailed(true);
    setFailed(false);
    setEntries(c.data.entries);
    if (b?.ok && b.data) setBalances(b.data.balances);
    if (s?.ok && s.data) setSettlements(s.data.settlements);
  }, [slug, canSettle]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load, refreshKey]);

  const rows = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();
    for (const e of entries ?? []) {
      const key = `${e.promoter.id}:${e.currency}`;
      const row = map.get(key) ?? {
        key,
        promoterId: e.promoter.id,
        name: e.promoter.name,
        currency: e.currency,
        sales: 0,
        sold: 0,
        earned: 0,
      };
      row.earned += e.amount;
      if (
        e.kind === "ACCRUAL" &&
        e.status !== "REVERSED" &&
        e.sourceType === "ADMISSION_TICKET"
      ) {
        row.sales += 1;
        row.sold += e.baseAmount ?? 0;
      }
      map.set(key, row);
    }
    return [...map.values()];
  }, [entries]);

  const balanceOf = (r: Row) =>
    balances.find(
      (b) => b.promoterUserId === r.promoterId && b.currency === r.currency,
    );

  const settle = async (r: Row) => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    const res = await orgFetch(slug, "promoters/settlements", {
      method: "POST",
      body: { promoterUserId: r.promoterId, currency: r.currency },
    });
    setBusy(false);
    if (!res.ok) {
      setMessage({
        tone: "error",
        text: t(res.status === 409 ? "orgs.earn.nothing" : "orgs.pr.error"),
      });
      return;
    }
    await load();
  };

  const act = async (
    s: Settlement,
    action: "close" | "pay" | "void",
    body: Record<string, string>,
  ) => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    const res = await orgFetch(
      slug,
      `promoters/settlements/${s.id}/${action}`,
      {
        method: "POST",
        body,
      },
    );
    setBusy(false);
    if (!res.ok) {
      setMessage({ tone: "error", text: t("orgs.pr.error") });
      return;
    }
    await load();
  };

  const stat = (label: string, value: string) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[12px] text-white/40">{label}</span>
      <span className="text-[15px] font-medium tabular-nums text-white/90">
        {value}
      </span>
    </div>
  );

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="px-4 text-[13px] font-medium uppercase tracking-[0.04em] text-white/40">
          {t("orgs.earn.title")}
        </h2>
        <Flash message={message} />
        {failed ? (
          <Notice tone="error">{t("orgs.pr.loadError")}</Notice>
        ) : entries === null ? (
          <EarningsSkeleton count={2} />
        ) : rows.length === 0 ? (
          <p className="px-4 text-sm text-white/50">{t("orgs.earn.empty")}</p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {rows.map((r) => {
              const b = balanceOf(r);
              return (
                <li
                  key={r.key}
                  className="flex flex-col gap-5 rounded-[28px] bg-raised p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={r.name} size={36} />
                    <span className="min-w-0 flex-1 truncate text-[16px] font-semibold tracking-[-0.01em] text-white">
                      {r.name}
                    </span>
                    {canSettle && b && b.unsettled > 0 ? (
                      <button
                        type="button"
                        className={`${primaryButton} active:scale-[0.97] transition-transform duration-100`}
                        disabled={busy}
                        onClick={() => settle(r)}
                      >
                        {t("orgs.earn.settle")}
                      </button>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-[12px] text-white/40">
                      {t("orgs.earn.earned")}
                    </p>
                    <p className="text-[34px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-white">
                      {money(r.earned, r.currency)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/[0.07] pt-4 sm:grid-cols-3">
                    {stat(t("orgs.earn.sales"), String(r.sales))}
                    {stat(t("orgs.earn.sold"), money(r.sold, r.currency))}
                    {b ? (
                      <>
                        {stat(
                          t("orgs.earn.unsettled"),
                          money(b.unsettled, r.currency),
                        )}
                        {stat(
                          t("orgs.earn.inReview"),
                          money(b.inReview, r.currency),
                        )}
                        {stat(
                          t("orgs.earn.owed"),
                          money(b.settledUnpaid, r.currency),
                        )}
                        {stat(t("orgs.earn.paid"), money(b.paid, r.currency))}
                      </>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {canSettle ? (
        <section>
          <Group title={t("orgs.earn.settlements")}>
            {settlements.length === 0 ? (
              <li className="px-4 py-4 text-sm text-white/50">
                {t("orgs.earn.noSettlements")}
              </li>
            ) : (
              settlements.map((s) => (
                <SettlementRow
                  key={s.id}
                  s={s}
                  money={money}
                  busy={busy}
                  onAction={act}
                />
              ))
            )}
          </Group>
          <p className="mt-3 px-4 text-xs text-white/40">
            {t("orgs.earn.note")}
          </p>
        </section>
      ) : null}
    </>
  );
}
