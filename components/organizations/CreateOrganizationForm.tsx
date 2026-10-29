"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

export function CreateOrganizationForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [city, setCity] = useState("");
  // Resultado de la comprobación remota, ligado al identificador que se comprobó.
  const [remote, setRemote] = useState<{
    slug: string;
    state: "available" | "taken" | "invalid";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Evita dobles envíos aunque el estado aún no se haya repintado.
  const inFlight = useRef(false);

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
  const canSubmit = nameOk && slugState === "available" && !submitting;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: normalizeOrgSlug(slug),
          city: city.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.organization?.slug) {
        router.replace(`/organizations/${data.organization.slug}?created=1`);
        return;
      }
      if (res.status === 401) {
        router.replace("/login?next=/organizations/new");
        return;
      }
      if (data?.code === "slugTaken") {
        setRemote({ slug: normalizeOrgSlug(slug), state: "taken" });
      }
      setError(
        data?.code === "forbidden"
          ? t("orgs.form.forbidden")
          : data?.code === "limitReached"
            ? t("orgs.form.limitReached")
            : data?.code === "slugTaken"
              ? t("orgs.form.taken")
              : data?.code === "invalid"
                ? t("orgs.form.invalidSlug")
                : data?.code === "connect"
                  ? t("orgs.form.connect")
                  : t("orgs.form.generic"),
      );
    } catch {
      setError(t("orgs.form.connect"));
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
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

      <FloatingInput
        id="org-city"
        label={t("orgs.form.city")}
        value={city}
        maxLength={80}
        autoComplete="address-level2"
        onChange={(e) => setCity(e.target.value)}
        labelClassName="bg-black"
      />

      {error ? (
        <p
          role="alert"
          className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      ) : null}

      <ShimmerButton type="submit" disabled={!canSubmit} aria-busy={submitting}>
        {submitting ? t("orgs.form.submitting") : t("orgs.form.submit")}
      </ShimmerButton>
    </form>
  );
}
