"use client";

import Image from "next/image";
import { useEffect, useRef, type PointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FEATURES, type Feature } from "./content";
import ImageSlot from "./ImageSlot";
import AppPhones from "./AppPhones";
import ContentBackdrop from "./ContentBackdrop";
import { useI18n } from "@/components/i18n/LocaleProvider";

gsap.registerPlugin(ScrollTrigger);

function FeatureCard({ f, prefix }: { f: Feature; prefix: string }) {
  const { t } = useI18n();
  const title = t(`${prefix}.${f.id}.title`);
  const ref = useRef<HTMLElement>(null);

  // Brillo que sigue al cursor + inclinación muy leve
  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  return (
    <div data-card className={f.span}>
      <article
        ref={ref}
        onPointerMove={onMove}
        className="glow-card flex h-full min-h-[480px] flex-col overflow-hidden rounded-[36px] border border-line bg-raised p-6 md:min-h-[520px] md:p-8"
      >
        <ContentBackdrop src={f.screens?.[0] ?? f.image} />
        <span className="relative mb-6 w-fit rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-xl">
          {t(`${prefix}.${f.id}.eyebrow`)}
        </span>
        <h3 className="font-display relative max-w-[16ch] text-balance text-[clamp(2rem,3.4vw,3.4rem)] font-bold leading-[0.98]">
          {title}
        </h3>
        <p className="relative mt-4 max-w-[42ch] text-base leading-relaxed text-muted md:text-lg">
          {t(`${prefix}.${f.id}.body`)}
        </p>
        <div
          className={`relative mt-6 flex flex-1 overflow-hidden ${
            f.screens || (f.visual && f.bleed)
              ? "-mx-6 -mb-6 md:-mx-8 md:-mb-8"
              : "rounded-[24px]"
          }`}
        >
          {f.screens ? (
            <div data-slot className="relative min-h-[400px] w-full md:min-h-[460px]">
              <AppPhones screens={f.screens} alt={title} variant={f.variant} />
            </div>
          ) : f.visual ? (
            <div
              data-slot
              className={`relative w-full ${
                f.bleed ? "h-[400px] md:h-[500px]" : "h-[340px] md:h-[400px]"
              }`}
            >
              {f.visual}
            </div>
          ) : f.image && f.imageAspect ? (
            <div
              data-slot
              className="flex h-[340px] w-full items-start justify-center md:h-[400px]"
            >
              <div
                className="relative w-[58%] max-w-[300px]"
                style={{ aspectRatio: f.imageAspect }}
              >
                <Image
                  src={f.image}
                  alt={title}
                  fill
                  sizes="300px"
                  className="rounded-t-[28px] object-cover object-top ring-1 ring-white/10"
                />
              </div>
            </div>
          ) : f.image ? (
            <div data-slot className="relative h-[340px] w-full md:h-[400px]">
              <Image
                src={f.image}
                alt={title}
                fill
                sizes="(max-width: 768px) 90vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          ) : (
            <ImageSlot
              label={t(`${prefix}.${f.id}.slot`)}
              className="h-[340px] w-full md:h-[400px]"
            />
          )}
        </div>
      </article>
    </div>
  );
}

const HOME_FEATURE_KEYS = {
  head1: "features.head1",
  head2: "features.head2",
  sub: "features.sub",
  prefix: "feature",
};

export default function Features({
  items = FEATURES,
  keys = HOME_FEATURE_KEYS,
}: {
  items?: Feature[];
  keys?: typeof HOME_FEATURE_KEYS;
}) {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-feat-line] > span", {
          yPercent: 110,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: "[data-feat-head]", start: "top 85%" },
        });
        gsap.from("[data-feat-desc]", {
          opacity: 0,
          y: 24,
          duration: 1.2,
          delay: 0.35,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-feat-head]", start: "top 85%" },
        });
        gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card) => {
          // Aparecen poco a poco ligadas al scroll, desde que asoman por abajo
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
      id="funciones"
      className="mx-auto w-full max-w-[1800px] px-[clamp(1.25rem,3vw,3.5rem)] scroll-mt-24 pb-[clamp(5rem,10vw,10rem)] pt-[clamp(3rem,7vw,7rem)]"
    >
      <div
        data-feat-head
        className="mb-[clamp(2.5rem,4.5vw,4.5rem)] md:flex md:items-end md:justify-between md:gap-12"
      >
        <h2 className="font-display text-[clamp(2.75rem,6.5vw,6.5rem)] font-bold leading-[0.9]">
          <span data-feat-line className="line-mask">
            <span>{t(keys.head1)}</span>
          </span>
          <span data-feat-line className="line-mask">
            <span>{t(keys.head2)}</span>
          </span>
        </h2>
        <p
          data-feat-desc
          className="mt-6 max-w-[28ch] text-lg text-muted md:mb-3 md:mt-0 md:shrink-0 md:text-xl lg:text-2xl"
        >
          {t(keys.sub)}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-[clamp(1rem,1.4vw,1.5rem)] md:grid-cols-12">
        {items.map((f) => (
          <FeatureCard key={f.id} f={f} prefix={keys.prefix} />
        ))}
      </div>
    </section>
  );
}
