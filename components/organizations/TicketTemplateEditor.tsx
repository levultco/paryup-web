"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import {
  Card,
  Notice,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import {
  EDITABLE_TICKET_TYPES,
  END_WITHOUT_VALUE,
  RELEASE_TYPES,
  SALE_END_TYPES,
  SALE_START_TYPES,
  START_WITHOUT_VALUE,
  VISIBILITIES,
  buildSaleRule,
  buildTemplateRules,
  catalogErrorKey,
  type SalesMode,
  type SaleEndType,
  type SaleStartType,
  type TicketTemplate,
  type TicketType,
  type TicketVisibility,
} from "@/lib/catalog";
import { orgFetch } from "@/lib/org-api";
import type { ReservedArea } from "@/lib/reserved";
import { ORG_PERMISSIONS } from "@/lib/organizations";

type Rule<T extends string> = { type: T | ""; value: string };
type ReleaseDraft = {
  id?: string;
  name: string;
  price: string;
  capacity: string;
  isActive: boolean;
  start: Rule<SaleStartType>;
  end: Rule<SaleEndType>;
};

const input =
  "w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/60 disabled:cursor-not-allowed disabled:opacity-50";
const select = `${input} bg-black`;

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string | null;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-white/55">
      {label}
      {children}
      {error ? (
        <span className="text-xs text-red-400">{error}</span>
      ) : hint ? (
        <span className="text-xs text-white/35">{hint}</span>
      ) : null}
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-white/80">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

function RuleEditor<T extends string>({
  label,
  rule,
  options,
  prefix,
  withoutValue,
  disabled,
  onChange,
}: {
  label: string;
  rule: Rule<T>;
  options: readonly T[];
  prefix: string;
  withoutValue: readonly string[];
  disabled?: boolean;
  onChange: (rule: Rule<T>) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-2 text-sm text-white/55">
      {label}
      <div className="flex gap-2">
        <select
          className={select}
          value={rule.type}
          disabled={disabled}
          onChange={(e) =>
            onChange({ type: e.target.value as T | "", value: rule.value })
          }
        >
          <option value="">{t("orgs.cat.ed.noRule")}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {t(`${prefix}.${o}`)}
            </option>
          ))}
        </select>
        {rule.type && !withoutValue.includes(rule.type) ? (
          <input
            inputMode="numeric"
            className={`${input} w-24`}
            aria-label={t("orgs.cat.ed.value")}
            value={rule.value}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                type: rule.type,
                value: e.target.value.replace(/\D/g, ""),
              })
            }
          />
        ) : null}
      </div>
    </div>
  );
}

const blankRule = <T extends string>(): Rule<T> => ({ type: "", value: "" });
const toRule = <T extends string>(
  r?: { type?: string; value?: number } | null,
): Rule<T> => ({
  type: (r?.type as T) ?? "",
  value: r?.value !== undefined ? String(r.value) : "",
});
const bool = (v: unknown, fallback = false) =>
  typeof v === "boolean" ? v : fallback;

