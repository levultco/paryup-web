"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/LocaleProvider";

export default function NotFoundView() {
  const { t } = useI18n();

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-32 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_30%,rgba(255,255,255,0.08),transparent_70%)]"
      />
      <p
        aria-hidden
        className="font-display relative bg-gradient-to-br from-[rgb(255,176,5)] via-[rgb(250,61,29)] via-45% to-[rgb(70,138,255)] bg-clip-text text-[clamp(7rem,26vw,18rem)] font-bold leading-[0.85] text-transparent"
      >
        404
      </p>
      <h1 className="font-display relative mt-6 text-3xl font-semibold sm:text-4xl">
        {t("notFound.title")}
      </h1>
      <p className="relative mt-3 max-w-md text-base text-white/60">
        {t("notFound.text")}
      </p>
      <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-full bg-white px-7 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          {t("notFound.home")}
        </Link>
        <Link
          href="/events"
          className="inline-flex h-12 items-center rounded-full bg-secondary px-7 text-sm font-semibold transition hover:bg-white/10"
        >
          {t("notFound.events")}
        </Link>
      </div>
    </main>
  );
}
