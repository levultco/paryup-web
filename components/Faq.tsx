"use client";

import { useState } from "react";
import { FAQ_IDS } from "./content";
import { useI18n } from "@/components/i18n/LocaleProvider";

export default function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="mx-auto w-full max-w-[1800px] px-[clamp(1.25rem,3vw,3.5rem)] grid scroll-mt-24 gap-[clamp(2.5rem,4.5vw,4.5rem)] py-[clamp(5rem,10vw,10rem)] lg:grid-cols-[1fr_1.2fr]"
    >
      <div className="lg:sticky lg:top-32 lg:self-start">
        <h2 className="font-display text-[clamp(3rem,6.5vw,6.5rem)] font-bold leading-[0.9]">
          {t("faq.title1")}
          <br />
          {t("faq.title2")}
        </h2>
        <p className="mt-6 max-w-[34ch] text-lg text-muted">{t("faq.sub")}</p>
      </div>
      <ul className="border-t border-line">
        {FAQ_IDS.map((id, i) => {
          const isOpen = open === i;
          return (
            <li key={id} className="border-b border-line">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-7 text-left"
              >
                <span className="font-display text-[clamp(1.4rem,2.2vw,2.1rem)] font-medium leading-tight">
                  {t(`faq.${id}.q`)}
                </span>
                <span
                  aria-hidden
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-2xl transition-[transform,background-color] duration-500 ease-[var(--ease-out)] group-hover:bg-white/5 ${
                    isOpen ? "rotate-45 bg-white/5" : ""
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className="grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out)]"
                style={{
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  <p className="max-w-[56ch] pb-8 text-lg leading-relaxed text-muted">
                    {t(`faq.${id}.a`)}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
