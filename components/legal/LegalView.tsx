"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { COMPANY, LEGAL_UPDATED } from "@/lib/legal/company";
import {
  LEGAL_IDS,
  getLegalDoc,
  legalPath,
  type LegalBlock,
  type LegalId,
} from "@/lib/legal";
import { intlLocale } from "@/lib/i18n";

function CompanyBlock() {
  const { t } = useI18n();
  const rows: [string, string, string?][] = [
    [t("legal.owner"), COMPANY.legalName ?? COMPANY.brand],
    ...(COMPANY.taxId
      ? ([[t("legal.taxId"), COMPANY.taxId]] as [string, string][])
      : []),
    ...(COMPANY.address
      ? ([[t("legal.address"), COMPANY.address]] as [string, string][])
      : []),
    ...(COMPANY.registry
      ? ([[t("legal.registry"), COMPANY.registry]] as [string, string][])
      : []),
    [t("legal.email"), COMPANY.email, `mailto:${COMPANY.email}`],
    [
      t("legal.website"),
      COMPANY.website.replace(/^https?:\/\//, ""),
      COMPANY.website,
    ],
  ];

  return (
    <dl className="grid gap-x-6 gap-y-3 rounded-2xl bg-secondary p-5 text-[15px] sm:grid-cols-[10rem_1fr]">
      {rows.map(([label, value, href]) => (
        <div key={label} className="contents">
          <dt className="text-white/50">{label}</dt>
          <dd className="break-words font-medium">
            {href ? (
              <a href={href} className="underline-offset-4 hover:underline">
                {value}
              </a>
            ) : (
              value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if ("company" in block) return <CompanyBlock />;
  if ("ul" in block) {
    return (
      <ul className="space-y-2.5 pl-5 [&>li]:list-disc [&>li]:pl-1 [&>li]:marker:text-white/30">
        {block.ul.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p>{block.p}</p>;
}

/** Documento legal con índice lateral. El texto sale de `lib/legal` según el idioma elegido. */
export function LegalView({ id }: { id: LegalId }) {
  const { t, locale } = useI18n();
  const doc = getLegalDoc(locale, id);
  const [active, setActive] = useState(0);
  const count = doc.sections.length;

  // Sección activa: la última cuyo inicio ya pasó la línea de lectura. La línea baja del 35% al 100% de la
  // pantalla según avanza el scroll, para que las últimas secciones (que no llegan arriba) también se iluminen.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
      const line = window.innerHeight * (0.35 + 0.65 * progress);
      let current = -1;
      for (let i = 0; i < count; i++) {
        const el = document.getElementById(`s${i + 1}`);
        if (el && el.getBoundingClientRect().top <= line) current = i;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count]);
  const date = new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${LEGAL_UPDATED}T12:00:00Z`));

  return (
    <div className="mx-auto w-full max-w-[1100px] px-[clamp(1.25rem,3vw,2rem)] pb-28 pt-32 md:pt-40">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
          {doc.title}
        </h1>
        <p className="mt-4 text-sm text-white/50">
          {t("legal.updated", { date })}
        </p>
        <p className="mt-8 text-lg leading-8 text-white/75">{doc.intro}</p>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <nav
          aria-label={t("legal.contents")}
          className="lg:sticky lg:top-28 lg:self-start"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
            {t("legal.contents")}
          </p>
          <ol className="space-y-2 text-sm">
            {doc.sections.map((section, index) => (
              <li key={section.h}>
                <a
                  href={`#s${index + 1}`}
                  aria-current={active === index ? "true" : undefined}
                  className={`flex gap-2 transition-colors duration-300 hover:text-white ${
                    active === index
                      ? "font-medium text-white"
                      : "text-white/50"
                  }`}
                >
                  <span
                    className={`tabular-nums transition-colors duration-300 ${
                      active === index ? "text-white" : "text-white/30"
                    }`}
                  >
                    {index + 1}.
                  </span>
                  {section.h}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="max-w-3xl space-y-12">
          {doc.sections.map((section, index) => (
            <section
              key={section.h}
              id={`s${index + 1}`}
              className={`scroll-mt-28 transition-opacity duration-500 ${
                active === -1 || active === index ? "opacity-100" : "opacity-40"
              }`}
            >
              <h2 className="font-display text-2xl font-semibold">
                <span
                  className={`mr-3 tabular-nums transition-colors duration-500 ${
                    active === index ? "text-white" : "text-white/30"
                  }`}
                >
                  {index + 1}.
                </span>
                {section.h}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-7 text-white/70">
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
            </section>
          ))}

          <section className="border-t border-white/10 pt-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
              {t("legal.related")}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {LEGAL_IDS.filter((other) => other !== id).map((other) => (
                <li key={other}>
                  <Link
                    href={legalPath(other)}
                    className="inline-flex h-11 items-center rounded-full bg-secondary px-5 text-sm transition hover:bg-white/10"
                  >
                    {t(`legal.name.${other}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
