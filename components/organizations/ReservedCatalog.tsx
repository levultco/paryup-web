"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { CatalogHeader } from "@/components/organizations/CatalogTabs";
import { useOrg } from "@/components/organizations/OrgShell";
import {
  Card,
  Notice,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { orgFetch } from "@/lib/org-api";
import { ORG_PERMISSIONS } from "@/lib/organizations";
import {
  PAYMENT_MODES,
  emptyTable,
  reservedErrorKey,
  tablePayload,
  tableToForm,
  validateTable,
  type ReservedArea,
  type ReservedTable,
  type TableErrors,
  type TableForm,
} from "@/lib/reserved";

const api = "reserved-areas";

const input =
  "w-full rounded-2xl border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/60 disabled:opacity-50";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-white/55">
      {label}
      {children}
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

type AreaForm = {
  name: string;
  description: string;
  locationName: string;
  imageUrl: string;
  isActive: boolean;
};

export function ReservedCatalog() {
  const { t } = useI18n();
  const { slug, org, can } = useOrg();
  const canEdit = can(ORG_PERMISSIONS.eventsEdit);

  const [areas, setAreas] = useState<ReservedArea[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [areaForm, setAreaForm] = useState<{
    id?: string;
    values: AreaForm;
  } | null>(null);
  const [areaError, setAreaError] = useState<string | null>(null);
  const [tableForm, setTableForm] = useState<{
    areaId: string;
    id?: string;
    values: TableForm;
  } | null>(null);
  const [tableErrors, setTableErrors] = useState<TableErrors>({});
  const [confirm, setConfirm] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await orgFetch<{ areas: ReservedArea[] }>(slug, api);
    if (res.ok && res.data) {
      setAreas(res.data.areas);
      setFailed(false);
    } else setFailed(true);
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const fail = (res: { status: number; data: unknown }) =>
    setMessage({
      tone: "error",
      text: t(reservedErrorKey(res.status, res.data)),
    });

  const saveArea = async () => {
    if (!areaForm) return;
    const v = areaForm.values;
    if (!v.name.trim()) return setAreaError(t("orgs.rs.e.name"));
    setAreaError(null);
    setBusy("area");
    const body = {
      name: v.name.trim(),
      description: v.description.trim(),
      locationName: v.locationName.trim(),
      imageUrl: v.imageUrl,
      isActive: v.isActive,
    };
    const res = await orgFetch(
      slug,
      areaForm.id ? `${api}/${areaForm.id}` : api,
      {
        method: areaForm.id ? "PATCH" : "POST",
        body,
      },
    );
    setBusy(null);
    if (!res.ok) return fail(res);
    setAreaForm(null);
    setMessage({ tone: "success", text: t("orgs.cat.ed.saved") });
    await load();
  };

  const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !areaForm) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return setMessage({ tone: "error", text: t("orgs.pf.errType") });
    if (file.size > 12 * 1024 * 1024)
      return setMessage({ tone: "error", text: t("orgs.pf.errSize") });
    setUploading(true);
    try {
      const bitmap = await createImageBitmap(file);
      const { width, height } = bitmap;
      bitmap.close();
      if (width > 8192 || height > 8192) throw new Error("dims");
      const data = new FormData();
      data.set("file", file);
      data.set("kind", "area");
      data.set("width", String(width));
      data.set("height", String(height));
      const res = await fetch(
        `/api/organizations/${encodeURIComponent(slug)}/media`,
        { method: "POST", body: data },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.url) throw new Error("upload");
      setAreaForm((f) =>
        f ? { ...f, values: { ...f.values, imageUrl: json.url } } : f,
      );
    } catch (error) {
      setMessage({
        tone: "error",
        text: t(
          error instanceof Error && error.message === "dims"
            ? "orgs.pf.errDims"
            : "orgs.ed.errCover",
        ),
      });
    } finally {
      setUploading(false);
    }
  };

  const removeArea = async (area: ReservedArea) => {
    setBusy(area.id);
    const res = await orgFetch(slug, `${api}/${area.id}`, { method: "DELETE" });
    setBusy(null);
    setConfirm(null);
    if (!res.ok) return fail(res);
    await load();
  };

  const saveTable = async () => {
    if (!tableForm) return;
    const errors = validateTable(tableForm.values);
    setTableErrors(errors);
    if (Object.keys(errors).length) return;
    setBusy("table");
    const res = await orgFetch(slug, `${api}/${tableForm.areaId}/table-types`, {
      method: "POST",
      body: tablePayload(tableForm.values, tableForm.id),
    });
    setBusy(null);
    if (!res.ok) return fail(res);
    setTableForm(null);
    setMessage({ tone: "success", text: t("orgs.cat.ed.saved") });
    await load();
  };

  const removeTable = async (area: ReservedArea, table: ReservedTable) => {
    setBusy(table.id);
    const res = await orgFetch(
      slug,
      `${api}/${area.id}/table-types/${table.id}`,
      { method: "DELETE" },
    );
    setBusy(null);
    setConfirm(null);
    if (!res.ok) return fail(res);
    await load();
  };

  const setT = <K extends keyof TableForm>(key: K, value: TableForm[K]) =>
    setTableForm((f) =>
      f ? { ...f, values: { ...f.values, [key]: value } } : f,
    );
  const errText = (key?: string) => (key ? t(`orgs.rs.e.${key}`) : undefined);

  return (
    <div className="flex flex-col gap-6">
      <CatalogHeader
        active="reserved"
        action={
          canEdit && !areaForm ? (
            <button
              type="button"
              className={primaryButton}
              onClick={() =>
                setAreaForm({
                  values: {
                    name: "",
                    description: "",
                    locationName: "",
                    imageUrl: "",
                    isActive: true,
                  },
                })
              }
            >
              {t("orgs.rs.createArea")}
            </button>
          ) : undefined
        }
      />
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

      {areaForm ? (
        <Card
          title={areaForm.id ? t("orgs.rs.editArea") : t("orgs.rs.createArea")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("orgs.rs.areaName")} error={areaError ?? undefined}>
              <input
                className={input}
                value={areaForm.values.name}
                maxLength={80}
                onChange={(e) =>
                  setAreaForm({
                    ...areaForm,
                    values: { ...areaForm.values, name: e.target.value },
                  })
                }
              />
            </Field>
            <Field label={t("orgs.rs.areaLocation")}>
              <input
                className={input}
                value={areaForm.values.locationName}
                maxLength={120}
                onChange={(e) =>
                  setAreaForm({
                    ...areaForm,
                    values: {
                      ...areaForm.values,
                      locationName: e.target.value,
                    },
                  })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t("orgs.rs.areaDescription")}>
                <textarea
                  className={`${input} min-h-20 resize-y`}
                  value={areaForm.values.description}
                  maxLength={400}
                  onChange={(e) =>
                    setAreaForm({
                      ...areaForm,
                      values: {
                        ...areaForm.values,
                        description: e.target.value,
                      },
                    })
                  }
                />
              </Field>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <span className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-white/10">
                {areaForm.values.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={areaForm.values.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </span>
              <button
                type="button"
                className={pillButton}
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
              >
                {uploading ? t("orgs.pf.uploading") : t("orgs.rs.areaImage")}
              </button>
              {areaForm.values.imageUrl ? (
                <button
                  type="button"
                  className={pillButton}
                  onClick={() =>
                    setAreaForm({
                      ...areaForm,
                      values: { ...areaForm.values, imageUrl: "" },
                    })
                  }
                >
                  {t("orgs.ed.removeCover")}
                </button>
              ) : null}
              <input
                ref={fileInput}
                type="file"
                hidden
                accept="image/jpeg,image/png,image/webp"
                onChange={uploadImage}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/80 sm:col-span-2">
              <input
                type="checkbox"
                checked={areaForm.values.isActive}
                onChange={(e) =>
                  setAreaForm({
                    ...areaForm,
                    values: { ...areaForm.values, isActive: e.target.checked },
                  })
                }
              />
              {t("orgs.rs.t.active")}
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              className={primaryButton}
              disabled={busy === "area"}
              onClick={saveArea}
            >
              {t("orgs.rs.saveArea")}
            </button>
            <button
              type="button"
              className={pillButton}
              onClick={() => {
                setAreaForm(null);
                setAreaError(null);
              }}
            >
              {t("orgs.common.cancel")}
            </button>
          </div>
        </Card>
      ) : null}

      {failed ? (
        <p className="rounded-3xl border border-white/10 bg-raised p-6 text-center text-white/55">
          {t("orgs.cat.err.generic")}
        </p>
      ) : !areas ? (
        <div
          aria-hidden
          className="h-32 animate-pulse rounded-3xl bg-white/[0.06]"
        />
      ) : areas.length === 0 && !areaForm ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold text-white">
            {t("orgs.rs.empty")}
          </p>
          <p className="mt-2 max-w-sm text-white/55">
            {t("orgs.rs.emptyText")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-white/35">{t("orgs.rs.paymentsNote")}</p>
          {areas.map((area) => (
            <Card key={area.id}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                  {area.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={area.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </span>
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="font-display truncate text-lg font-semibold text-white">
                    {area.name}
                    {!area.isActive ? (
                      <span className="ml-2 text-xs font-normal text-white/40">
                        {t("orgs.rs.inactive")}
                      </span>
                    ) : null}
                  </span>
                  <span className="truncate text-sm text-white/45">
                    {[
                      area.locationName,
                      area.tableTypes.length
                        ? t("orgs.rs.tablesCount", {
                            count: area.tableTypes.length,
                          })
                        : t("orgs.rs.noTables"),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                {canEdit ? (
                  confirm === area.id ? (
                    <>
                      <span className="text-xs text-white/60">
                        {t("orgs.rs.deleteAreaConfirm", { name: area.name })}
                      </span>
                      <button
                        type="button"
                        className={primaryButton}
                        disabled={busy === area.id}
                        onClick={() => removeArea(area)}
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
                      <button
                        type="button"
                        className={pillButton}
                        onClick={() =>
                          setAreaForm({
                            id: area.id,
                            values: {
                              name: area.name,
                              description: area.description,
                              locationName: area.locationName,
                              imageUrl: area.imageUrl,
                              isActive: area.isActive,
                            },
                          })
                        }
                      >
                        {t("orgs.cat.tk.edit")}
                      </button>
                      <button
                        type="button"
                        className={pillButton}
                        onClick={() => setConfirm(area.id)}
                      >
                        {t("orgs.rs.deleteArea")}
                      </button>
                    </>
                  )
                ) : null}
              </div>

              {area.tableTypes.length ? (
                <ul className="mt-4 flex flex-col divide-y divide-white/10 rounded-2xl border border-white/10">
                  {area.tableTypes.map((table) => (
                    <li
                      key={table.id}
                      className="flex flex-wrap items-center gap-3 p-3"
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{ background: table.color }}
                      />
                      <span className="flex min-w-0 flex-1 flex-col leading-tight">
                        <span className="truncate text-sm font-medium text-white">
                          {table.name}
                          {!table.isActive ? (
                            <span className="ml-2 text-xs font-normal text-white/40">
                              {t("orgs.rs.inactive")}
                            </span>
                          ) : null}
                        </span>
                        <span className="truncate text-xs text-white/45">
                          {[
                            `${table.tableCount} × ${table.capacity}p`,
                            `${table.minSpendAmount} €`,
                            t(`orgs.rs.pm.${table.paymentMode}`),
                          ].join(" · ")}
                        </span>
                      </span>
                      {canEdit ? (
                        confirm === table.id ? (
                          <>
                            <span className="text-xs text-white/60">
                              {t("orgs.rs.deleteTableConfirm", {
                                name: table.name,
                              })}
                            </span>
                            <button
                              type="button"
                              className={primaryButton}
                              disabled={busy === table.id}
                              onClick={() => removeTable(area, table)}
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
                            <button
                              type="button"
                              className={pillButton}
                              onClick={() => {
                                setTableErrors({});
                                setTableForm({
                                  areaId: area.id,
                                  id: table.id,
                                  values: tableToForm(table),
                                });
                              }}
                            >
                              {t("orgs.cat.tk.edit")}
                            </button>
                            <button
                              type="button"
                              className={pillButton}
                              onClick={() => setConfirm(table.id)}
                            >
                              {t("orgs.cat.tk.delete")}
                            </button>
                          </>
                        )
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}

              {tableForm?.areaId === area.id ? (
                <div className="mt-4 rounded-2xl border border-white/15 p-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field
                      label={t("orgs.rs.t.name")}
                      error={errText(tableErrors.name)}
                    >
                      <input
                        className={input}
                        value={tableForm.values.name}
                        maxLength={80}
                        onChange={(e) => setT("name", e.target.value)}
                      />
                    </Field>
                    <Field
                      label={t("orgs.rs.t.capacity")}
                      error={errText(tableErrors.capacity)}
                    >
                      <input
                        inputMode="numeric"
                        className={input}
                        value={tableForm.values.capacity}
                        onChange={(e) =>
                          setT("capacity", e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </Field>
                    <Field
                      label={t("orgs.rs.t.tableCount")}
                      error={errText(tableErrors.tableCount)}
                    >
                      <input
                        inputMode="numeric"
                        className={input}
                        value={tableForm.values.tableCount}
                        onChange={(e) =>
                          setT("tableCount", e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </Field>
                    <Field
                      label={t("orgs.rs.t.minSpend")}
                      error={errText(tableErrors.minSpendAmount)}
                    >
                      <input
                        inputMode="decimal"
                        className={input}
                        value={tableForm.values.minSpendAmount}
                        onChange={(e) =>
                          setT(
                            "minSpendAmount",
                            e.target.value.replace(/[^\d.]/g, ""),
                          )
                        }
                      />
                    </Field>
                    <Field
                      label={t("orgs.rs.t.bottles")}
                      error={errText(tableErrors.bottlesIncluded)}
                    >
                      <input
                        inputMode="numeric"
                        className={input}
                        value={tableForm.values.bottlesIncluded}
                        onChange={(e) =>
                          setT(
                            "bottlesIncluded",
                            e.target.value.replace(/\D/g, ""),
                          )
                        }
                      />
                    </Field>
                    <Field
                      label={t("orgs.rs.t.arrival")}
                      error={errText(tableErrors.arrivalDeadlineTime)}
                    >
                      <input
                        type="time"
                        className={input}
                        value={tableForm.values.arrivalDeadlineTime}
                        onChange={(e) =>
                          setT("arrivalDeadlineTime", e.target.value)
                        }
                      />
                    </Field>
                    <Field label={t("orgs.rs.t.paymentMode")}>
                      <select
                        className={`${input} bg-black`}
                        value={tableForm.values.paymentMode}
                        onChange={(e) =>
                          setT(
                            "paymentMode",
                            e.target.value as TableForm["paymentMode"],
                          )
                        }
                      >
                        {PAYMENT_MODES.map((m) => (
                          <option key={m} value={m}>
                            {t(`orgs.rs.pm.${m}`)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {tableForm.values.paymentMode === "FIXED_DEPOSIT" ? (
                      <Field
                        label={t("orgs.rs.t.fixed")}
                        error={errText(tableErrors.fixedDepositAmount)}
                      >
                        <input
                          inputMode="decimal"
                          className={input}
                          value={tableForm.values.fixedDepositAmount}
                          onChange={(e) =>
                            setT(
                              "fixedDepositAmount",
                              e.target.value.replace(/[^\d.]/g, ""),
                            )
                          }
                        />
                      </Field>
                    ) : null}
                    {tableForm.values.paymentMode === "PERCENT_DEPOSIT" ? (
                      <Field
                        label={t("orgs.rs.t.percent")}
                        error={errText(tableErrors.depositPercent)}
                      >
                        <input
                          inputMode="numeric"
                          className={input}
                          value={tableForm.values.depositPercent}
                          onChange={(e) =>
                            setT(
                              "depositPercent",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                        />
                      </Field>
                    ) : null}
                    <Field label={t("orgs.rs.t.color")}>
                      <input
                        type="color"
                        className="h-10 w-full rounded-2xl border border-white/15 bg-transparent"
                        value={tableForm.values.color}
                        onChange={(e) => setT("color", e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-5 text-sm text-white/80">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tableForm.values.requiresApproval}
                        onChange={(e) =>
                          setT("requiresApproval", e.target.checked)
                        }
                      />
                      {t("orgs.rs.t.requiresApproval")}
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tableForm.values.isActive}
                        onChange={(e) => setT("isActive", e.target.checked)}
                      />
                      {t("orgs.rs.t.active")}
                    </label>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className={primaryButton}
                      disabled={busy === "table"}
                      onClick={saveTable}
                    >
                      {t("orgs.rs.t.save")}
                    </button>
                    <button
                      type="button"
                      className={pillButton}
                      onClick={() => setTableForm(null)}
                    >
                      {t("orgs.common.cancel")}
                    </button>
                  </div>
                </div>
              ) : canEdit ? (
                <button
                  type="button"
                  className={`${pillButton} mt-4`}
                  onClick={() => {
                    setTableErrors({});
                    setTableForm({ areaId: area.id, values: emptyTable() });
                  }}
                >
                  {t("orgs.rs.addTable")}
                </button>
              ) : null}
            </Card>
          ))}
        </div>
      )}
      <span className="sr-only">{org.name}</span>
    </div>
  );
}
