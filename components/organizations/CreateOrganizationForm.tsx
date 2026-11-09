"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FloatingInput } from "@/components/watermelon/floating-input";
import { ShimmerButton } from "@/components/watermelon/shimmer-button";
import { useI18n } from "@/components/i18n/LocaleProvider";
import {
  ORG_SLUG_REGEX,
  normalizeOrgSlug,
  slugFromName,
} from "@/lib/organizations";

type SlugState = "idle" | "checking" | "available" | "taken" | "invalid";

export type OrgDraft = { name: string; slug: string };

/** Paso 1: solo recoge los datos; la organización se crea al terminar el último paso. */
export function CreateOrganizationForm({
  initial,
  onNext,
}: {
  initial: OrgDraft | null;
  onNext: (draft: OrgDraft) => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  // Resultado de la comprobación remota, ligado al identificador que se comprobó.
  const [remote, setRemote] = useState<{
    slug: string;
    state: "available" | "taken" | "invalid";
  } | null>(null);

  const onName = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugFromName(value));
  };

  const normalizedSlug = normalizeOrgSlug(slug);
  const slugState: SlugState = !normalizedSlug
    ? "idle"
    : !ORG_SLUG_REGEX.test(normalizedSlug)
      ? "invalid"
      : remote?.slug === normalizedSlug
        ? remote.state
        : "checking";

  useEffect(() => {
    if (!ORG_SLUG_REGEX.test(normalizedSlug)) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(
        `/api/organizations/slug-available?slug=${encodeURIComponent(normalizedSlug)}`,
        { signal: controller.signal },
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data) return;
          setRemote({
            slug: normalizedSlug,
            state: !data.valid
              ? "invalid"
              : data.available
                ? "available"
                : "taken",
          });
        })
        .catch(() => {});
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [normalizedSlug]);

  const nameOk = name.trim().length >= 2 && name.trim().length <= 80;
  const canSubmit = nameOk && slugState === "available";

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onNext({ name: name.trim(), slug: normalizeOrgSlug(slug) });
  };

  const slugMessage =
    slugState === "checking"
      ? { text: t("orgs.form.checking"), tone: "text-white/45" }
      : slugState === "available"
        ? { text: t("orgs.form.available"), tone: "text-emerald-400" }
        : slugState === "taken"
          ? { text: t("orgs.form.taken"), tone: "text-red-400" }
          : slugState === "invalid"
            ? { text: t("orgs.form.invalidSlug"), tone: "text-red-400" }
            : slug
              ? null
              : null;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex w-full max-w-md flex-col gap-6"
    >
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">
          {t("orgs.form.title")}
        </h1>
        <p className="mt-2 text-white/55">{t("orgs.form.subtitle")}</p>
      </div>

      <FloatingInput
        id="org-name"
        label={t("orgs.form.name")}
        value={name}
        maxLength={80}
        autoComplete="organization"
        autoFocus
        onChange={(e) => onName(e.target.value)}
        labelClassName="bg-black"
      />

      <div>
        <FloatingInput
          id="org-slug"
          label={t("orgs.form.slug")}
          value={slug}
          maxLength={31}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          labelClassName="bg-black"
        />
        <p
          className={`mt-2 px-2 text-xs ${slugMessage?.tone ?? "text-white/45"}`}
          aria-live="polite"
        >
          {slugMessage?.text ??
            t("orgs.form.slugHint", { slug: normalizeOrgSlug(slug) || "…" })}
        </p>
      </div>

      <ShimmerButton type="submit" disabled={!canSubmit}>
        {t("orgs.form.next")}
      </ShimmerButton>
    </form>
  );
}
