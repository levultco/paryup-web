"use client";

import type { FeatureStoryItem } from "@/constants/featuresStory";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { LinePath } from "../linePath";

gsap.registerPlugin(ScrollTrigger);

type HorizontalStorySectionProps = {
  items: FeatureStoryItem[];
  className?: string;
};

type StoryLayout = {
  maxDistance: number;
  snapPoints: number[];
  viewportWidth: number;
};

const DESKTOP_HEADER_OFFSET = 92;
const SCRUB_SMOOTHNESS = 0;
const LINE_PATH_VIEWBOX_WIDTH = 9972;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const formatSlideNumber = (index: number) => String(index + 1);

const StoryCard = ({
  item,
  index,
  total,
  trackX,
  targetX,
  viewportWidth,
}: {
  item: FeatureStoryItem;
  index: number;
  total: number;
  trackX: MotionValue<number>;
  targetX: number;
  viewportWidth: number;
}) => {
  const isReverse = index % 2 === 3;

  const travelProgress = useTransform(trackX, (value) => {
    const range = Math.max(420, viewportWidth * 0.9);
    return clamp((value + targetX) / range, -1, 1);
  });

  const labelX = useTransform(travelProgress, [-1, 1], [-804, 804]);
  const titleX = useTransform(travelProgress, [-1, 1], [-952, 952]);
  const subtitleX = useTransform(travelProgress, [-1, 1], [-842, 842]);
  const ghostX = useTransform(travelProgress, [-1, 1], [310, -310]);
  const videoX = useTransform(travelProgress, [-1, 1], [-606, 606]);
  const haloX = useTransform(travelProgress, [-1, 1], [-606, 606]);
  const mockupX = useTransform(travelProgress, [-1, 1], [-606, 606]);

  return (
    <article className="relative flex h-[min(76vh,740px)] w-[90vw] shrink-0 rounded-[2.4rem]">
      {/* <motion.video
        style={{ x: videoX }}
        src={item.videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.06] saturate-[0.8] blur-[120px] scale-[1]"
      /> */}

      <motion.span
        style={{ x: ghostX }}
        className="pointer-events-none absolute -bottom-6 left-1/2 z-0 -translate-x-1/2 text-[clamp(5.6rem,11vw,11rem)] font-semibold tracking-[-0.04em] text-white/[0.035]"
      >
        {item.ghostWord}
      </motion.span>

      <div className="relative z-10 grid h-full w-full grid-cols-12">
        <div
          className={cn(
            "flex h-full flex-col justify-center",
            isReverse
              ? "col-span-5 col-start-8 pr-[6%] pl-[3%] translate-y-1"
              : "col-span-5 col-start-1 pl-[6%] pr-[4%] translate-y-2",
          )}
        >
          <motion.div
            style={{ x: labelX }}
            className="mb-7 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/45"
          >
            {/* <span>{item.label}</span>
            <span className="h-px w-8 bg-white/20" />
            <span>
              {formatSlideNumber(index)} / {formatSlideNumber(total - 1)}
            </span> */}
            <span className="text-7xl text-transparent bg-clip-text  bg-gradient-to-r from-white/90 to-white/10 font-black">
              {formatSlideNumber(index)}
            </span>
          </motion.div>

          <motion.h3
            style={{ x: titleX }}
            className="max-w-[18ch] text-balance text-[clamp(2rem,3.9vw,4.25rem)] font-semibold leading-[0.96] tracking-[-0.03em] text-white"
          >
            {item.title}
          </motion.h3>

          <motion.p
            style={{ x: subtitleX }}
            className="mt-6 max-w-[36ch] text-pretty text-[clamp(1rem,1.2vw,1.35rem)] leading-relaxed text-white/72"
          >
            {item.subtitle}
          </motion.p>
        </div>

        <div
          className={cn(
            "relative col-span-7 flex h-full items-center",
            isReverse
              ? "col-start-1 justify-start pl-[6%]"
              : "col-start-6 justify-end pr-[6%]",
          )}
        >
          <div
            className={cn(
              "relative",
              isReverse ? "-rotate-[1.6deg]" : "rotate-[1.4deg]",
            )}
          >
            {/* <motion.video
              src={item.videoSrc}
              style={{ x: haloX }}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className={cn(
                "pointer-events-none absolute top-1/2 z-0 h-[102%] w-[100%] -translate-y-1/2 rounded-[999px] blur-[64px] object-cover",
              )}
            /> */}
            <motion.div
              style={{ x: haloX }}
              className="pointer-events-none absolute top-1/2 z-0 h-full w-full -translate-y-1/2 rounded-full bg-white/10 blur-3xl"
            />

            <motion.div
              style={{ x: mockupX }}
              className="relative z-10 h-[min(86vh,640px)] w-[clamp(290px,34vw,470px)] overflow-hidden rounded-2xl "
            >
              <motion.video
                src={item.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/26 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </div>
    </article>
  );
};

export const HorizontalStorySection = ({
  items,
  className,
}: HorizontalStorySectionProps) => {
  const desktopSectionRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const trackX = useMotionValue(0);
  const lineProgress = useMotionValue(0);

  const [layout, setLayout] = useState<StoryLayout>({
    maxDistance: 0,
    snapPoints: [],
    viewportWidth: 0,
  });

  useEffect(() => {
    const section = desktopSectionRef.current;
    const track = trackRef.current;
    if (!section || !track || typeof ResizeObserver === "undefined") return;

    const updateLayout = () => {
      const viewportWidth = section.clientWidth;
      const maxDistance = Math.max(0, track.scrollWidth - viewportWidth);
      const cards = cardRefs.current.filter(
        (card): card is HTMLElement => card !== null,
      );

      const rawSnapPoints = cards.map((card) => {
        const centerPosition =
          card.offsetLeft + card.clientWidth / 2 - viewportWidth / 2;
        return clamp(centerPosition, 0, maxDistance);
      });

      const firstPoint = rawSnapPoints[0] ?? 0;
      const snapPoints = rawSnapPoints.map((point) =>
        clamp(point - firstPoint, 0, maxDistance),
      );

      setLayout((prev) => {
        const next = {
          maxDistance: Math.max(0, maxDistance - firstPoint),
          snapPoints,
          viewportWidth,
        };

        const sameViewport = prev.viewportWidth === next.viewportWidth;
        const sameMaxDistance = prev.maxDistance === next.maxDistance;
        const sameSnapPoints =
          prev.snapPoints.length === next.snapPoints.length &&
          prev.snapPoints.every((point, i) => point === next.snapPoints[i]);

        if (sameViewport && sameMaxDistance && sameSnapPoints) {
          return prev;
        }

        return next;
      });
    };

    const rafUpdateLayout = () => {
      requestAnimationFrame(updateLayout);
    };
    updateLayout();

    const observer = new ResizeObserver(rafUpdateLayout);
    observer.observe(section);
    window.addEventListener("resize", rafUpdateLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", rafUpdateLayout);
    };
  }, [items]);

  useIsomorphicLayoutEffect(() => {
    const section = desktopSectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!section || !pin || !track || typeof window === "undefined") return;

    if (!window.matchMedia("(min-width: 1024px)").matches) {
      gsap.set(track, { clearProps: "transform" });
      trackX.set(0);
      lineProgress.set(0);
      return;
    }

    if (layout.snapPoints.length === 0) return;

    const lastPoint = layout.snapPoints[layout.snapPoints.length - 1] ?? 0;
    const travelDistance = Math.max(1, lastPoint);
    const availableHeight = Math.max(
      520,
      window.innerHeight - DESKTOP_HEADER_OFFSET,
    );
    const scrollDistance = Math.round(
      Math.max(availableHeight * (items.length * 0.96), travelDistance * 1.12),
    );
    const lineTravelDistance = Math.max(
      1,
      LINE_PATH_VIEWBOX_WIDTH - section.clientWidth,
    );
    const normalizationDistance = Math.max(lastPoint, lineTravelDistance);
    const syncLinePathWithTrack = () => {
      const currentX = Number(gsap.getProperty(track, "x")) || 0;
      trackX.set(currentX);
      const normalizedProgress = clamp(
        Math.abs(currentX) / normalizationDistance,
        0,
        1,
      );
      lineProgress.set(normalizedProgress);
    };

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: `top top+=${DESKTOP_HEADER_OFFSET}`,
        end: `+=${scrollDistance}`,
        pin,
        scrub: SCRUB_SMOOTHNESS,
        anticipatePin: 0.1,
        invalidateOnRefresh: true,
        onRefreshInit: () => {
          gsap.set(track, { x: 0 });
          trackX.set(0);
          lineProgress.set(0);
        },
        onUpdate: () => {
          syncLinePathWithTrack();
        },
        onRefresh: () => {
          syncLinePathWithTrack();
        },
        onLeaveBack: () => {
          gsap.set(track, { x: 0 });
          trackX.set(0);
          lineProgress.set(0);
        },
        onLeave: () => {
          lineProgress.set(1);
        },
      },
    });

    trackX.set(0);
    lineProgress.set(0);
    timeline.fromTo(
      track,
      { x: 0 },
      { x: -lastPoint, duration: 1, ease: "none" },
    );

    return () => {
      timeline.kill();
    };
  }, [items.length, layout.snapPoints, lineProgress, trackX]);

  return (
    <div className={cn("w-full", className)}>
      <div ref={desktopSectionRef} className="relative hidden w-full lg:block">
        <div
          ref={pinRef}
          style={{ height: `calc(100vh - ${DESKTOP_HEADER_OFFSET}px)` }}
          className=""
        >
          <div
            ref={trackRef}
            className="relative flex h-full items-center gap-7 px-[5vw] will-change-transform"
          >
            <LinePath
              className="pointer-events-none absolute left-0 top-0"
              progress={lineProgress}
            />
            {items.map((item, index) => (
              <div
                key={item.id}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
              >
                <StoryCard
                  item={item}
                  index={index}
                  total={items.length}
                  trackX={trackX}
                  targetX={
                    layout.snapPoints[index] ??
                    (items.length > 1
                      ? (index / (items.length - 1)) * layout.maxDistance
                      : 0)
                  }
                  viewportWidth={layout.viewportWidth}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 lg:hidden">
        {items.map((item, index) => (
          <article key={item.id} className="relative rounded-[1.85rem] ">
            {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_35%,rgba(79,112,137,0.22),transparent_70%)]" /> */}
            <video
              src={item.videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover opacity-20 blur-3xl"
            />
            {/* <div className="absolute inset-0 bg-gradient-to-b from-black/38 via-black/24 to-black/72" /> */}

            <div className="relative z-10 px-5 pb-5 pt-6">
              <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                <span>{item.label}</span>
                <span className="h-px w-7 bg-white/20" />
                <span>
                  {formatSlideNumber(index)} /{" "}
                  {formatSlideNumber(items.length - 1)}
                </span>
              </div>

              <h3 className="max-w-[18ch] text-3xl font-semibold leading-[1.02] tracking-[-0.02em] text-white">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[34ch] text-base leading-relaxed text-white/75">
                {item.subtitle}
              </p>

              <div className="relative mt-6 flex justify-center">
                <div className="absolute top-1/2 h-[66%] w-[62%] -translate-y-1/2 rounded-[999px] bg-[rgba(123,162,190,0.22)] blur-[32px]" />
                <div className="relative z-10 h-[58vh] w-[76vw] max-w-[390px] rounded-2xl overflow-hidden ">
                  <video
                    src={item.videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
