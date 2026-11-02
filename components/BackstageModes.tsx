"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { CheckIcon, LockIcon } from "@/components/icons/solar";

gsap.registerPlugin(ScrollTrigger);

function Item({ text, locked }: { text: string; locked?: boolean }) {
  return (
    <li className="flex items-center gap-3.5 py-3.5">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          locked ? "bg-white/[0.08] text-white/40" : "bg-[#30d158] text-black"
        }`}
      >
        {locked ? (
          <LockIcon aria-hidden className="h-3.5 w-3.5" />
        ) : (
          <CheckIcon aria-hidden className="h-4 w-4" strokeWidth={2.4} />
        )}
      </span>
      <span
        className={`text-base md:text-lg ${locked ? "text-white/45" : "text-white/90"}`}
      >
        {text}
      </span>
    </li>
  );
}

function ModeCard({
  eyebrow,
  title,
  items,
  limits = [],
}: {
  eyebrow: string;
  title: string;
  items: string[];
  limits?: string[];
}) {
  return (
    <article
      data-mode-card
      className="relative flex min-h-[480px] flex-col overflow-hidden rounded-[36px] border border-line bg-raised p-6 md:p-8"
    >
      <span className="relative mb-6 w-fit rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-xl">
        {eyebrow}
      </span>
      <h3 className="font-display relative max-w-[14ch] text-balance text-[clamp(2rem,3.4vw,3.4rem)] font-bold leading-[0.98]">
        {title}
      </h3>
      <ul className="relative mt-8 divide-y divide-white/10">
        {items.map((i) => (
          <Item key={i} text={i} />
        ))}
        {limits.map((i) => (
          <Item key={i} text={i} locked />
        ))}
      </ul>
    </article>
  );
}

/** Las dos modalidades de Backstage, con lo que se puede y lo que no en cada una. */
export default function BackstageModes() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-modes-line] > span", {
          yPercent: 110,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: "[data-modes-head]", start: "top 85%" },
        });
        gsap.from("[data-modes-desc]", {
          opacity: 0,
          y: 24,
          duration: 1.2,
          delay: 0.35,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-modes-head]", start: "top 85%" },
        });
        gsap.utils.toArray<HTMLElement>("[data-mode-card]").forEach((card) => {
          gsap.fromTo(
            card,
            { y: 120, scale: 0.94, opacity: 0 },
            {
              y: 0,
              scale: 1,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 100%",
                end: "top 62%",
                scrub: true,
              },
            },
          );
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="modalidades"
      className="mx-auto w-full max-w-[1800px] scroll-mt-24 px-[clamp(1.25rem,3vw,3.5rem)] pb-[clamp(5rem,10vw,10rem)] pt-[clamp(3rem,7vw,7rem)]"
    >
      <div
        data-modes-head
        className="mb-[clamp(2.5rem,4.5vw,4.5rem)] md:flex md:items-end md:justify-between md:gap-12"
      >
        <h2 className="font-display text-[clamp(2.75rem,6.5vw,6.5rem)] font-bold leading-[0.9]">
          <span data-modes-line className="line-mask">
            <span>{t("backstage.modes.head1")}</span>
          </span>
          <span data-modes-line className="line-mask">
            <span>{t("backstage.modes.head2")}</span>
          </span>
        </h2>
        <p
          data-modes-desc
          className="mt-6 max-w-[28ch] text-lg text-muted md:mb-3 md:mt-0 md:shrink-0 md:text-xl lg:text-2xl"
        >
          {t("backstage.modes.sub")}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-[clamp(1rem,1.4vw,1.5rem)] md:grid-cols-2">
        <ModeCard
          eyebrow={t("backstage.mode.paryup")}
          title={t("backstage.modes.paryup.title")}
          items={[1, 2, 3, 4].map((n) => t(`backstage.modes.paryup.i${n}`))}
        />
        <ModeCard
          eyebrow={t("backstage.mode.fv")}
          title={t("backstage.modes.fv.title")}
          items={[1, 2, 3].map((n) => t(`backstage.modes.fv.i${n}`))}
          limits={[1, 2].map((n) => t(`backstage.modes.fv.l${n}`))}
        />
      </div>
      <p className="mt-6 max-w-[70ch] text-sm text-muted">
        {t("backstage.modes.note")}
      </p>
    </section>
  );
}
