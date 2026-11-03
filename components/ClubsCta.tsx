"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/LocaleProvider";

/**
 * Pantalla para que las salas y los promotores se den de alta. Usa la misma atmósfera que
 * el hero de Backstage (la captura de la app desenfocada y virada a violeta), de lado a lado
 * y con las esquinas redondeadas.
 */
export default function ClubsCta() {
  const { t } = useI18n();
  return (
    <section
      id="salas"
      className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden rounded-[36px] bg-black px-[clamp(1.25rem,3vw,3.5rem)] py-[clamp(5rem,10vw,9rem)] text-center text-white md:rounded-[56px]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-[-12%] h-[120%] w-[150%] max-w-[2200px] -translate-x-1/2 bg-cover bg-top opacity-[0.7]"
          style={{
            backgroundImage: "url(/app/home.webp)",
            filter: "blur(70px) saturate(1.7) hue-rotate(200deg)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_45%,transparent,rgba(0,0,0,0.55)_70%,#000_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-t from-transparent to-black" />
        <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-b from-transparent to-black" />
      </div>

      <div className="mx-auto max-w-3xl">
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.18em] text-white/60">
          {t("clubs.eyebrow")}
        </p>
        <h2 className="font-display text-[clamp(2.75rem,6.5vw,6.5rem)] font-bold leading-[0.92]">
          {t("clubs.title1")}
          <br />
          <span className="text-white/55">{t("clubs.title2")}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-[46ch] text-lg leading-relaxed text-white/65 md:text-xl">
          {t("clubs.text")}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/backstage"
            className="inline-flex h-14 items-center rounded-full bg-white px-8 text-base font-semibold text-black transition-transform duration-300 hover:scale-[1.03]"
          >
            {t("clubs.cta")}
          </Link>
          <Link
            href="/backstage"
            className="inline-flex h-14 items-center rounded-full border border-white/10 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:border-white/25 hover:bg-white/20"
          >
            {t("clubs.more")}
          </Link>
        </div>
      </div>
    </section>
  );
}