export function TicketTemplateEditor({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const { slug, can } = useOrg();
  const isEdit = !!templateId;
  const base = `/organizations/${slug}/catalog`;
  const allowed = can(ORG_PERMISSIONS.ticketTemplatesManage);

  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(false);
  const [areas, setAreas] = useState<ReservedArea[]>([]);
  const [areaId, setAreaId] = useState("");
  const [tableId, setTableId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<TicketType>("GENERAL");
  const [visibility, setVisibility] = useState<TicketVisibility>("PUBLIC");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [price, setPrice] = useState("0");
  const [capacity, setCapacity] = useState("");
  const [salesMode, setSalesMode] = useState<SalesMode>("SIMPLE");
  const [releases, setReleases] = useState<ReleaseDraft[]>([]);
  const [start, setStart] = useState<Rule<SaleStartType>>(blankRule());
  const [end, setEnd] = useState<Rule<SaleEndType>>(blankRule());
  const [priorityAccess, setPriorityAccess] = useState(false);
  const [includesDrink, setIncludesDrink] = useState(false);
  const [list, setList] = useState({
    askFirstName: true,
    askLastName: true,
    askEmail: false,
    askPhone: false,
    allowFreeEntry: false,
  });
  const [vip, setVip] = useState({
    priorityAccess: false,
    vipAreaAccess: false,
    includesDrink: false,
    premiumEntry: false,
    requiresVenueValidation: false,
    benefitsSummary: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    let active = true;
    orgFetch<{ areas: ReservedArea[] }>(slug, "reserved-areas").then((res) => {
      if (active && res.ok) setAreas(res.data?.areas ?? []);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!templateId) return;
    let active = true;
    orgFetch<{ ticketTypes: TicketTemplate[] }>(slug, "ticket-types").then(
      (res) => {
        if (!active) return;
        const tpl = res.data?.ticketTypes.find((x) => x.id === templateId);
        if (!res.ok || !tpl) {
          setLoadError(true);
          setLoading(false);
          return;
        }
        const rules = (tpl.templateRules ?? {}) as Record<
          string,
          Record<string, unknown>
        >;
        setAreaId(
          String(
            (rules.reserved as { reservedAreaId?: string } | undefined)
              ?.reservedAreaId ?? "",
          ),
        );
        setTableId(
          String(
            (rules.reserved as { reservedTableTypeId?: string } | undefined)
              ?.reservedTableTypeId ?? "",
          ),
        );
        setName(tpl.name);
        setType((tpl.type ?? "GENERAL") as TicketType);
        setVisibility((tpl.visibility ?? "PUBLIC") as TicketVisibility);
        setDescription(tpl.description ?? "");
        setIsActive(tpl.isActive);
        setPrice(String(tpl.price));
        setCapacity(tpl.capacity ? String(tpl.capacity) : "");
        setSalesMode(tpl.salesMode);
        setReleases(
          tpl.releases.map((r) => ({
            id: r.id,
            name: r.name,
            price: String(r.price),
            capacity: String(r.capacity),
            isActive: r.isActive !== false,
            start: toRule(r.saleStartRule),
            end: toRule(r.saleEndRule),
          })),
        );
        setStart(
          toRule(
            rules.general?.saleStartRule as { type?: string; value?: number },
          ),
        );
        setEnd(
          toRule(
            rules.general?.saleEndRule as { type?: string; value?: number },
          ),
        );
        setPriorityAccess(bool(rules.general?.priorityAccess));
        setIncludesDrink(bool(rules.general?.includesDrink));
        setList((l) => ({
          ...l,
          ...Object.fromEntries(
            Object.keys(l).map((k) => [
              k,
              bool(rules.list?.[k], l[k as keyof typeof l]),
            ]),
          ),
        }));
        setVip((v) => ({
          ...v,
          ...Object.fromEntries(
            Object.keys(v)
              .filter((k) => k !== "benefitsSummary")
              .map((k) => [k, bool(rules.vip?.[k])]),
          ),
          benefitsSummary: String(rules.vip?.benefitsSummary ?? ""),
        }));
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [slug, templateId]);

  const supportsReleases = RELEASE_TYPES.includes(type);
  const releasesOn = salesMode === "RELEASES" && supportsReleases;
  const freeList = type === "LIST" && list.allowFreeEntry;

  const patchRelease = (index: number, patch: Partial<ReleaseDraft>) =>
    setReleases((rs) =>
      rs.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = t("orgs.cat.ed.errName");
    if (type === "RESERVED" && !areas.some((a) => a.id === areaId))
      next.area = t("orgs.cat.ed.errArea");
    if (
      !releasesOn &&
      !freeList &&
      type !== "RESERVED" &&
      !(Number(price) >= 0 && price !== "")
    )
      next.price = t("orgs.cat.ed.errPrice");
    if (!releasesOn && capacity.trim() && !/^[1-9]\d*$/.test(capacity.trim()))
      next.capacity = t("orgs.cat.ed.errCapacity");
    if (releasesOn) {
      const active = releases.filter((r) => r.isActive);
      const bad = releases.some(
        (r) =>
          !r.name.trim() ||
          r.price === "" ||
          Number(r.price) < 0 ||
          !/^[1-9]\d*$/.test(r.capacity.trim()),
      );
      if (active.length === 0 || bad)
        next.releases = t("orgs.cat.ed.errReleases");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (inFlight.current || !allowed || !validate()) return;
    inFlight.current = true;
    setSaving(true);
    setMessage(null);

    const rules = buildTemplateRules({
      type,
      startType: start.type,
      startValue: start.value,
      endType: end.type,
      endValue: end.value,
      priorityAccess,
      includesDrink,
      list,
      vip,
      reserved: {
        areaId,
        tableId,
        tableIds: (areas.find((a) => a.id === areaId)?.tableTypes ?? [])
          .filter((x) => x.isActive)
          .map((x) => x.id),
      },
    });
    const body: Record<string, unknown> = {
      name: name.trim(),
      type,
      visibility,
      description: description.trim() || undefined,
      currency: "EUR",
      isActive,
      salesMode: releasesOn ? "RELEASES" : "SIMPLE",
      templateRules: rules,
    };
    if (releasesOn) {
      const rows = releases.map((r, i) => ({
        ...(r.id ? { id: r.id } : {}),
        name: r.name.trim(),
        price: Number(r.price),
        capacity: Number(r.capacity),
        sortOrder: i,
        isActive: r.isActive,
        saleStartRule: buildSaleRule(
          r.start.type,
          r.start.value,
          START_WITHOUT_VALUE,
        ),
        saleEndRule: buildSaleRule(r.end.type, r.end.value, END_WITHOUT_VALUE),
      }));
      body.releases = rows;
      // Igual que la app: el precio es el de la primera fase activa y el cupo la suma.
      body.price = rows.find((r) => r.isActive)?.price ?? 0;
      body.capacity = rows
        .filter((r) => r.isActive)
        .reduce((sum, r) => sum + r.capacity, 0);
    } else {
      body.price = freeList || type === "RESERVED" ? 0 : Number(price);
      body.capacity = capacity.trim()
        ? Number(capacity.trim())
        : isEdit
          ? null
          : undefined;
    }

    const res = await orgFetch<{ ticketType?: { id: string } }>(
      slug,
      isEdit ? `ticket-types/${templateId}` : "ticket-types",
      {
        method: isEdit ? "PATCH" : "POST",
        body,
      },
    );
    inFlight.current = false;
    setSaving(false);
    if (!res.ok)
      return setMessage({
        tone: "error",
        text: t(catalogErrorKey(res.status, res.data)),
      });
    router.replace(base);
  };

  if (loading)
    return (
      <div
        aria-hidden
        className="h-96 animate-pulse rounded-3xl bg-white/[0.06]"
      />
    );
  if (loadError) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-white/55">{t("orgs.cat.ed.loadError")}</p>
        <Link href={base} className={pillButton}>
          {t("orgs.cat.ed.back")}
        </Link>
      </div>
    );
  }

  const disabled = !allowed;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link
        href={base}
        className="text-sm text-white/55 transition-colors hover:text-white"
      >
        ← {t("orgs.cat.ed.back")}
      </Link>
      <h1 className="font-display text-4xl font-semibold text-white">
        {isEdit ? t("orgs.cat.ed.editTitle") : t("orgs.cat.ed.newTitle")}
      </h1>
      {isEdit ? (
        <p className="text-sm text-white/40">
          {t("orgs.cat.ed.noPropagation")}
        </p>
      ) : null}

      <Card>
        <div className="flex flex-col gap-5">
          <Field label={t("orgs.cat.ed.name")} error={errors.name}>
            <input
              className={input}
              value={name}
              maxLength={100}
              disabled={disabled}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("orgs.cat.ed.type")}>
              <select
                className={select}
                value={type}
                disabled={disabled}
                onChange={(e) => setType(e.target.value as TicketType)}
              >
                {EDITABLE_TICKET_TYPES.map((x) => (
                  <option key={x} value={x}>
                    {t(`orgs.cat.type.${x}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("orgs.cat.ed.visibility")}>
              <select
                className={select}
                value={visibility}
                disabled={disabled}
                onChange={(e) =>
                  setVisibility(e.target.value as TicketVisibility)
                }
              >
                {VISIBILITIES.map((x) => (
                  <option key={x} value={x}>
                    {t(`orgs.cat.vis.${x}`)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label={t("orgs.cat.ed.description")}>
            <textarea
              className={`${input} min-h-20 resize-y`}
              value={description}
              maxLength={500}
              disabled={disabled}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Check
            label={t("orgs.cat.ed.active")}
            checked={isActive}
            disabled={disabled}
            onChange={setIsActive}
          />
        </div>
      </Card>

      {type === "RESERVED" ? (
        <Card title={t("orgs.cat.ed.reservedArea")}>
          {areas.length === 0 ? (
            <p className="text-sm text-white/45">{t("orgs.cat.ed.noAreas")}</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("orgs.cat.ed.reservedArea")} error={errors.area}>
                <select
                  className={select}
                  value={areaId}
                  disabled={disabled}
                  onChange={(e) => {
                    setAreaId(e.target.value);
                    setTableId("");
                  }}
                >
                  <option value="">{t("orgs.cat.ed.chooseArea")}</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("orgs.cat.ed.reservedTable")}>
                <select
                  className={select}
                  value={tableId}
                  disabled={disabled || !areaId}
                  onChange={(e) => setTableId(e.target.value)}
                >
                  <option value="">{t("orgs.cat.ed.allTables")}</option>
                  {(areas.find((a) => a.id === areaId)?.tableTypes ?? [])
                    .filter((x) => x.isActive)
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                </select>
              </Field>
            </div>
          )}
        </Card>
      ) : (
        <Card title={t("orgs.cat.ed.salesMode")}>
          <div className="flex flex-col gap-5">
            {supportsReleases ? (
              <div
                role="radiogroup"
                className="flex w-fit rounded-full border border-white/15 p-1"
              >
                {(["SIMPLE", "RELEASES"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    role="radio"
                    aria-checked={salesMode === mode}
                    disabled={disabled}
                    onClick={() => {
                      setSalesMode(mode);
                      if (mode === "RELEASES" && releases.length === 0) {
                        setReleases([
                          {
                            name: "",
                            price: "",
                            capacity: "",
                            isActive: true,
                            start: blankRule(),
                            end: blankRule(),
                          },
                        ]);
                      }
                    }}
                    className={`rounded-full px-4 py-1.5 text-sm ${salesMode === mode ? "bg-white text-black" : "text-white/60"}`}
                  >
                    {t(`orgs.cat.ed.mode.${mode}`)}
                  </button>
                ))}
              </div>
            ) : null}

            {releasesOn ? (
              <div className="flex flex-col gap-4">
                {errors.releases ? (
                  <p className="text-xs text-red-400">{errors.releases}</p>
                ) : null}
                {releases.map((r, i) => (
                  <div
                    key={r.id ?? i}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-[1fr_7rem_7rem]">
                      <Field label={t("orgs.cat.ed.releaseName")}>
                        <input
                          className={input}
                          value={r.name}
                          disabled={disabled}
                          onChange={(e) =>
                            patchRelease(i, { name: e.target.value })
                          }
                        />
                      </Field>
                      <Field label={t("orgs.cat.ed.price")}>
                        <input
                          inputMode="decimal"
                          className={input}
                          value={r.price}
                          disabled={disabled}
                          onChange={(e) =>
                            patchRelease(i, {
                              price: e.target.value.replace(/[^\d.]/g, ""),
                            })
                          }
                        />
                      </Field>
                      <Field label={t("orgs.cat.ed.capacity")}>
                        <input
                          inputMode="numeric"
                          className={input}
                          value={r.capacity}
                          disabled={disabled}
                          onChange={(e) =>
                            patchRelease(i, {
                              capacity: e.target.value.replace(/\D/g, ""),
                            })
                          }
                        />
                      </Field>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <RuleEditor
                        label={t("orgs.cat.ed.saleStart")}
                        rule={r.start}
                        options={SALE_START_TYPES}
                        prefix="orgs.cat.rule.start"
                        withoutValue={START_WITHOUT_VALUE}
                        disabled={disabled}
                        onChange={(start) => patchRelease(i, { start })}
                      />
                      <RuleEditor
                        label={t("orgs.cat.ed.saleEnd")}
                        rule={r.end}
                        options={SALE_END_TYPES}
                        prefix="orgs.cat.rule.end"
                        withoutValue={END_WITHOUT_VALUE}
                        disabled={disabled}
                        onChange={(end) => patchRelease(i, { end })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Check
                        label={t("orgs.cat.tk.active")}
                        checked={r.isActive}
                        disabled={disabled}
                        onChange={(v) => patchRelease(i, { isActive: v })}
                      />
                      {releases.length > 1 && !disabled ? (
                        <button
                          type="button"
                          className={pillButton}
                          onClick={() =>
                            setReleases((rs) =>
                              rs.filter((_, idx) => idx !== i),
                            )
                          }
                        >
                          {t("orgs.cat.ed.removeRelease")}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
                {!disabled ? (
                  <button
                    type="button"
                    className={`${pillButton} w-fit`}
                    onClick={() =>
                      setReleases((rs) => [
                        ...rs,
                        {
                          name: "",
                          price: "",
                          capacity: "",
                          isActive: true,
                          start: blankRule(),
                          end: blankRule(),
                        },
                      ])
                    }
                  >
                    {t("orgs.cat.ed.addRelease")}
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {freeList ? null : (
                  <Field label={t("orgs.cat.ed.price")} error={errors.price}>
                    <input
                      inputMode="decimal"
                      className={input}
                      value={price}
                      disabled={disabled}
                      onChange={(e) =>
                        setPrice(e.target.value.replace(/[^\d.]/g, ""))
                      }
                    />
                  </Field>
                )}
                <Field
                  label={t("orgs.cat.ed.capacity")}
                  error={errors.capacity}
                  hint={t("orgs.cat.ed.capacityHint")}
                >
                  <input
                    inputMode="numeric"
                    className={input}
                    value={capacity}
                    disabled={disabled}
                    onChange={(e) =>
                      setCapacity(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </Field>
              </div>
            )}
          </div>
        </Card>
      )}

      {releasesOn ? null : (
        <Card title={t("orgs.cat.ed.saleRules")}>
          <div className="grid gap-5 sm:grid-cols-2">
            <RuleEditor
              label={t("orgs.cat.ed.saleStart")}
              rule={start}
              options={SALE_START_TYPES}
              prefix="orgs.cat.rule.start"
              withoutValue={START_WITHOUT_VALUE}
              disabled={disabled}
              onChange={setStart}
            />
            <RuleEditor
              label={t("orgs.cat.ed.saleEnd")}
              rule={end}
              options={SALE_END_TYPES}
              prefix="orgs.cat.rule.end"
              withoutValue={END_WITHOUT_VALUE}
              disabled={disabled}
              onChange={setEnd}
            />
          </div>
        </Card>
      )}

      <Card title={t("orgs.cat.ed.options")}>
        <div className="flex flex-col gap-3">
          {type === "GENERAL" || type === "EARLY_BIRD" ? (
            <>
              <Check
                label={t("orgs.cat.opt.priorityAccess")}
                checked={priorityAccess}
                disabled={disabled}
                onChange={setPriorityAccess}
              />
              <Check
                label={t("orgs.cat.opt.includesDrink")}
                checked={includesDrink}
                disabled={disabled}
                onChange={setIncludesDrink}
              />
            </>
          ) : null}
          {type === "LIST"
            ? (
                [
                  "askFirstName",
                  "askLastName",
                  "askEmail",
                  "askPhone",
                  "allowFreeEntry",
                ] as const
              ).map((k) => (
                <Check
                  key={k}
                  label={t(`orgs.cat.opt.${k}`)}
                  checked={list[k]}
                  disabled={disabled}
                  onChange={(v) => setList((l) => ({ ...l, [k]: v }))}
                />
              ))
            : null}
          {type === "VIP" ? (
            <>
              {(
                [
                  "priorityAccess",
                  "vipAreaAccess",
                  "includesDrink",
                  "premiumEntry",
                  "requiresVenueValidation",
                ] as const
              ).map((k) => (
                <Check
                  key={k}
                  label={t(`orgs.cat.opt.${k}`)}
                  checked={vip[k]}
                  disabled={disabled}
                  onChange={(v) => setVip((x) => ({ ...x, [k]: v }))}
                />
              ))}
              <Field label={t("orgs.cat.opt.benefits")}>
                <textarea
                  className={`${input} min-h-20 resize-y`}
                  value={vip.benefitsSummary}
                  maxLength={300}
                  disabled={disabled}
                  onChange={(e) =>
                    setVip((x) => ({ ...x, benefitsSummary: e.target.value }))
                  }
                />
              </Field>
            </>
          ) : null}
        </div>
      </Card>

      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
      {!disabled ? (
        <div>
          <button
            type="button"
            className={primaryButton}
            disabled={saving}
            aria-busy={saving}
            onClick={save}
          >
            {saving ? t("orgs.cat.ed.saving") : t("orgs.cat.ed.save")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
