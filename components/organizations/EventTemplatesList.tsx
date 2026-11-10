"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { CatalogHeader } from "@/components/organizations/CatalogTabs";
import { useOrg } from "@/components/organizations/OrgShell";
import {
  dangerButton,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { catalogErrorKey, type EventTemplate } from "@/lib/catalog";
import { orgFetch } from "@/lib/org-api";
import { ORG_PERMISSIONS } from "@/lib/organizations";
import { Dialog } from "@/components/organizations/promoters-ui";
import { EventTemplateEditor } from "@/components/organizations/EventTemplateEditor";
import { TemplateRowsSkeleton } from "@/components/organizations/skeletons";
import { Flash } from "@/components/organizations/flash";

export function EventTemplatesList() {
  const { t } = useI18n();
  const { slug, can } = useOrg();
  const canCreate = can(ORG_PERMISSIONS.eventsCreate);
  const canEdit = can(ORG_PERMISSIONS.eventsEdit);
  const [items, setItems] = useState<EventTemplate[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ id?: string } | null>(null);

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
            <button
              type="button"
              className={primaryButton}
              onClick={() => setEditor({})}
            >
              {t("orgs.cat.et.create")}
            </button>
          ) : undefined
        }
      />
      <Flash message={message} />
      {failed ? (
        <p className="rounded-3xl bg-raised shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] p-6 text-center text-white/55">
          {t("orgs.cat.err.generic")}
        </p>
      ) : !items ? (
        <TemplateRowsSkeleton rows={2} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold text-white">
            {t("orgs.cat.et.empty")}
          </p>
          <p className="mt-2 max-w-sm text-white/55">
            {t("orgs.cat.et.emptyText")}
          </p>
          {canCreate ? (
            <button
              type="button"
              className={`${primaryButton} mt-6`}
              onClick={() => setEditor({})}
            >
              {t("orgs.cat.et.create")}
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[28px] bg-raised p-3 pr-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] sm:pr-5"
            >
              <span className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/10">
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
                <span className="truncate text-[17px] font-semibold tracking-[-0.015em] text-white">
                  {item.templateName}
                </span>
                <span className="mt-1 truncate text-sm text-white/50">
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
                    className={dangerButton}
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
                  <button
                    type="button"
                    className={pillButton}
                    onClick={() => setEditor({ id: item.id })}
                  >
                    {t("orgs.cat.tk.edit")}
                  </button>
                  <button
                    type="button"
                    className={dangerButton}
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
      <Dialog
        open={!!editor}
        variant="side"
        onClose={() => setEditor(null)}
        title={
          editor?.id ? t("orgs.cat.et.editTitle") : t("orgs.cat.et.newTitle")
        }
      >
        {editor ? (
          <EventTemplateEditor
            templateId={editor.id}
            onDone={() => {
              setEditor(null);
              void load();
            }}
          />
        ) : null}
      </Dialog>
    </div>
  );
}
