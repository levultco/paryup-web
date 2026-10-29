"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import { OrgAvatar, OrgName } from "@/components/organizations/OrgAvatar";
import {
  Card,
  Notice,
  PageHeader,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { orgFetch } from "@/lib/org-api";
import { ORG_PERMISSIONS } from "@/lib/organizations";
import { SOCIAL_PLATFORMS } from "@/lib/social";

const MAX_BYTES = 12 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const BIO_MAX = 240;

type Draft = {
  name: string;
  bio: string;
  city: string;
  logo: string;
  banner: string;
  links: Record<string, string>;
};

const clean = (links: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(links)
      .map(([k, v]) => [k, v.trim()] as const)
      .filter(([, v]) => v),
  );

async function imageSize(
  file: File,
): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

const inputClass =
  "w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/60 disabled:cursor-not-allowed disabled:opacity-50";

export function ProfileEditor() {
  const { t } = useI18n();
  const { slug, org, can, patchOrg } = useOrg();
  const canEdit = can(ORG_PERMISSIONS.profileEdit);

  const initial = (): Draft => ({
    name: org.name,
    bio: org.bio ?? "",
    city: org.city ?? "",
    logo: org.logo ?? "",
    banner: org.banner ?? "",
    links: { ...(org.socialLinks ?? {}) },
  });
  const [draft, setDraft] = useState<Draft>(initial);
  const [saved, setSaved] = useState<Draft>(initial);
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ block: "center" });
  }, []);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setMessage(null);
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const dirty =
    draft.name.trim() !== saved.name ||
    draft.bio.trim() !== saved.bio ||
    draft.city.trim() !== saved.city ||
    draft.logo !== saved.logo ||
    draft.banner !== saved.banner ||
    JSON.stringify(clean(draft.links)) !== JSON.stringify(clean(saved.links));
  const nameOk =
    draft.name.trim().length >= 2 && draft.name.trim().length <= 80;

  const upload = async (
    kind: "logo" | "banner",
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!TYPES.includes(file.type))
      return setMessage({ tone: "error", text: t("orgs.pf.errType") });
    if (file.size > MAX_BYTES)
      return setMessage({ tone: "error", text: t("orgs.pf.errSize") });

    setMessage(null);
    setUploading(kind);
    try {
      const { width, height } = await imageSize(file);
      if (width > 8192 || height > 8192) {
        setMessage({ tone: "error", text: t("orgs.pf.errDims") });
        return;
      }
      const form = new FormData();
      form.set("file", file);
      form.set("kind", kind);
      form.set("width", String(width));
      form.set("height", String(height));
      const res = await fetch(
        `/api/organizations/${encodeURIComponent(slug)}/media`,
        {
          method: "POST",
          body: form,
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        const text =
          data?.code === "type"
            ? t("orgs.pf.errType")
            : data?.code === "size"
              ? t("orgs.pf.errSize")
              : data?.code === "forbidden"
                ? t("orgs.pf.errForbidden")
                : t("orgs.pf.errUpload");
        setMessage({ tone: "error", text });
        return;
      }
      setDraft((d) => ({ ...d, [kind]: data.url }));
    } catch {
      setMessage({ tone: "error", text: t("orgs.pf.errUpload") });
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!dirty || !nameOk || saving) return;
    setSaving(true);
    setMessage(null);
    const body: Record<string, unknown> = {};
    if (draft.name.trim() !== saved.name) body.name = draft.name.trim();
    if (draft.bio.trim() !== saved.bio) body.bio = draft.bio.trim();
    if (draft.city.trim() !== saved.city) body.city = draft.city.trim();
    if (draft.logo !== saved.logo) body.logo = draft.logo;
    if (draft.banner !== saved.banner) body.banner = draft.banner;
    if (
      JSON.stringify(clean(draft.links)) !== JSON.stringify(clean(saved.links))
    ) {
      body.socialLinks = clean(draft.links);
    }
    const res = await orgFetch<{ organization?: Record<string, unknown> }>(
      slug,
      "profile",
      {
        method: "PATCH",
        body,
      },
    );
    setSaving(false);
    if (!res.ok) {
      setMessage({
        tone: "error",
        text:
          res.status === 403 ? t("orgs.pf.errForbidden") : t("orgs.pf.errSave"),
      });
      return;
    }
    const next: Draft = {
      ...draft,
      name: draft.name.trim(),
      bio: draft.bio.trim(),
      city: draft.city.trim(),
      links: clean(draft.links),
    };
    setDraft(next);
    setSaved(next);
    patchOrg({
      name: next.name,
      bio: next.bio || null,
      city: next.city || null,
      logo: next.logo || null,
      banner: next.banner || null,
      socialLinks: Object.keys(next.links).length ? next.links : null,
    });
    setMessage({ tone: "success", text: t("orgs.pf.saved") });
  };

  const discard = () => {
    setDraft(saved);
    setMessage(null);
  };

  const previewLinks = SOCIAL_PLATFORMS.filter((p) =>
    draft.links[p.id]?.trim(),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("orgs.pf.title")} subtitle={t("orgs.pf.subtitle")} />
      {!canEdit ? <Notice tone="error">{t("orgs.pf.readOnly")}</Notice> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <Card title={t("orgs.pf.images")}>
            <div id="banner" className="scroll-mt-32">
              <p className="mb-2 text-sm text-white/55">
                {t("orgs.field.banner")}
              </p>
              <div className="relative h-32 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.02] sm:h-40">
                {draft.banner ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft.banner}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
                {uploading === "banner" ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white">
                    {t("orgs.pf.uploading")}
                  </span>
                ) : null}
              </div>
              {canEdit ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className={pillButton}
                    disabled={!!uploading}
                    onClick={() => bannerInput.current?.click()}
                  >
                    {t("orgs.pf.changeBanner")}
                  </button>
                  {draft.banner ? (
                    <button
                      type="button"
                      className={pillButton}
                      disabled={!!uploading}
                      onClick={() => set("banner", "")}
                    >
                      {t("orgs.pf.remove")}
                    </button>
                  ) : null}
                  <input
                    ref={bannerInput}
                    type="file"
                    accept={TYPES.join(",")}
                    hidden
                    onChange={(e) => upload("banner", e)}
                  />
                </div>
              ) : null}
            </div>

            <div id="logo" className="mt-6 scroll-mt-32">
              <p className="mb-2 text-sm text-white/55">
                {t("orgs.field.logo")}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <span className="relative">
                  <OrgAvatar
                    org={{
                      name: draft.name || org.name,
                      logo: draft.logo || null,
                    }}
                    size={80}
                  />
                  {uploading === "logo" ? (
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-[10px] text-white">
                      …
                    </span>
                  ) : null}
                </span>
                {canEdit ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={pillButton}
                      disabled={!!uploading}
                      onClick={() => logoInput.current?.click()}
                    >
                      {t("orgs.pf.changeLogo")}
                    </button>
                    {draft.logo ? (
                      <button
                        type="button"
                        className={pillButton}
                        disabled={!!uploading}
                        onClick={() => set("logo", "")}
                      >
                        {t("orgs.pf.remove")}
                      </button>
                    ) : null}
                    <input
                      ref={logoInput}
                      type="file"
                      accept={TYPES.join(",")}
                      hidden
                      onChange={(e) => upload("logo", e)}
                    />
                  </div>
                ) : null}
              </div>
              {canEdit ? (
                <p className="mt-3 text-xs text-white/40">
                  {t("orgs.pf.imageHint")}
                </p>
              ) : null}
            </div>
          </Card>

          <Card title={t("orgs.pf.info")}>
            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-sm text-white/55">
                {t("orgs.pf.name")}
                <input
                  className={inputClass}
                  value={draft.name}
                  maxLength={80}
                  disabled={!canEdit}
                  onChange={(e) => set("name", e.target.value)}
                  aria-invalid={!nameOk}
                />
                {!nameOk ? (
                  <span className="text-xs text-red-400">
                    {t("orgs.pf.errName")}
                  </span>
                ) : null}
              </label>
              <label
                id="bio"
                className="flex scroll-mt-32 flex-col gap-2 text-sm text-white/55"
              >
                {t("orgs.pf.bio")}
                <textarea
                  className={`${inputClass} min-h-28 resize-y`}
                  value={draft.bio}
                  maxLength={BIO_MAX}
                  disabled={!canEdit}
                  onChange={(e) => set("bio", e.target.value)}
                />
                <span className="self-end text-xs text-white/35">
                  {draft.bio.length}/{BIO_MAX}
                </span>
              </label>
              <label
                id="city"
                className="flex scroll-mt-32 flex-col gap-2 text-sm text-white/55"
              >
                {t("orgs.pf.city")}
                <input
                  className={inputClass}
                  value={draft.city}
                  maxLength={80}
                  disabled={!canEdit}
                  onChange={(e) => set("city", e.target.value)}
                />
              </label>
            </div>
          </Card>

          <Card id="links" title={t("orgs.pf.links")}>
            <div className="flex flex-col gap-3">
              {SOCIAL_PLATFORMS.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 text-sm text-white/55"
                >
                  <span className="w-24 shrink-0">{p.name}</span>
                  <input
                    className={inputClass}
                    value={draft.links[p.id] ?? ""}
                    maxLength={2000}
                    placeholder={t("orgs.pf.linkPlaceholder")}
                    disabled={!canEdit}
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(e) =>
                      set("links", { ...draft.links, [p.id]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
          </Card>

          {canEdit ? (
            <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-full border border-white/10 bg-black/80 p-2 pl-4 backdrop-blur">
              <div className="min-w-0 flex-1 text-sm" aria-live="polite">
                {message ? (
                  <span
                    className={
                      message.tone === "error"
                        ? "text-red-300"
                        : "text-emerald-300"
                    }
                  >
                    {message.text}
                  </span>
                ) : (
                  <span className="text-white/40">{dirty ? "●" : ""}</span>
                )}
              </div>
              <button
                type="button"
                className={pillButton}
                disabled={!dirty || saving}
                onClick={discard}
              >
                {t("orgs.pf.discard")}
              </button>
              <button
                type="button"
                className={primaryButton}
                disabled={!dirty || !nameOk || saving || !!uploading}
                onClick={save}
                aria-busy={saving}
              >
                {saving ? t("orgs.pf.saving") : t("orgs.pf.save")}
              </button>
            </div>
          ) : null}
        </div>

        <aside className="xl:sticky xl:top-32 xl:self-start">
          <p className="mb-2 text-sm text-white/45">{t("orgs.pf.preview")}</p>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-raised">
            <div className="h-24 bg-gradient-to-br from-white/[0.12] to-white/[0.02]">
              {draft.banner ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.banner}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="p-5">
              <span className="-mt-14 block w-fit rounded-full border-4 border-[#0e0e0e]">
                <OrgAvatar
                  org={{
                    name: draft.name || org.name,
                    logo: draft.logo || null,
                  }}
                  size={72}
                />
              </span>
              <p className="font-display mt-3 text-xl font-semibold text-white">
                <OrgName
                  org={{
                    name: draft.name.trim() || org.name,
                    isVerified: org.isVerified,
                  }}
                />
              </p>
              <p className="text-sm text-white/45">
                @{org.slug}
                {draft.city.trim() ? ` · ${draft.city.trim()}` : ""}
              </p>
              {draft.bio.trim() ? (
                <p className="mt-3 text-sm text-white/70">{draft.bio.trim()}</p>
              ) : null}
              {previewLinks.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {previewLinks.map((p) => (
                    <span
                      key={p.id}
                      className="rounded-full px-3 py-1 text-xs"
                      style={{ background: p.color, color: p.textColor }}
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-xs text-white/40">
            {t("orgs.pf.verifiedNote")}
          </p>
        </aside>
      </div>
    </div>
  );
}
