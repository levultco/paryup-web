"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { CatalogHeader } from "@/components/organizations/CatalogTabs";
import { useOrg } from "@/components/organizations/OrgShell";
import { TicketIcon } from "@/components/icons/solar";
import { Dialog, Switch } from "@/components/organizations/promoters-ui";
import { TicketTemplateEditor } from "@/components/organizations/TicketTemplateEditor";
import {
  dangerButton,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { catalogErrorKey, type TicketTemplate } from "@/lib/catalog";
import { orgFetch } from "@/lib/org-api";
import { ORG_PERMISSIONS } from "@/lib/organizations";
import { TemplateRowsSkeleton } from "@/components/organizations/skeletons";
import { Flash } from "@/components/organizations/flash";

export function TicketTemplatesList() {
  const { t } = useI18n();
  const { slug, can } = useOrg();
  const allowed = can(ORG_PERMISSIONS.ticketTemplatesManage);
  const [items, setItems] = useState<TicketTemplate[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ id?: string } | null>(null);

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
            <button
              type="button"
              className={primaryButton}
              onClick={() => setEditor({})}
            >
              {t("orgs.cat.tk.create")}
            </button>
          ) : undefined
        }
      />
      <Flash message={message} />

      {!allowed ? (
        <p className="text-white/55">{t("orgs.cat.tk.noAccess")}</p>
      ) : failed ? (
        <p className="rounded-3xl bg-raised shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] p-6 text-center text-white/55">
          {t("orgs.cat.err.generic")}
        </p>
      ) : !items ? (
        <TemplateRowsSkeleton rows={3} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold text-white">
            {t("orgs.cat.tk.empty")}
          </p>
          <p className="mt-2 max-w-sm text-white/55">
            {t("orgs.cat.tk.emptyText")}
          </p>
          <button
            type="button"
            className={`${primaryButton} mt-6`}
            onClick={() => setEditor({})}
          >
            {t("orgs.cat.tk.create")}
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const chips = [
              item.type ? t(`orgs.cat.type.${item.type}`) : null,
              item.visibility ? t(`orgs.cat.vis.${item.visibility}`) : null,
              item.capacity
                ? `${t("orgs.cat.ed.capacity")} ${item.capacity}`
                : t("orgs.cat.tk.unlimited"),
            ].filter(Boolean) as string[];
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[28px] bg-raised p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] sm:px-5"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-white/20 to-white/[0.05] text-white transition-opacity ${item.isActive ? "" : "opacity-40"}`}
                >
                  <TicketIcon aria-hidden className="h-5 w-5" />
                </span>
                <span
                  className={`flex min-w-0 flex-1 basis-48 flex-col gap-1.5 transition-opacity ${item.isActive ? "" : "opacity-50"}`}
                >
                  <span className="truncate text-[17px] font-semibold tracking-[-0.015em] text-white">
                    {item.name}
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {chips.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[12px] text-white/60"
                      >
                        {c}
                      </span>
                    ))}
                  </span>
                </span>
                <span
                  className={`text-[22px] font-semibold tracking-[-0.03em] tabular-nums text-white transition-opacity ${item.isActive ? "" : "opacity-50"}`}
                >
                  {item.salesMode === "RELEASES"
                    ? t("orgs.cat.tk.releases")
                    : `${item.price} €`}
                </span>
                <Switch
                  checked={item.isActive}
                  disabled={busy === item.id}
                  onChange={() => toggle(item)}
                  label={
                    item.isActive
                      ? t("orgs.cat.tk.active")
                      : t("orgs.cat.tk.inactive")
                  }
                />
                {confirm === item.id ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-white/60">
                      {t("orgs.cat.tk.deleteConfirm", { name: item.name })}
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
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
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
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <Dialog
        open={!!editor}
        variant="side"
        onClose={() => setEditor(null)}
        title={
          editor?.id ? t("orgs.cat.ed.editTitle") : t("orgs.cat.ed.newTitle")
        }
      >
        {editor ? (
          <TicketTemplateEditor
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
