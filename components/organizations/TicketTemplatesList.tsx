"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { CatalogHeader } from "@/components/organizations/CatalogTabs";
import { useOrg } from "@/components/organizations/OrgShell";
import {
  Notice,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { catalogErrorKey, type TicketTemplate } from "@/lib/catalog";
import { orgFetch } from "@/lib/org-api";
import { ORG_PERMISSIONS } from "@/lib/organizations";

export function TicketTemplatesList() {
  const { t } = useI18n();
  const { slug, can } = useOrg();
  const allowed = can(ORG_PERMISSIONS.ticketTemplatesManage);
  const base = `/organizations/${slug}/catalog`;
  const [items, setItems] = useState<TicketTemplate[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await orgFetch<{ ticketTypes: TicketTemplate[] }>(
      slug,
      "ticket-types",
    );
    if (res.ok && res.data) {
      setItems(res.data.ticketTypes);
      setFailed(false);
    } else setFailed(true);
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (allowed) void load();
  }, [load, allowed]);

  const toggle = async (item: TicketTemplate) => {
    setBusy(item.id);
    setMessage(null);
    const res = await orgFetch(slug, `ticket-types/${item.id}/activation`, {
      method: "PATCH",
      body: { isActive: !item.isActive },
    });
    setBusy(null);
    if (!res.ok) return setMessage(t(catalogErrorKey(res.status, res.data)));
    setItems(
      (list) =>
        list?.map((x) =>
          x.id === item.id ? { ...x, isActive: !item.isActive } : x,
        ) ?? null,
    );
  };

  const remove = async (item: TicketTemplate) => {
    setBusy(item.id);
    setMessage(null);
    const res = await orgFetch(slug, `ticket-types/${item.id}`, {
      method: "DELETE",
    });
    setBusy(null);
    setConfirm(null);
    if (!res.ok) return setMessage(t(catalogErrorKey(res.status, res.data)));
    setItems((list) => list?.filter((x) => x.id !== item.id) ?? null);
  };

  return (
    <div className="flex flex-col gap-6">
      <CatalogHeader
        active="tickets"
        action={
          allowed ? (
            <Link href={`${base}/tickets/new`} className={primaryButton}>
              {t("orgs.cat.tk.create")}
            </Link>
          ) : undefined
        }
      />
      {message ? <Notice tone="error">{message}</Notice> : null}

      {!allowed ? (
        <p className="text-white/55">{t("orgs.cat.tk.noAccess")}</p>
      ) : failed ? (
        <p className="rounded-3xl border border-white/10 bg-raised p-6 text-center text-white/55">
          {t("orgs.cat.err.generic")}
        </p>
      ) : !items ? (
        <div aria-hidden className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl bg-white/[0.06]"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold text-white">
            {t("orgs.cat.tk.empty")}
          </p>
          <p className="mt-2 max-w-sm text-white/55">
            {t("orgs.cat.tk.emptyText")}
          </p>
          <Link
            href={`${base}/tickets/new`}
            className={`${primaryButton} mt-6`}
          >
            {t("orgs.cat.tk.create")}
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-raised">
          {items.map((item) => {
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-3 p-4"
              >
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate font-medium text-white">
                    {item.name}
                  </span>
                  <span className="truncate text-sm text-white/45">
                    {[
                      item.type ? t(`orgs.cat.type.${item.type}`) : null,
                      item.visibility
                        ? t(`orgs.cat.vis.${item.visibility}`)
                        : null,
                      item.salesMode === "RELEASES"
                        ? t("orgs.cat.tk.releases")
                        : `${item.price} €`,
                      item.capacity
                        ? `${t("orgs.cat.ed.capacity")} ${item.capacity}`
                        : t("orgs.cat.tk.unlimited"),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.isActive}
                  aria-label={
                    item.isActive
                      ? t("orgs.cat.tk.active")
                      : t("orgs.cat.tk.inactive")
                  }
                  disabled={busy === item.id}
                  onClick={() => toggle(item)}
                  className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${item.isActive ? "bg-emerald-400/80" : "bg-white/15"}`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white transition-transform ${item.isActive ? "translate-x-5" : ""}`}
                  />
                </button>
                {confirm === item.id ? (
                  <>
                    <span className="text-xs text-white/60">
                      {t("orgs.cat.tk.deleteConfirm", { name: item.name })}
                    </span>
                    <button
                      type="button"
                      className={primaryButton}
                      disabled={busy === item.id}
                      onClick={() => remove(item)}
                    >
                      {t("orgs.common.confirm")}
                    </button>
                    <button
                      type="button"
                      className={pillButton}
                      onClick={() => setConfirm(null)}
                    >
                      {t("orgs.common.cancel")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={`${base}/tickets/${item.id}`}
                      className={pillButton}
                    >
                      {t("orgs.cat.tk.edit")}
                    </Link>
                    <button
                      type="button"
                      className={pillButton}
                      onClick={() => setConfirm(item.id)}
                    >
                      {t("orgs.cat.tk.delete")}
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
