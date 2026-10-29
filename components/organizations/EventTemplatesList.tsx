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
import { catalogErrorKey, type EventTemplate } from "@/lib/catalog";
import { orgFetch } from "@/lib/org-api";
import { ORG_PERMISSIONS } from "@/lib/organizations";

export function EventTemplatesList() {
  const { t } = useI18n();
  const { slug, can } = useOrg();
  const canCreate = can(ORG_PERMISSIONS.eventsCreate);
  const canEdit = can(ORG_PERMISSIONS.eventsEdit);
  const base = `/organizations/${slug}/catalog/events`;
  const [items, setItems] = useState<EventTemplate[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await orgFetch<{ eventTemplates: EventTemplate[] }>(
      slug,
      "event-templates",
    );
    if (res.ok && res.data) {
      setItems(res.data.eventTemplates);
    } else setFailed(true);
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const remove = async (item: EventTemplate) => {
    setBusy(item.id);
    const res = await orgFetch(slug, `event-templates/${item.id}`, {
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
        active="events"
        action={
          canCreate ? (
            <Link href={`${base}/new`} className={primaryButton}>
              {t("orgs.cat.et.create")}
            </Link>
          ) : undefined
        }
      />
      {message ? <Notice tone="error">{message}</Notice> : null}
      {failed ? (
        <p className="rounded-3xl border border-white/10 bg-raised p-6 text-center text-white/55">
          {t("orgs.cat.err.generic")}
        </p>
      ) : !items ? (
        <div aria-hidden className="flex flex-col gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl bg-white/[0.06]"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold text-white">
            {t("orgs.cat.et.empty")}
          </p>
          <p className="mt-2 max-w-sm text-white/55">
            {t("orgs.cat.et.emptyText")}
          </p>
          {canCreate ? (
            <Link href={`${base}/new`} className={`${primaryButton} mt-6`}>
              {t("orgs.cat.et.create")}
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-raised">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </span>
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate font-medium text-white">
                  {item.templateName}
                </span>
                <span className="truncate text-sm text-white/45">
                  {[
                    item.eventName,
                    item.location?.locationName,
                    item.startTime
                      ? `${item.startTime}${item.endTime ? `–${item.endTime}` : ""}`
                      : null,
                    item.ticketTypeIds.length
                      ? t("orgs.cat.et.summary", {
                          count: item.ticketTypeIds.length,
                        })
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              {confirm === item.id ? (
                <>
                  <span className="text-xs text-white/60">
                    {t("orgs.cat.et.deleteConfirm", {
                      name: item.templateName,
                    })}
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
              ) : canEdit ? (
                <>
                  <Link href={`${base}/${item.id}`} className={pillButton}>
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
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
