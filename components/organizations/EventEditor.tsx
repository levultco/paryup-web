"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { StatusBadge } from "@/components/organizations/EventsList";
import { useOrg } from "@/components/organizations/OrgShell";
import {
  Card,
  Notice,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { zonedToUtcISO, utcToZonedInput } from "@/lib/datetime";
import { DISCOVERY_TZ } from "@/lib/discovery";
import type { EventTemplate } from "@/lib/catalog";
import { eventErrorKey, MIN_AGES, type EventStatus } from "@/lib/events-admin";
import { priceLabel } from "@/lib/format";
import type { SalesSummary } from "@/lib/sales";
import { intlLocale } from "@/lib/i18n";
import { ORG_PERMISSIONS } from "@/lib/organizations";

const MAX_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type RawEvent = {
  id?: string;
  name?: string;
  description?: string | null;
  coverImage?: string | null;
  date?: string;
  endDate?: string | null;
  organizationLocationId?: string | null;
  location?: string | null;
  address?: string | null;
  isPublic?: boolean;
  capacity?: number | null;
  minAge?: number | null;
  status: EventStatus;
  eventTickets?: {
    id: string;
    ticketType?: { name?: string };
    priceOverride?: number;
    capacityOverride?: number | null;
    isVisible?: boolean;
    minPurchase?: number;
    maxPurchase?: number;
    saleStart?: string | null;
    saleEnd?: string | null;
  }[];
};

/** La API devuelve el evento tal cual; se acepta también `{ event }`. */
const unwrap = (data: unknown): RawEvent =>
  ((data as { event?: RawEvent } | null)?.event ?? data) as RawEvent;

type Loc = { id: string; name: string; address: string };
type Template = {
  id: string;
  name: string;
  type: string | null;
  price: number;
  capacity: number | null;
  isActive: boolean;
};
type EventTicket = {
  id: string;
  name: string;
  price: string;
  capacity: string;
  isVisible: boolean;
  minPurchase: string;
  maxPurchase: string;
  saleStart: string;
  saleEnd: string;
};
type Form = {
  name: string;
  description: string;
  coverImage: string;
  start: string;
  end: string;
  locMode: "saved" | "custom";
  locationId: string;
  locationName: string;
  address: string;
  isPublic: boolean;
  capacity: string;
  minAge: string;
};

const EMPTY: Form = {
  name: "",
  description: "",
  coverImage: "",
  start: "",
  end: "",
  locMode: "custom",
  locationId: "",
  locationName: "",
  address: "",
  isPublic: true,
  capacity: "",
  minAge: "",
};

const input =
  "w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/60 disabled:cursor-not-allowed disabled:opacity-50";

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

async function api<T = unknown>(
  slug: string,
  path: string,
  init: { method?: string; body?: unknown } = {},
) {
  try {
    const res = await fetch(
      `/api/organizations/${encodeURIComponent(slug)}/${path}`,
      {
        method: init.method ?? "GET",
        ...(init.body !== undefined
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(init.body),
            }
          : {}),
      },
    );
    const data = (await res.json().catch(() => null)) as T | null;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null as T | null };
  }
}

function toForm(event: RawEvent): Form {
  return {
    name: event.name ?? "",
    description: event.description ?? "",
    coverImage: event.coverImage ?? "",
    start: utcToZonedInput(event.date, DISCOVERY_TZ),
    end: utcToZonedInput(event.endDate, DISCOVERY_TZ),
    locMode: event.organizationLocationId ? "saved" : "custom",
    locationId: event.organizationLocationId ?? "",
    locationName: event.organizationLocationId ? "" : (event.location ?? ""),
    address: event.organizationLocationId ? "" : (event.address ?? ""),
    isPublic: event.isPublic !== false,
    capacity: event.capacity ? String(event.capacity) : "",
    minAge: event.minAge ? String(event.minAge) : "",
  };
}

function toTickets(event: RawEvent): EventTicket[] {
  return (event.eventTickets ?? []).map((t) => ({
    id: t.id,
    name: t.ticketType?.name ?? "",
    price: String(t.priceOverride ?? 0),
    capacity: t.capacityOverride ? String(t.capacityOverride) : "",
    isVisible: t.isVisible !== false,
    minPurchase: String(t.minPurchase ?? 1),
    maxPurchase: String(t.maxPurchase ?? 10),
    saleStart: utcToZonedInput(t.saleStart, DISCOVERY_TZ),
    saleEnd: utcToZonedInput(t.saleEnd, DISCOVERY_TZ),
  }));
}

