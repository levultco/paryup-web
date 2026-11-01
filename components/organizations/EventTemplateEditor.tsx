"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import { Card, pillButton, primaryButton } from "@/components/organizations/ui";
import {
  catalogErrorKey,
  type EventTemplate,
  type TicketTemplate,
} from "@/lib/catalog";
import { orgFetch } from "@/lib/org-api";
import { ORG_PERMISSIONS } from "@/lib/organizations";
import { Select } from "@/components/organizations/select";
import { Segmented, SwitchRow } from "@/components/organizations/promoters-ui";
import { normalizeFlyer } from "@/lib/flyer-crop";
import { FormSkeleton } from "@/components/organizations/skeletons";
import { ImageSlot } from "@/components/organizations/image-slot";
import { Flash } from "@/components/organizations/flash";
import { ArrowLeftIcon } from "@/components/icons/solar";

type Loc = {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
};

const input =
  "w-full rounded-xl bg-white/[0.07] px-3.5 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-white/30 focus:bg-white/[0.11] focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-[13px] font-medium text-white/50">
      {label}
      {children}
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

export function EventTemplateEditor({
  templateId,
  onDone,
}: {
  templateId?: string;
  /** Si se pasa, el editor va incrustado en un diálogo: al guardar avisa en vez de navegar. */
  onDone?: () => void;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const { slug, can } = useOrg();
  const isEdit = !!templateId;
  const base = `/organizations/${slug}/catalog/events`;
  const allowed = isEdit
    ? can(ORG_PERMISSIONS.eventsEdit)
    : can(ORG_PERMISSIONS.eventsCreate);

  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [locMode, setLocMode] = useState<"saved" | "custom">("custom");
  const [locationId, setLocationId] = useState("");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [ticketIds, setTicketIds] = useState<string[]>([]);
  const [locations, setLocations] = useState<Loc[]>([]);
  const [tickets, setTickets] = useState<TicketTemplate[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const [locs, tks] = await Promise.all([
        orgFetch<{ locations: Loc[] }>(slug, "locations"),
        can(ORG_PERMISSIONS.ticketTemplatesManage)
          ? orgFetch<{ ticketTypes: TicketTemplate[] }>(slug, "ticket-types")
          : Promise.resolve(null),
      ]);
      if (!active) return;
      const locList = locs.data?.locations ?? [];
      setLocations(locList);
      setTickets((tks?.data?.ticketTypes ?? []).filter((x) => x.isActive));
      if (!templateId) return;
      const res = await orgFetch<
        { eventTemplate?: EventTemplate } & Partial<EventTemplate>
      >(slug, `event-templates/${templateId}`);
      if (!active) return;
      const tpl = (res.data?.eventTemplate ?? res.data) as
        EventTemplate | undefined;
      if (!res.ok || !tpl?.id) {
        setLoadError(true);
        setLoading(false);
        return;
      }
      setTemplateName(tpl.templateName);
      setEventName(tpl.eventName ?? "");
      setDescription(tpl.description ?? "");
      setImageUrl(tpl.imageUrl ?? "");
      const orgLoc = tpl.location?.organizationLocationId;
      if (orgLoc && locList.some((l) => l.id === orgLoc)) {
        setLocMode("saved");
        setLocationId(orgLoc);
      } else {
        setLocMode("custom");
        setLocationName(tpl.location?.locationName ?? "");
        setAddress(tpl.location?.address ?? "");
      }
      setStartTime(tpl.startTime ?? "");
      setEndTime(tpl.endTime ?? "");
      setTicketIds(tpl.ticketTypeIds ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [slug, templateId, can]);

  const upload = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return setMessage({ tone: "error", text: t("orgs.pf.errType") });
    if (file.size > 12 * 1024 * 1024)
      return setMessage({ tone: "error", text: t("orgs.pf.errSize") });
    setUploading(true);
    setMessage(null);
    try {
      const probe = await createImageBitmap(file);
      const tooBig = probe.width > 8192 || probe.height > 8192;
      probe.close();
      if (tooBig) throw new Error("dims");
      const flyer = await normalizeFlyer(file);
      const data = new FormData();
      data.set("file", flyer.file);
      data.set("kind", "template");
      data.set("width", String(flyer.width));
      data.set("height", String(flyer.height));
      const res = await fetch(
        `/api/organizations/${encodeURIComponent(slug)}/media`,
        { method: "POST", body: data },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.url) throw new Error("upload");
      setImageUrl(json.url);
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

  const save = async () => {
    if (inFlight.current || !allowed) return;
    const loc = locations.find((l) => l.id === locationId);
    const location =
      locMode === "saved" && loc
        ? {
            locationName: loc.name,
            address: loc.address,
            latitude: loc.latitude,
            longitude: loc.longitude,
            organizationLocationId: loc.id,
          }
        : locationName.trim() || address.trim()
          ? {
              locationName: locationName.trim() || address.trim(),
              address: address.trim() || undefined,
            }
          : null;
    const next: Record<string, string> = {};
    if (!templateName.trim()) next.name = t("orgs.cat.et.errName");
    else if (
      !imageUrl &&
      !description.trim() &&
      !location &&
      !ticketIds.length &&
      !startTime &&
      !endTime
    )
      next.name = t("orgs.cat.et.errEmpty");
    setErrors(next);
    if (Object.keys(next).length) return;

    inFlight.current = true;
    setSaving(true);
    setMessage(null);
    const res = await orgFetch(
      slug,
      isEdit ? `event-templates/${templateId}` : "event-templates",
      {
        method: isEdit ? "PATCH" : "POST",
        body: {
          templateName: templateName.trim(),
          eventName: eventName.trim() || undefined,
          description: description.trim() || undefined,
          imageUrl: imageUrl || undefined,
          location,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          ticketTypeIds: ticketIds,
          applyImage: !!imageUrl,
          applyDescription: !!description.trim(),
          applyLocation: !!location,
          applyTickets: ticketIds.length > 0,
          applyTimes: !!(startTime || endTime),
        },
      },
    );
    inFlight.current = false;
    setSaving(false);
    if (!res.ok)
      return setMessage({
        tone: "error",
        text: t(catalogErrorKey(res.status, res.data)),
      });
    if (onDone) onDone();
    else router.replace(base);
  };

  if (loading) return <FormSkeleton sections={2} />;
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

  return (
    <div className={`flex flex-col gap-6 ${onDone ? "" : "max-w-3xl"}`}>
      {onDone ? null : (
        <>
          <Link
            href={base}
            className="inline-flex w-fit items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeftIcon aria-hidden className="h-4 w-4" />
            {t("orgs.cat.ed.back")}
          </Link>
          <h1 className="font-display text-4xl font-semibold text-white">
            {isEdit ? t("orgs.cat.et.editTitle") : t("orgs.cat.et.newTitle")}
          </h1>
        </>
      )}

      <Card>
        <div className="flex flex-col gap-5">
          <Field label={t("orgs.cat.et.templateName")} error={errors.name}>
            <input
              className={input}
              value={templateName}
              maxLength={120}
              disabled={!allowed}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </Field>
          <Field label={t("orgs.cat.et.eventName")}>
            <input
              className={input}
              value={eventName}
              maxLength={120}
              disabled={!allowed}
              onChange={(e) => setEventName(e.target.value)}
            />
          </Field>
          <Field label={t("orgs.ed.description")}>
            <textarea
              className={`${input} min-h-24 resize-y`}
              value={description}
              maxLength={5000}
              disabled={!allowed}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <div>
            <p className="mb-2 text-sm text-white/55">
              {t("orgs.cat.et.image")}
            </p>
            <ImageSlot
              className="aspect-[4/5] w-full max-w-[220px]"
              src={imageUrl}
              title={t("orgs.img.template")}
              hint={t("orgs.img.hintFlyer")}
              uploading={uploading}
              disabled={!allowed}
              onFile={upload}
              onRemove={() => setImageUrl("")}
            />
          </div>
        </div>
      </Card>

      <Card title={t("orgs.ed.where")}>
        <div className="flex flex-col gap-5">
          {locations.length > 0 ? (
            <Segmented
              label={t("orgs.ed.savedLocation")}
              value={locMode}
              disabled={!allowed}
              onChange={setLocMode}
              options={(["saved", "custom"] as const).map((mode) => ({
                value: mode,
                label: t(
                  mode === "saved"
                    ? "orgs.ed.savedLocation"
                    : "orgs.ed.customLocation",
                ),
              }))}
            />
          ) : null}
          {locMode === "saved" && locations.length > 0 ? (
            <Field label={t("orgs.ed.savedLocation")}>
              <Select
                className="w-full"
                dimEmpty
                value={locationId}
                disabled={!allowed}
                label={t("orgs.ed.chooseLocation")}
                onChange={setLocationId}
                options={[
                  { value: "", label: t("orgs.ed.chooseLocation") },
                  ...locations.map((l) => ({
                    value: l.id,
                    label: `${l.name} · ${l.address}`,
                  })),
                ]}
              />
            </Field>
          ) : (
            <>
              <Field label={t("orgs.ed.locationName")}>
                <input
                  className={input}
                  value={locationName}
                  maxLength={200}
                  disabled={!allowed}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </Field>
              <Field label={t("orgs.ed.address")}>
                <input
                  className={input}
                  value={address}
                  maxLength={300}
                  disabled={!allowed}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Field>
            </>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("orgs.cat.et.startTime")}>
              <input
                type="time"
                className={input}
                value={startTime}
                disabled={!allowed}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </Field>
            <Field label={t("orgs.cat.et.endTime")}>
              <input
                type="time"
                className={input}
                value={endTime}
                disabled={!allowed}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card title={t("orgs.cat.et.tickets")}>
        {tickets.length === 0 ? (
          <p className="text-sm text-white/45">{t("orgs.cat.et.noTickets")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tickets.map((tpl) => (
              <li key={tpl.id}>
                <SwitchRow
                  label={
                    <>
                      {tpl.name}
                      <span className="ml-2 text-xs text-white/40">
                        {tpl.type ? t(`orgs.cat.type.${tpl.type}`) : ""}
                      </span>
                    </>
                  }
                  checked={ticketIds.includes(tpl.id)}
                  disabled={!allowed}
                  onChange={(on) =>
                    setTicketIds((ids) =>
                      on ? [...ids, tpl.id] : ids.filter((x) => x !== tpl.id),
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Flash message={message} />
      {allowed ? (
        <div
          className={
            onDone ? "pointer-events-none sticky bottom-5 z-10" : undefined
          }
        >
          <button
            type="button"
            className={`${primaryButton} ${onDone ? "pointer-events-auto w-full shadow-[0_10px_30px_rgba(0,0,0,0.55)]" : ""}`}
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
