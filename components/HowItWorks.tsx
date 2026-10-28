"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STEPS } from "./content";
import ImageSlot from "./ImageSlot";
import { useI18n } from "@/components/i18n/LocaleProvider";

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      // Scroll horizontal fijado solo en pantallas grandes
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const el = track.current!;
          const distance = () => el.scrollWidth - window.innerWidth;
          const tween = gsap.to(el, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });
          gsap.utils.toArray<HTMLElement>("[data-step-num]").forEach((num) => {
            gsap.fromTo(
              num,
              { xPercent: 30 },
              {
                xPercent: -10,
                ease: "none",
                scrollTrigger: {
                  trigger: num.closest("[data-step]"),
                  containerAnimation: tween,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              },
            );
          });
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="como-funciona"
      className="relative overflow-hidden py-[clamp(5rem,10vw,10rem)] lg:flex lg:h-[100svh] lg:items-center lg:py-0"
    >
      <div
        ref={track}
        className="flex flex-col gap-[clamp(1rem,1.4vw,1.5rem)] px-[clamp(1.25rem,3vw,3.5rem)] lg:w-max lg:flex-row lg:items-stretch lg:gap-6 lg:pr-[10vw]"
      >
        <div className="flex flex-col justify-end pb-8 lg:w-[38vw] lg:pb-4">
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.18em] text-muted">
            {t("how.eyebrow")}
          </p>
          <h2 className="font-display text-[clamp(2.75rem,6.5vw,6.5rem)] font-bold leading-[0.9]">
            {t("how.title1")}
            <br />
            <span className="text-white/40">{t("how.title2")}</span>
          </h2>
        </div>
        {STEPS.map((s) => (
          <article
            key={s.n}
            data-step
            className="relative flex min-h-[480px] flex-col overflow-hidden rounded-[36px] border border-line bg-raised p-6 md:p-8 lg:h-[76svh] lg:w-[min(560px,42vw)]"
          >
            <span
              data-step-num
              aria-hidden
              className="font-display pointer-events-none absolute -right-4 -top-8 text-[13rem] font-bold leading-none text-white/[0.05] lg:text-[17rem]"
            >
              {s.n}
            </span>
            <span className="font-display text-xl font-semibold text-white/50">
              {s.n}
            </span>
            <h3 className="font-display mt-3 text-[clamp(2.6rem,4.4vw,4.6rem)] font-bold leading-none">
              {t(`step.${s.n}.title`)}
            </h3>
            <p className="mt-4 max-w-[34ch] text-base leading-relaxed text-muted md:text-lg">
              {t(`step.${s.n}.body`)}
            </p>
            <ImageSlot
              label={t("how.step", { n: s.n })}
              className="mt-8 min-h-[200px] flex-1"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