export function EventEditor({ eventId }: { eventId?: string }) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { slug, org, can } = useOrg();
  const base = `/organizations/${slug}/events`;
  const isEdit = !!eventId;

  const [form, setForm] = useState<Form>(EMPTY);
  const [baseline, setBaseline] = useState<Form>(EMPTY);
  const [status, setStatus] = useState<EventStatus>("DRAFT");
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [ticketBaseline, setTicketBaseline] = useState<EventTicket[]>([]);
  const [locations, setLocations] = useState<Loc[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [picked, setPicked] = useState<
    Record<string, { price: string; capacity: string }>
  >({});
  const [addTemplate, setAddTemplate] = useState("");
  const [eventTemplates, setEventTemplates] = useState<EventTemplate[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
    settings?: boolean;
  } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"cancel" | "delete" | null>(null);
  const [uploading, setUploading] = useState(false);
  const coverInput = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);

  const canEdit = isEdit
    ? can(ORG_PERMISSIONS.eventsEdit)
    : can(ORG_PERMISSIONS.eventsCreate);
  const canPublish = can(ORG_PERMISSIONS.eventsPublish);
  const canCancel = can(ORG_PERMISSIONS.eventsCancel);
  const canDelete = can(ORG_PERMISSIONS.eventsDelete);
  const canTickets = can(ORG_PERMISSIONS.ticketTemplatesManage);
  const [hasSales, setHasSales] = useState(false);
  const [now] = useState(() => Date.now());
  // Fecha guardada (no la que se está editando): un evento ya terminado no se cancela.
  const savedEnd = baseline.end || baseline.start;
  const savedEndIso = savedEnd ? zonedToUtcISO(savedEnd, DISCOVERY_TZ) : null;
  const isPast =
    isEdit && !!savedEndIso && new Date(savedEndIso).getTime() < now;
  const readOnly = !canEdit || status === "CANCELLED" || status === "COMPLETED";

  const load = useCallback(async () => {
    if (!eventId) return;
    const res = await api(slug, `events/${eventId}`);
    if (!res.ok || !res.data) {
      setLoadError(true);
      setLoading(false);
      return;
    }
    const event = unwrap(res.data);
    const next = toForm(event);
    setForm(next);
    setBaseline(next);
    setStatus(event.status);
    const list = toTickets(event);
    setTickets(list);
    setTicketBaseline(list);
    setLoading(false);
  }, [eventId, slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  // Con ventas no se puede cancelar: se avisa antes de que el backend lo rechace.
  useEffect(() => {
    if (!eventId || !can(ORG_PERMISSIONS.statsView)) return;
    let active = true;
    api<SalesSummary>(slug, `events/${eventId}/sales`).then((res) => {
      const totals = res.data?.totals;
      if (active && totals)
        setHasSales(totals.ticketsSold > 0 || totals.pendingOrders > 0);
    });
    return () => {
      active = false;
    };
  }, [eventId, slug, can]);

  useEffect(() => {
    let active = true;
    api<{ locations: Loc[] }>(slug, "locations").then((res) => {
      if (active && res.ok) setLocations(res.data?.locations ?? []);
    });
    if (!eventId) {
      api<{ eventTemplates: EventTemplate[] }>(slug, "event-templates").then(
        (res) => {
          if (active && res.ok)
            setEventTemplates(res.data?.eventTemplates ?? []);
        },
      );
    }
    if (canTickets) {
      api<{ ticketTypes: Template[] }>(slug, "ticket-types").then((res) => {
        if (active && res.ok)
          setTemplates((res.data?.ticketTypes ?? []).filter((x) => x.isActive));
      });
    }
    return () => {
      active = false;
    };
  }, [slug, canTickets, eventId]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setMessage(null);
    setErrors((e) => ({ ...e, [key]: undefined }));
    setForm((f) => ({ ...f, [key]: value }));
  };
  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);

  // Igual que la app: la plantilla rellena el formulario, no crea nada por sí sola.
  const applyEventTemplate = (id: string) => {
    const tpl = eventTemplates.find((x) => x.id === id);
    if (!tpl) return;
    setMessage(null);
    setForm((f) => {
      const next = { ...f };
      if (tpl.eventName) next.name = tpl.eventName;
      if (tpl.description) next.description = tpl.description;
      if (tpl.imageUrl) next.coverImage = tpl.imageUrl;
      const loc = tpl.location;
      if (loc) {
        if (
          loc.organizationLocationId &&
          locations.some((l) => l.id === loc.organizationLocationId)
        ) {
          next.locMode = "saved";
          next.locationId = loc.organizationLocationId;
        } else {
          next.locMode = "custom";
          next.locationName = loc.locationName;
          next.address = loc.address ?? "";
        }
      }
      if (tpl.startTime) {
        const day =
          f.start.slice(0, 10) ||
          utcToZonedInput(
            new Date(Date.now() + 864e5).toISOString(),
            DISCOVERY_TZ,
          ).slice(0, 10);
        next.start = `${day}T${tpl.startTime}`;
        if (tpl.endTime) {
          const endDay =
            tpl.endTime <= tpl.startTime
              ? new Date(new Date(`${day}T12:00:00Z`).getTime() + 864e5)
                  .toISOString()
                  .slice(0, 10)
              : day;
          next.end = `${endDay}T${tpl.endTime}`;
        }
      }
      return next;
    });
    if (tpl.ticketTypeIds.length) {
      setPicked(
        Object.fromEntries(
          tpl.ticketTypeIds
            .filter((tid) => templates.some((x) => x.id === tid))
            .map((tid) => [tid, { price: "", capacity: "" }]),
        ),
      );
    }
    setMessage({ tone: "success", text: t("orgs.ed.templateApplied") });
  };

  const validate = (forPublish: boolean) => {
    const next: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length > 120)
      next.name = t("orgs.ed.errName");
    if (!form.description.trim())
      next.description = t("orgs.ed.errDescription");
    const startIso = zonedToUtcISO(form.start, DISCOVERY_TZ);
    if (!startIso) next.start = t("orgs.ed.errStart");
    const endIso = form.end ? zonedToUtcISO(form.end, DISCOVERY_TZ) : null;
    if (form.end && (!endIso || (startIso && endIso <= startIso)))
      next.end = t("orgs.ed.errEnd");
    const loc = locations.find((l) => l.id === form.locationId);
    if (form.locMode === "saved" ? !loc : !form.locationName.trim())
      next.location = t("orgs.ed.errLocation");
    if (form.capacity.trim() && !/^[1-9]\d*$/.test(form.capacity.trim()))
      next.capacity = t("orgs.ed.errCapacity");
    if (forPublish && !isEdit && Object.keys(picked).length === 0)
      next.tickets = t("orgs.ed.errTickets");
    setErrors(next);
    return { ok: Object.keys(next).length === 0, startIso, endIso, loc };
  };

  const fail = (res: { status: number; data: unknown }) => {
    const key = eventErrorKey(res.status, res.data);
    setMessage({
      tone: "error",
      text: t(key),
      settings: key === "orgs.ev.err.payments",
    });
  };

  const body = (startIso: string | null, endIso: string | null, loc?: Loc) => ({
    name: form.name.trim(),
    description: form.description.trim(),
    date: startIso,
    endDate: endIso ?? (isEdit ? null : undefined),
    location: form.locMode === "saved" ? loc?.name : form.locationName.trim(),
    address:
      form.locMode === "saved"
        ? loc?.address
        : form.address.trim() || undefined,
    organizationLocationId: form.locMode === "saved" ? loc?.id : undefined,
    capacity: form.capacity.trim()
      ? Number(form.capacity.trim())
      : isEdit
        ? null
        : undefined,
    minAge: form.minAge ? Number(form.minAge) : isEdit ? null : undefined,
    isPublic: form.isPublic,
    coverImage: form.coverImage || (isEdit ? null : undefined),
  });

  const saveEvent = async (mode: "draft" | "publish" | "update") => {
    if (inFlight.current) return null;
    const v = validate(mode === "publish");
    if (!v.ok) return null;
    inFlight.current = true;
    setBusy(mode);
    setMessage(null);
    const payload: Record<string, unknown> = body(v.startIso, v.endIso, v.loc);
    if (!isEdit) {
      payload.status = mode === "publish" ? "PUBLISHED" : "DRAFT";
      payload.tickets = Object.entries(picked).map(([ticketTypeId, o]) => ({
        ticketTypeId,
        ...(o.price.trim() !== "" ? { priceOverride: Number(o.price) } : {}),
        ...(o.capacity.trim() !== ""
          ? { capacityOverride: Number(o.capacity) }
          : {}),
      }));
    }
    const res = await api(slug, isEdit ? `events/${eventId}` : "events", {
      method: isEdit ? "PATCH" : "POST",
      body: payload,
    });
    inFlight.current = false;
    setBusy(null);
    if (!res.ok) {
      fail(res);
      return null;
    }
    return unwrap(res.data);
  };

  const onCreate = async (mode: "draft" | "publish") => {
    const event = await saveEvent(mode);
    if (event?.id) router.replace(`${base}/${event.id}`);
  };

  const onUpdate = async () => {
    const event = await saveEvent("update");
    if (!event) return false;
    await load();
    setMessage({ tone: "success", text: t("orgs.ed.saved") });
    return true;
  };

  const onSave = async () => {
    if (await onUpdate()) router.push(`${base}/${eventId}`);
  };

  const onPublish = async () => {
    if (dirty && !(await onUpdate())) return;
    setBusy("publish");
    const res = await api(slug, `events/${eventId}/publish`, {
      method: "POST",
      body: {},
    });
    setBusy(null);
    if (!res.ok) return fail(res);
    router.push(`${base}/${eventId}`);
  };

  const onStatusAction = async (action: "cancel" | "delete") => {
    setBusy(action);
    const res =
      action === "cancel"
        ? await api(slug, `events/${eventId}/cancel`, {
            method: "POST",
            body: {},
          })
        : await api(slug, `events/${eventId}`, { method: "DELETE" });
    setBusy(null);
    setConfirm(null);
    if (!res.ok) return fail(res);
    router.replace(action === "delete" ? base : `${base}/${eventId}`);
  };

  const uploadCover = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_BYTES) {
      return setMessage({
        tone: "error",
        text: t(file.size > MAX_BYTES ? "orgs.pf.errSize" : "orgs.pf.errType"),
      });
    }
    setUploading(true);
    setMessage(null);
    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width > 8192 || bitmap.height > 8192) {
        bitmap.close();
        setMessage({ tone: "error", text: t("orgs.pf.errDims") });
        return;
      }
      const data = new FormData();
      data.set("file", file);
      data.set("kind", "cover");
      data.set("width", String(bitmap.width));
      data.set("height", String(bitmap.height));
      bitmap.close();
      const res = await fetch(
        `/api/organizations/${encodeURIComponent(slug)}/media`,
        { method: "POST", body: data },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.url) throw new Error("upload");
      set("coverImage", json.url);
    } catch {
      setMessage({ tone: "error", text: t("orgs.ed.errCover") });
    } finally {
      setUploading(false);
    }
  };

  // Entradas ya creadas (edición): operaciones sueltas, sin recrear nada.
  const ticketDirty = (ticket: EventTicket) =>
    JSON.stringify(ticket) !==
    JSON.stringify(ticketBaseline.find((x) => x.id === ticket.id));
  const patchTicket = (id: string, patch: Partial<EventTicket>) =>
    setTickets((list) =>
      list.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );

  // Solo se envían las fechas de venta que el usuario ha cambiado.
  const windowPatch = (ticket: EventTicket) => {
    const before = ticketBaseline.find((x) => x.id === ticket.id);
    const patch: { saleStart?: string; saleEnd?: string } = {};
    if (ticket.saleStart && ticket.saleStart !== before?.saleStart) {
      patch.saleStart =
        zonedToUtcISO(ticket.saleStart, DISCOVERY_TZ) ?? undefined;
    }
    if (ticket.saleEnd && ticket.saleEnd !== before?.saleEnd) {
      patch.saleEnd = zonedToUtcISO(ticket.saleEnd, DISCOVERY_TZ) ?? undefined;
    }
    return patch;
  };

  const saveTicket = async (ticket: EventTicket) => {
    setBusy(ticket.id);
    setMessage(null);
    const res = await api(slug, `events/${eventId}/ticket-types/${ticket.id}`, {
      method: "PATCH",
      body: {
        priceOverride: Number(ticket.price),
        capacityOverride: ticket.capacity.trim()
          ? Number(ticket.capacity)
          : null,
        isVisible: ticket.isVisible,
        minPurchase: Number(ticket.minPurchase),
        maxPurchase: Number(ticket.maxPurchase),
        ...windowPatch(ticket),
      },
    });
    setBusy(null);
    if (!res.ok) return fail(res);
    await load();
    setMessage({ tone: "success", text: t("orgs.ed.saved") });
  };

  const removeTicket = async (ticket: EventTicket) => {
    setBusy(ticket.id);
    const res = await api(slug, `events/${eventId}/ticket-types/${ticket.id}`, {
      method: "DELETE",
    });
    setBusy(null);
    if (!res.ok) return fail(res);
    await load();
  };

  const addTicket = async () => {
    if (!addTemplate) return;
    setBusy("add");
    const res = await api(slug, `events/${eventId}/ticket-types`, {
      method: "POST",
      body: {
        ticketTypeId: addTemplate,
        minPurchase: 1,
        maxPurchase: 10,
        isVisible: true,
      },
    });
    setBusy(null);
    if (!res.ok) return fail(res);
    setAddTemplate("");
    await load();
  };

  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale(locale), {
        timeZone: DISCOVERY_TZ,
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );

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
        <p className="text-white/55">{t("orgs.ed.loadError")}</p>
        <Link href={base} className={pillButton}>
          {t("orgs.ed.back")}
        </Link>
      </div>
    );
  }

  const startIso = zonedToUtcISO(form.start, DISCOVERY_TZ);
  const previewLocation =
    form.locMode === "saved"
      ? locations.find((l) => l.id === form.locationId)?.name
      : form.locationName.trim();
  const prices = isEdit
    ? tickets
        .filter((x) => x.isVisible && x.price !== "")
        .map((x) => Number(x.price))
    : Object.entries(picked).map(([id, o]) =>
        o.price.trim() !== ""
          ? Number(o.price)
          : (templates.find((x) => x.id === id)?.price ?? 0),
      );
  const previewPrice = prices.length
    ? priceLabel(Math.min(...prices), false, t, locale)
    : null;
  const availableTemplates = templates.filter(
    (tpl) => !tickets.some((x) => x.name === tpl.name),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={eventId ? `${base}/${eventId}` : base}
          className="text-sm text-white/55 transition-colors hover:text-white"
        >
          ← {t("orgs.ed.back")}
        </Link>
        {isEdit ? <StatusBadge status={status} /> : null}
      </div>
      <h1 className="font-display text-4xl font-semibold text-white">
        {isEdit ? t("orgs.ed.editTitle") : t("orgs.ed.newTitle")}
      </h1>
      {readOnly ? <Notice tone="error">{t("orgs.ed.readOnly")}</Notice> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          {!isEdit && eventTemplates.length > 0 && !readOnly ? (
            <Card title={t("orgs.ed.fromTemplate")}>
              <select
                className={`${input} bg-black`}
                defaultValue=""
                aria-label={t("orgs.ed.fromTemplate")}
                onChange={(e) => {
                  if (e.target.value) applyEventTemplate(e.target.value);
                  e.target.value = "";
                }}
              >
                <option value="">{t("orgs.ed.chooseEventTemplate")}</option>
                {eventTemplates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.templateName}
                  </option>
                ))}
              </select>
            </Card>
          ) : null}

          <Card title={t("orgs.ed.basics")}>
            <div className="flex flex-col gap-5">
              <Field label={t("orgs.ed.name")} error={errors.name}>
                <input
                  className={input}
                  value={form.name}
                  maxLength={120}
                  disabled={readOnly}
                  onChange={(e) => set("name", e.target.value)}
                />
              </Field>
              <Field
                label={t("orgs.ed.description")}
                error={errors.description}
              >
                <textarea
                  className={`${input} min-h-32 resize-y`}
                  value={form.description}
                  maxLength={5000}
                  disabled={readOnly}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
              <div>
                <p className="mb-2 text-sm text-white/55">
                  {t("orgs.ed.cover")}
                </p>
                <div className="relative h-36 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.02]">
                  {form.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.coverImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  {uploading ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm">
                      {t("orgs.pf.uploading")}
                    </span>
                  ) : null}
                </div>
                {!readOnly ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className={pillButton}
                      disabled={uploading}
                      onClick={() => coverInput.current?.click()}
                    >
                      {t("orgs.ed.changeCover")}
                    </button>
                    {form.coverImage ? (
                      <button
                        type="button"
                        className={pillButton}
                        onClick={() => set("coverImage", "")}
                      >
                        {t("orgs.ed.removeCover")}
                      </button>
                    ) : null}
                    <input
                      ref={coverInput}
                      type="file"
                      hidden
                      accept={IMAGE_TYPES.join(",")}
                      onChange={uploadCover}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </Card>

          <Card title={t("orgs.ed.when")}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label={t("orgs.ed.start")}
                error={errors.start}
                hint={t("orgs.ed.tzNote")}
              >
                <input
                  type="datetime-local"
                  className={input}
                  value={form.start}
                  disabled={readOnly}
                  onChange={(e) => set("start", e.target.value)}
                />
              </Field>
              <Field label={t("orgs.ed.end")} error={errors.end}>
                <input
                  type="datetime-local"
                  className={input}
                  value={form.end}
                  disabled={readOnly}
                  onChange={(e) => set("end", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card title={t("orgs.ed.where")}>
            <div className="flex flex-col gap-5">
              {locations.length > 0 ? (
                <div
                  role="radiogroup"
                  className="flex w-fit rounded-full border border-white/15 p-1"
                >
                  {(["saved", "custom"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      role="radio"
                      aria-checked={form.locMode === mode}
                      disabled={readOnly}
                      onClick={() => set("locMode", mode)}
                      className={`rounded-full px-4 py-1.5 text-sm ${form.locMode === mode ? "bg-white text-black" : "text-white/60"}`}
                    >
                      {t(
                        mode === "saved"
                          ? "orgs.ed.savedLocation"
                          : "orgs.ed.customLocation",
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/40">
                  {t("orgs.ed.noSavedLocations")}
                </p>
              )}
              {form.locMode === "saved" && locations.length > 0 ? (
                <Field
                  label={t("orgs.ed.savedLocation")}
                  error={errors.location}
                >
                  <select
                    className={`${input} bg-black`}
                    value={form.locationId}
                    disabled={readOnly}
                    onChange={(e) => set("locationId", e.target.value)}
                  >
                    <option value="">{t("orgs.ed.chooseLocation")}</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} · {l.address}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <>
                  <Field
                    label={t("orgs.ed.locationName")}
                    error={errors.location}
                  >
                    <input
                      className={input}
                      value={form.locationName}
                      maxLength={200}
                      disabled={readOnly}
                      onChange={(e) => set("locationName", e.target.value)}
                    />
                  </Field>
                  <Field label={t("orgs.ed.address")}>
                    <input
                      className={input}
                      value={form.address}
                      maxLength={300}
                      disabled={readOnly}
                      onChange={(e) => set("address", e.target.value)}
                    />
                  </Field>
                </>
              )}
            </div>
          </Card>

          <Card title={t("orgs.ed.access")}>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field
                label={t("orgs.ed.visibility")}
                hint={t("orgs.ed.visibilityHint")}
              >
                <select
                  className={`${input} bg-black`}
                  value={form.isPublic ? "1" : "0"}
                  disabled={readOnly}
                  onChange={(e) => set("isPublic", e.target.value === "1")}
                >
                  <option value="1">{t("orgs.ed.public")}</option>
                  <option value="0">{t("orgs.ed.privateOpt")}</option>
                </select>
              </Field>
              <Field
                label={t("orgs.ed.capacity")}
                error={errors.capacity}
                hint={t("orgs.ed.capacityHint")}
              >
                <input
                  inputMode="numeric"
                  className={input}
                  value={form.capacity}
                  disabled={readOnly}
                  onChange={(e) =>
                    set("capacity", e.target.value.replace(/\D/g, ""))
                  }
                />
              </Field>
              <Field label={t("orgs.ed.minAge")}>
                <select
                  className={`${input} bg-black`}
                  value={form.minAge}
                  disabled={readOnly}
                  onChange={(e) => set("minAge", e.target.value)}
                >
                  <option value="">{t("orgs.ed.minAgeNone")}</option>
                  {MIN_AGES.map((age) => (
                    <option key={age} value={age}>
                      {t("orgs.ed.minAgeOption", { age })}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          <Card title={t("orgs.ed.tickets")}>
            <p className="mb-4 text-sm text-white/45">
              {t("orgs.ed.ticketsHint")}
            </p>
            {errors.tickets ? (
              <p className="mb-3 text-xs text-red-400">{errors.tickets}</p>
            ) : null}
            {isEdit ? (
              <>
                {tickets.length === 0 ? (
                  <p className="text-sm text-white/45">
                    {t("orgs.ed.noTickets")}
                  </p>
                ) : null}
                <ul className="flex flex-col divide-y divide-white/10">
                  {tickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="flex flex-col gap-3 py-4 first:pt-0"
                    >
                      <p className="font-medium text-white">{ticket.name}</p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        <Field label={t("orgs.ed.price")}>
                          <input
                            inputMode="decimal"
                            className={input}
                            value={ticket.price}
                            disabled={readOnly || !canTickets}
                            onChange={(e) =>
                              patchTicket(ticket.id, {
                                price: e.target.value.replace(/[^\d.]/g, ""),
                              })
                            }
                          />
                        </Field>
                        <Field label={t("orgs.ed.ticketCapacity")}>
                          <input
                            inputMode="numeric"
                            className={input}
                            value={ticket.capacity}
                            disabled={readOnly || !canTickets}
                            onChange={(e) =>
                              patchTicket(ticket.id, {
                                capacity: e.target.value.replace(/\D/g, ""),
                              })
                            }
                          />
                        </Field>
                        <Field label={t("orgs.ed.minPurchase")}>
                          <input
                            inputMode="numeric"
                            className={input}
                            value={ticket.minPurchase}
                            disabled={readOnly || !canTickets}
                            onChange={(e) =>
                              patchTicket(ticket.id, {
                                minPurchase: e.target.value.replace(/\D/g, ""),
                              })
                            }
                          />
                        </Field>
                        <Field label={t("orgs.ed.maxPurchase")}>
                          <input
                            inputMode="numeric"
                            className={input}
                            value={ticket.maxPurchase}
                            disabled={readOnly || !canTickets}
                            onChange={(e) =>
                              patchTicket(ticket.id, {
                                maxPurchase: e.target.value.replace(/\D/g, ""),
                              })
                            }
                          />
                        </Field>
                        <label className="flex items-end gap-2 pb-3 text-sm text-white/55">
                          <input
                            type="checkbox"
                            checked={ticket.isVisible}
                            disabled={readOnly || !canTickets}
                            onChange={(e) =>
                              patchTicket(ticket.id, {
                                isVisible: e.target.checked,
                              })
                            }
                          />
                          {t("orgs.ed.visible")}
                        </label>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label={t("orgs.ed.saleStart")}>
                          <input
                            type="datetime-local"
                            className={input}
                            value={ticket.saleStart}
                            disabled={readOnly || !canTickets}
                            onChange={(e) =>
                              patchTicket(ticket.id, {
                                saleStart: e.target.value,
                              })
                            }
                          />
                        </Field>
                        <Field label={t("orgs.ed.saleEnd")}>
                          <input
                            type="datetime-local"
                            className={input}
                            value={ticket.saleEnd}
                            disabled={readOnly || !canTickets}
                            onChange={(e) =>
                              patchTicket(ticket.id, {
                                saleEnd: e.target.value,
                              })
                            }
                          />
                        </Field>
                      </div>
                      {!readOnly && canTickets ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={primaryButton}
                            disabled={
                              !ticketDirty(ticket) || busy === ticket.id
                            }
                            onClick={() => saveTicket(ticket)}
                          >
                            {t("orgs.ed.saveTicket")}
                          </button>
                          <button
                            type="button"
                            className={pillButton}
                            disabled={busy === ticket.id}
                            onClick={() => removeTicket(ticket)}
                          >
                            {t("orgs.ed.removeTicket")}
                          </button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
                {!readOnly && canTickets && availableTemplates.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <select
                      className="h-10 rounded-full border border-white/15 bg-black px-4 text-sm text-white"
                      value={addTemplate}
                      onChange={(e) => setAddTemplate(e.target.value)}
                    >
                      <option value="">{t("orgs.ed.chooseTemplate")}</option>
                      {availableTemplates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={pillButton}
                      disabled={!addTemplate || busy === "add"}
                      onClick={addTicket}
                    >
                      {t("orgs.ed.addTicket")}
                    </button>
                  </div>
                ) : null}
              </>
            ) : templates.length === 0 ? (
              <p className="text-sm text-white/45">
                {t("orgs.ed.noTemplates")}
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-white/10">
                {templates.map((tpl) => {
                  const sel = picked[tpl.id];
                  return (
                    <li
                      key={tpl.id}
                      className="flex flex-wrap items-center gap-3 py-3 first:pt-0"
                    >
                      <label className="flex min-w-0 flex-1 items-center gap-3 text-white">
                        <input
                          type="checkbox"
                          checked={!!sel}
                          onChange={(e) =>
                            setPicked((p) => {
                              const next = { ...p };
                              if (e.target.checked)
                                next[tpl.id] = { price: "", capacity: "" };
                              else delete next[tpl.id];
                              return next;
                            })
                          }
                        />
                        <span className="truncate">{tpl.name}</span>
                        <span className="shrink-0 text-xs text-white/40">
                          {tpl.price} €
                        </span>
                      </label>
                      {sel ? (
                        <>
                          <input
                            inputMode="decimal"
                            placeholder={`${t("orgs.ed.price")} ${tpl.price}`}
                            className={`${input} w-32 py-2`}
                            value={sel.price}
                            onChange={(e) =>
                              setPicked((p) => ({
                                ...p,
                                [tpl.id]: {
                                  ...sel,
                                  price: e.target.value.replace(/[^\d.]/g, ""),
                                },
                              }))
                            }
                          />
                          <input
                            inputMode="numeric"
                            placeholder={`${t("orgs.ed.ticketCapacity")} ${tpl.capacity ?? "∞"}`}
                            className={`${input} w-32 py-2`}
                            value={sel.capacity}
                            onChange={(e) =>
                              setPicked((p) => ({
                                ...p,
                                [tpl.id]: {
                                  ...sel,
                                  capacity: e.target.value.replace(/\D/g, ""),
                                },
                              }))
                            }
                          />
                        </>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {message ? (
            <div className="flex flex-wrap items-center gap-3">
              <Notice tone={message.tone}>{message.text}</Notice>
              {message.settings ? (
                <Link
                  href={`/organizations/${slug}/settings`}
                  className={pillButton}
                >
                  {t("orgs.ed.goSettings")}
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-black/80 p-2 pl-4 backdrop-blur">
            <span className="flex-1 text-sm text-white/40" aria-live="polite">
              {dirty ? "●" : ""}
            </span>
            {confirm ? (
              <>
                <span className="text-sm text-white/70">
                  {t(
                    confirm === "cancel"
                      ? "orgs.ed.cancelConfirm"
                      : "orgs.ed.deleteConfirm",
                  )}
                </span>
                <button
                  type="button"
                  className={primaryButton}
                  disabled={!!busy}
                  onClick={() => onStatusAction(confirm)}
                >
                  {t("orgs.ed.confirm")}
                </button>
                <button
                  type="button"
                  className={pillButton}
                  onClick={() => setConfirm(null)}
                >
                  {t("orgs.ed.keep")}
                </button>
              </>
            ) : isEdit ? (
              <>
                {canDelete && status !== "COMPLETED" ? (
                  <button
                    type="button"
                    className={pillButton}
                    disabled={!!busy}
                    onClick={() => setConfirm("delete")}
                  >
                    {t("orgs.ed.deleteEvent")}
                  </button>
                ) : null}
                {canCancel &&
                !isPast &&
                (status === "PUBLISHED" || status === "DRAFT") ? (
                  <button
                    type="button"
                    className={pillButton}
                    disabled={!!busy || hasSales}
                    title={hasSales ? t("orgs.ed.cancelBlocked") : undefined}
                    onClick={() => setConfirm("cancel")}
                  >
                    {t("orgs.ed.cancelEvent")}
                  </button>
                ) : null}
                {canEdit && !readOnly ? (
                  <button
                    type="button"
                    className={pillButton}
                    disabled={!dirty || !!busy}
                    onClick={onSave}
                    aria-busy={busy === "update"}
                  >
                    {busy === "update"
                      ? t("orgs.ed.saving")
                      : t("orgs.ed.save")}
                  </button>
                ) : null}
                {status === "DRAFT" && canPublish ? (
                  <button
                    type="button"
                    className={primaryButton}
                    disabled={!!busy}
                    onClick={onPublish}
                    aria-busy={busy === "publish"}
                  >
                    {t("orgs.ed.publish")}
                  </button>
                ) : null}
              </>
            ) : canEdit ? (
              <>
                <button
                  type="button"
                  className={pillButton}
                  disabled={!!busy}
                  onClick={() => onCreate("draft")}
                  aria-busy={busy === "draft"}
                >
                  {busy === "draft"
                    ? t("orgs.ed.saving")
                    : t("orgs.ed.saveDraft")}
                </button>
                {canPublish ? (
                  <button
                    type="button"
                    className={primaryButton}
                    disabled={!!busy}
                    onClick={() => onCreate("publish")}
                    aria-busy={busy === "publish"}
                  >
                    {busy === "publish"
                      ? t("orgs.ed.saving")
                      : t("orgs.ed.publish")}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        <aside className="xl:sticky xl:top-32 xl:self-start">
          <p className="mb-3 text-sm text-white/45">{t("orgs.ed.preview")}</p>
          <div className="mx-auto w-full max-w-[20rem] xl:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-raised">
              {form.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.coverImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
                  <span className="font-display text-6xl font-semibold text-white/30">
                    {form.name.trim().charAt(0).toUpperCase() || "P"}
                  </span>
                </div>
              )}
              {previewPrice ? (
                <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                  {previewPrice}
                </span>
              ) : null}
              <span className="absolute right-3 top-3 flex gap-1.5">
                {form.minAge ? (
                  <span className="rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                    {t("orgs.ev.minAgeChip", { age: form.minAge })}
                  </span>
                ) : null}
                {!form.isPublic ? (
                  <span className="rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                    {t("orgs.ev.private")}
                  </span>
                ) : null}
              </span>
            </div>
            <div className="px-1 pt-3">
              <h3
                className={`font-display line-clamp-2 text-lg font-semibold leading-snug ${form.name.trim() ? "text-white" : "text-white/30"}`}
              >
                {form.name.trim() || t("orgs.ed.name")}
              </h3>
              <p
                className={`mt-1 truncate text-sm ${startIso || previewLocation ? "text-muted" : "text-white/30"}`}
              >
                {[
                  startIso ? dateFormat.format(new Date(startIso)) : null,
                  previewLocation,
                ]
                  .filter(Boolean)
                  .join(" · ") ||
                  `${t("orgs.ed.when")} · ${t("orgs.ed.where")}`}
              </p>
              <p className="mt-0.5 truncate text-xs text-white/40">
                {org.name}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
