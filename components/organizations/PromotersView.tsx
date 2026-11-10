"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AddIcon, ArrowDownIcon } from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import { PromotersEarnings } from "@/components/organizations/PromotersEarnings";
import {
  Avatar,
  Disclosure,
  Group,
  Segmented,
  StatusDot,
  Switch,
} from "@/components/organizations/promoters-ui";
import { Select } from "@/components/organizations/select";
import { MorphingButton } from "@/components/watermelon/morphing-button";
import {
  Notice,
  PageHeader,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { orgFetch } from "@/lib/org-api";
import type { ManagedEventsPage } from "@/lib/events-admin";
import type { OrgMember } from "@/lib/organizations";
import { ListSkeleton } from "@/components/organizations/skeletons";
import { Flash } from "@/components/organizations/flash";

type Basis =
  "NONE" | "FIXED_PER_UNIT" | "PERCENT_OF_SALE" | "PER_CHECKIN" | "PER_SIGNUP";
const BASES: Basis[] = [
  "NONE",
  "FIXED_PER_UNIT",
  "PERCENT_OF_SALE",
  "PER_CHECKIN",
  "PER_SIGNUP",
];

type Status = "ACTIVE" | "PAUSED" | "REVOKED";
type Rule = {
  ticketId: string | null;
  basis: Basis;
  fixedAmount: number | null;
  percentBps: number | null;
};
type Assignment = {
  id: string;
  status: Status;
  canAddGuestsManually: boolean;
  canDistributeReserved: boolean;
  canViewGuestContact: boolean;
  promoter: {
    id: string;
    name: string;
    nickname: string | null;
    image?: string | null;
  };
  event: { id: string; name: string };
  currentRules: Rule[];
};
type Flash = { tone: "success" | "error"; text: string } | null;

const field =
  "h-11 rounded-xl bg-white/[0.07] px-3.5 text-[15px] text-white outline-none transition-colors placeholder:text-white/30 focus:bg-white/[0.11] disabled:opacity-40";
const press = "active:scale-[0.97] transition-transform duration-100";

function plain(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");
}

function AssignmentRow({
  a,
  slug,
  onChanged,
  onMessage,
}: {
  a: Assignment;
  slug: string;
  onChanged: () => Promise<void>;
  onMessage: (m: Flash) => void;
}) {
  const { t } = useI18n();
  const base = `promoters/assignments/${a.id}`;
  const rule = a.currentRules.find((r) => r.ticketId === null);
  const [open, setOpen] = useState(false);
  const [basis, setBasis] = useState<Basis>(rule?.basis ?? "NONE");
  const [value, setValue] = useState(
    rule?.percentBps != null
      ? String(rule.percentBps / 100)
      : rule?.fixedAmount != null
        ? String(rule.fixedAmount / 100)
        : "",
  );
  const [busy, setBusy] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const revoked = a.status === "REVOKED";

  const summary =
    !rule || rule.basis === "NONE"
      ? t("orgs.pr.basis.NONE")
      : t(`orgs.pr.per.${rule.basis}`, {
          v:
            rule.basis === "PERCENT_OF_SALE"
              ? `${plain((rule.percentBps ?? 0) / 100)} %`
              : `${plain((rule.fixedAmount ?? 0) / 100)} €`,
        });

  const run = async (
    path: string,
    init: { method: string; body?: unknown },
  ) => {
    if (busy) return;
    setBusy(true);
    const res = await orgFetch(slug, path, init);
    setBusy(false);
    if (!res.ok) return onMessage({ tone: "error", text: t("orgs.pr.error") });
    onMessage({ tone: "success", text: t("orgs.pr.saved") });
    await onChanged();
  };

  const saveRule = () => {
    const n = Number(value.replace(",", "."));
    if (basis !== "NONE" && !(n >= 0))
      return onMessage({ tone: "error", text: t("orgs.pr.error") });
    const body: Record<string, unknown> = { ticketId: null, basis };
    if (basis === "PERCENT_OF_SALE") body.percentBps = Math.round(n * 100);
    else if (basis !== "NONE") body.fixedAmount = Math.round(n * 100);
    return run(`${base}/rules`, { method: "PUT", body });
  };

  const perm = (
    key:
      "canAddGuestsManually" | "canDistributeReserved" | "canViewGuestContact",
    label: string,
  ) => (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-[15px] text-white/85">{label}</span>
      <Switch
        label={label}
        checked={a[key]}
        disabled={revoked || busy}
        onChange={(next) =>
          run(base, { method: "PATCH", body: { [key]: next } })
        }
      />
    </div>
  );

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]"
      >
        <Avatar name={a.promoter.name} image={a.promoter.image} />
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[16px] font-semibold tracking-[-0.01em] text-white">
            {a.promoter.name}
          </span>
          <span className="mt-0.5 truncate text-[13px] text-white/50">
            {revoked ? t("orgs.pr.st.REVOKED") : summary}
          </span>
        </span>
        <span className="flex items-center gap-2 text-[13px] text-white/55">
          <StatusDot status={a.status} />
          <span className="hidden sm:inline">
            {t(`orgs.pr.st.${a.status}`)}
          </span>
        </span>
        <ArrowDownIcon
          aria-hidden
          className={`h-4 w-4 shrink-0 text-white/35 transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>

      <Disclosure open={open}>
        <div className="flex flex-col gap-5 px-4 pb-5 pt-1">
          {!revoked ? (
            <>
              <div>
                <h3 className="mb-1 text-[13px] font-medium uppercase tracking-[0.04em] text-white/40">
                  {t("orgs.pr.permissions")}
                </h3>
                <div className="divide-y divide-white/[0.07]">
                  {perm("canAddGuestsManually", t("orgs.pr.permGuests"))}
                  {perm("canDistributeReserved", t("orgs.pr.permReserved"))}
                  {perm("canViewGuestContact", t("orgs.pr.permContact"))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-[13px] font-medium uppercase tracking-[0.04em] text-white/40">
                  {t("orgs.pr.commission")}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    label={t("orgs.pr.commission")}
                    className="min-w-48"
                    value={basis}
                    disabled={busy}
                    onChange={setBasis}
                    options={BASES.map((b) => ({
                      value: b,
                      label: t(`orgs.pr.basis.${b}`),
                    }))}
                  />
                  {basis !== "NONE" ? (
                    <input
                      className={`${field} w-28 tabular-nums`}
                      inputMode="decimal"
                      value={value}
                      placeholder={
                        basis === "PERCENT_OF_SALE"
                          ? t("orgs.pr.percent")
                          : t("orgs.pr.amount")
                      }
                      onChange={(e) => setValue(e.target.value)}
                    />
                  ) : null}
                  <button
                    type="button"
                    className={`${primaryButton} ${press}`}
                    disabled={busy}
                    onClick={saveRule}
                  >
                    {t("orgs.pr.save")}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className={`${pillButton} ${press}`}
                  disabled={busy}
                  onClick={() =>
                    run(base, {
                      method: "PATCH",
                      body: {
                        status: a.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
                      },
                    })
                  }
                >
                  {a.status === "ACTIVE"
                    ? t("orgs.pr.pause")
                    : t("orgs.pr.resume")}
                </button>
                <button
                  type="button"
                  className={`inline-flex h-10 items-center rounded-full px-4 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-40 ${press}`}
                  disabled={busy}
                  onClick={() =>
                    confirmRevoke
                      ? run(`${base}/revoke`, { method: "POST", body: {} })
                      : setConfirmRevoke(true)
                  }
                  onBlur={() => setConfirmRevoke(false)}
                >
                  {confirmRevoke
                    ? t("orgs.pr.confirmRevoke")
                    : t("orgs.pr.revoke")}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </Disclosure>
    </li>
  );
}

export function PromotersView() {
  const { t } = useI18n();
  const { slug } = useOrg();
  const [items, setItems] = useState<Assignment[] | null>(null);
  const [promoters, setPromoters] = useState<OrgMember[]>([]);
  const [events, setEvents] = useState<ManagedEventsPage["items"]>([]);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [message, setMessage] = useState<Flash>(null);
  const [panel, setPanel] = useState(false);
  const [promoterId, setPromoterId] = useState("");
  const [eventId, setEventId] = useState("");
  const [creating, setCreating] = useState(false);
  const [earningsKey, setEarningsKey] = useState(0);

  const load = useCallback(async () => {
    const [a, m, e] = await Promise.all([
      orgFetch<{ assignments: Assignment[] }>(slug, "promoters/assignments"),
      orgFetch<{ members: OrgMember[] }>(slug, "members"),
      orgFetch<ManagedEventsPage>(
        slug,
        "events/manage?limit=50&timeframe=upcoming",
      ),
    ]);
    setEarningsKey((k) => k + 1);
    if (!a.ok || !a.data) return setLoadError(true);
    setItems(a.data.assignments);
    if (m.ok && m.data)
      setPromoters(m.data.members.filter((x) => x.role === "PROMOTER"));
    if (e.ok && e.data) setEvents(e.data.items);
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const create = async () => {
    if (!promoterId || !eventId || creating) return;
    setCreating(true);
    setMessage(null);
    const res = await orgFetch(slug, "promoters/assignments", {
      method: "POST",
      body: { promoterUserId: promoterId, eventId },
    });
    setCreating(false);
    if (!res.ok) {
      return setMessage({
        tone: "error",
        text: t(res.status === 409 ? "orgs.pr.errDuplicate" : "orgs.pr.error"),
      });
    }
    setPromoterId("");
    setEventId("");
    setPanel(false);
    setMessage({ tone: "success", text: t("orgs.pr.saved") });
    await load();
  };

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; rows: Assignment[] }>();
    for (const a of items ?? []) {
      if (filter !== "ALL" && a.status !== filter) continue;
      const g = map.get(a.event.id) ?? { name: a.event.name, rows: [] };
      g.rows.push(a);
      map.set(a.event.id, g);
    }
    return [...map.entries()];
  }, [items, filter]);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title={t("orgs.pr.title")}
        subtitle={t("orgs.pr.subtitle")}
        aside={
          <MorphingButton
            open={panel}
            onOpenChange={setPanel}
            icon={<AddIcon aria-hidden className="h-4 w-4" />}
            label={t("orgs.pr.new")}
            title={t("orgs.pr.new")}
            closeLabel={t("orgs.pr.close")}
            buttonClassName={`${primaryButton} ${press}`}
          >
            {promoters.length === 0 && items ? (
              <p className="text-sm text-white/50">
                {t("orgs.pr.noPromoters")}
              </p>
            ) : (
              <div className="grid gap-3">
                <Select
                  label={t("orgs.pr.promoter")}
                  placeholder={t("orgs.pr.promoter")}
                  value={promoterId}
                  onChange={setPromoterId}
                  options={promoters.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                />
                <Select
                  label={t("orgs.pr.event")}
                  placeholder={t("orgs.pr.event")}
                  value={eventId}
                  onChange={setEventId}
                  options={events.map((ev) => ({
                    value: ev.id,
                    label: ev.name,
                  }))}
                />
                <button
                  type="button"
                  className={`${primaryButton} w-full ${press}`}
                  disabled={!promoterId || !eventId || creating}
                  onClick={create}
                >
                  {t("orgs.pr.create")}
                </button>
              </div>
            )}
          </MorphingButton>
        }
      />

      <Flash message={message} />

      <div className="overflow-x-auto">
        <Segmented
          label={t("orgs.pr.title")}
          value={filter}
          onChange={setFilter}
          options={[
            { value: "ALL", label: t("orgs.pr.filterAll") },
            { value: "ACTIVE", label: t("orgs.pr.fPlural.ACTIVE") },
            { value: "PAUSED", label: t("orgs.pr.fPlural.PAUSED") },
            { value: "REVOKED", label: t("orgs.pr.fPlural.REVOKED") },
          ]}
        />
      </div>

      {loadError ? (
        <Notice tone="error">{t("orgs.pr.loadError")}</Notice>
      ) : items === null ? (
        <ListSkeleton rows={3} />
      ) : groups.length === 0 ? (
        <p className="px-1 text-sm text-white/50">{t("orgs.pr.empty")}</p>
      ) : (
        groups.map(([id, g]) => (
          <Group key={id} title={g.name}>
            {g.rows.map((a) => (
              <AssignmentRow
                key={a.id}
                a={a}
                slug={slug}
                onChanged={load}
                onMessage={setMessage}
              />
            ))}
          </Group>
        ))
      )}

      <PromotersEarnings refreshKey={earningsKey} />
    </div>
  );
}
