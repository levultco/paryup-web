"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { ImageSlot } from "@/components/organizations/image-slot";
import { ShimmerButton } from "@/components/watermelon/shimmer-button";
import { orgFetch } from "@/lib/org-api";

const MAX_BYTES = 12 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

async function imageSize(file: File) {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

type Picked = { file: File; url: string } | null;

/** Paso final: logo y banner opcionales. La organización se crea aquí, al terminar. */
export function CreateOrganizationPhotos({
  slug,
  name,
  onBack,
}: {
  slug: string;
  name: string;
  onBack: (slugTaken?: boolean) => void;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [logo, setLogo] = useState<Picked>(null);
  const [banner, setBanner] = useState<Picked>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const pick = async (kind: "logo" | "banner", file: File) => {
    if (!TYPES.includes(file.type)) return setError(t("orgs.pf.errType"));
    if (file.size > MAX_BYTES) return setError(t("orgs.pf.errSize"));
    try {
      const { width, height } = await imageSize(file);
      if (width > 8192 || height > 8192) return setError(t("orgs.pf.errDims"));
    } catch {
      return setError(t("orgs.pf.errUpload"));
    }
    setError(null);
    const next = { file, url: URL.createObjectURL(file) };
    (kind === "logo" ? setLogo : setBanner)((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return next;
    });
  };

  const uploadOne = async (kind: "logo" | "banner", picked: Picked) => {
    if (!picked) return null;
    try {
      const { width, height } = await imageSize(picked.file);
      const form = new FormData();
      form.set("file", picked.file);
      form.set("kind", kind);
      form.set("width", String(width));
      form.set("height", String(height));
      const res = await fetch(
        `/api/organizations/${encodeURIComponent(slug)}/media`,
        { method: "POST", body: form },
      );
      const data = await res.json().catch(() => null);
      return res.ok && data?.url ? (data.url as string) : null;
    } catch {
      return null;
    }
  };

  /** Crea la organización y, si hay imágenes, las sube y guarda en el perfil. */
  const finish = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401) return router.replace("/login?next=/new");
      if (!res.ok || !data?.organization?.slug) {
        if (data?.code === "slugTaken") return onBack(true);
        return setError(
          data?.code === "forbidden"
            ? t("orgs.form.forbidden")
            : data?.code === "limitReached"
              ? t("orgs.form.limitReached")
              : data?.code === "invalid"
                ? t("orgs.form.invalidSlug")
                : t("orgs.form.generic"),
        );
      }
      const createdSlug = data.organization.slug as string;
      if (logo || banner) {
        const [logoUrl, bannerUrl] = await Promise.all([
          uploadOne("logo", logo),
          uploadOne("banner", banner),
        ]);
        const body = {
          ...(logoUrl ? { logo: logoUrl } : {}),
          ...(bannerUrl ? { banner: bannerUrl } : {}),
        };
        // Si algo falla la organización ya existe: se pueden añadir luego desde el perfil.
        if (Object.keys(body).length) {
          await orgFetch(createdSlug, "profile", { method: "PATCH", body });
        }
      }
      router.replace(`/${createdSlug}?created=1`);
    } catch {
      setError(t("orgs.form.connect"));
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  };

  const hasImage = !!(logo || banner);
  const finishButton = saving ? t("orgs.form.submitting") : t("orgs.form.submit");

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">
          {t("orgs.photos.title")}
        </h1>
        <p className="mt-2 text-white/55">{t("orgs.photos.subtitle")}</p>
      </div>

      <div>
        <ImageSlot
          flat
          src={banner?.url}
          title={t("orgs.img.banner")}
          hint={t("orgs.img.hintBanner")}
          className="aspect-[2/1] w-full"
          emptyClassName="pb-12"
          onFile={(file) => pick("banner", file)}
          onRemove={() => setBanner(null)}
        />
        <div className="flex flex-col items-center px-4 text-center">
          <ImageSlot
            flat
            circle
            src={logo?.url}
            title={t("orgs.img.logo")}
            className="-mt-10 h-20 w-20 shrink-0 border-4 border-black bg-black"
            onFile={(file) => pick("logo", file)}
          />
          <p className="font-display mt-3 text-xl font-semibold text-white">
            {name}
          </p>
          <p className="text-sm text-white/60">@{slug}</p>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {hasImage ? (
          <ShimmerButton
            type="button"
            onClick={finish}
            disabled={saving}
            aria-busy={saving}
          >
            {finishButton}
          </ShimmerButton>
        ) : null}
        <button
          type="button"
          onClick={finish}
          disabled={saving}
          className={`h-12 rounded-full text-[15px] font-medium transition-[background-color,transform] duration-100 active:scale-[0.97] disabled:opacity-50 ${
            hasImage
              ? "text-white/60 hover:text-white"
              : "bg-white/10 text-white hover:bg-white/15"
          }`}
        >
          {saving && !hasImage ? t("orgs.form.submitting") : t("orgs.photos.skip")}
        </button>
      </div>
    </div>
  );
}
