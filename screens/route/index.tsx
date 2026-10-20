"use client";

import BorderBeam from "@/components/common/borderBeam";
import BounceInText from "@/components/common/bounceText";
import Image from "next/image";
import useIsMobile from "@/hooks/useIsMobile";
import { TIMELINE_STORY_ITEMS } from "@/constants/route";
import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const STEP_GLOW: Record<string, string> = {
  discover: "rgba(3,88,247,0.45)",
  tickets: "rgba(36,255,87,0.28)",
  chat: "rgba(198,121,196,0.4)",
  matches: "rgba(250,61,29,0.38)",
  recap: "rgba(255,176,5,0.32)",
  profile: "rgba(143,211,255,0.35)",
};

const STEP_CHIP: Record<string, string> = {
  discover: "12 eventos cerca de ti",
  tickets: "Entrada confirmada · QR listo",
  chat: "Lucía: ya estoy en la cola 🙌",
  matches: "Nuevo match: Sofía",
  recap: "Tu recap de Neon Night está listo",
  profile: "24 fiestas asistidas",
};

const SCENE_TIMES = ["22:30", "22:34", "23:00", "00:30", "Sábado", "Domingo"];
const SCENE_STEPS = [
  "Arranca la noche",
  "Entrada en mano",
  "Plan con tu gente",
  "Conexiones reales",
  "Recuerdo del día",
  "Tu historial",
];

const contentContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.085,
      delayChildren: 0.1,
    },
  },
};

const AppleIntelligenceFrame = () => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-999999999999999 pointer-events-none">
      <div className="absolute inset-0 ">
        <div className="absolute  " />
      </div>

      <div className="absolute inset-[8px] rounded-3xl overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[35px] animate-shimmer-top"
          style={{
            background:
              "linear-gradient(to bottom, rgba(198, 121, 196, 0.8), rgba(250, 61, 29, 0.5), transparent)",
            filter: "blur(10px)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-[35px] animate-shimmer-right"
          style={{
            background:
              "linear-gradient(to left, rgba(3, 88, 247, 0.8), rgba(225, 225, 254, 0.45), transparent)",
            filter: "blur(10px)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[35px] animate-shimmer-bottom"
          style={{
            background:
              "linear-gradient(to top, rgba(3, 88, 247, 0.8), rgba(225, 225, 254, 0.45), transparent)",
            filter: "blur(10px)",
          }}
        />
        <div
          className="absolute inset-y-0 left-0 w-[35px] animate-shimmer-left"
          style={{
            background:
              "linear-gradient(to right, rgba(198, 121, 196, 0.8), rgba(255, 176, 5, 0.45), transparent)",
            filter: "blur(10px)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[55px] h-[55px]"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(250, 61, 29, 0.6), transparent 70%)",
            filter: "blur(12px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[55px] h-[55px]"
          style={{
            background:
              "radial-gradient(circle at bottom right, rgba(3, 88, 247, 0.6), transparent 70%)",
            filter: "blur(12px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[55px] h-[55px]"
          style={{
            background:
              "radial-gradient(circle at bottom left, rgba(255, 176, 5, 0.6), transparent 70%)",
            filter: "blur(12px)",
          }}
        />
        <div
          className="absolute top-0 left-0 w-[55px] h-[55px]"
          style={{
            background:
              "radial-gradient(circle at top left, rgba(198, 121, 196, 0.6), transparent 70%)",
            filter: "blur(12px)",
          }}
        />
      </div>
    </div>,
    document.body,
  );
};

export const RouteScreen = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);
  const disableMotion = !hasMounted || isMobile;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [overlayStepIndex, setOverlayStepIndex] = useState(0);
  const totalItems = TIMELINE_STORY_ITEMS.length;
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticReleaseTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const latestIndexRef = useRef(0);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticTargetRef = useRef<number | null>(null);

  const steps = useMemo(() => {
    return TIMELINE_STORY_ITEMS.map((item, index) => ({
      ...item,
      time: SCENE_TIMES[index] ?? `0${index + 1}:00`,
      step: SCENE_STEPS[index] ?? `Escena ${index + 1}`,
    }));
  }, []);

  const continuousIndex = useTransform(
    scrollYProgress,
    [0, 1],
    [0, totalItems - 1],
  );
  const trackTranslate = useTransform(continuousIndex, (value) => {
    const clamped = Math.max(0, Math.min(totalItems - 1, value));
    return `-${(clamped / totalItems) * 100}%`;
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [20, -16]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.2], [0.65, 1]);
  const headingScale = useTransform(
    scrollYProgress,
    [0, 0.22, 0.82, 1],
    [0.95, 1, 1, 0.97],
  );
  const sceneY = useTransform(
    scrollYProgress,
    [0, 0.2, 0.85, 1],
    [34, 0, 0, -28],
  );
  const sceneScale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.85, 1],
    [0.94, 1, 1, 0.98],
  );
  const showAppleIntelligence =
    overlayStepIndex >= 1 && overlayStepIndex < totalItems - 2;
  const timelineProgressHeight = useTransform(continuousIndex, (value) => {
    if (totalItems <= 1) return 1;
    const clamped = Math.max(0, Math.min(totalItems - 1, value));
    return clamped / (totalItems - 1);
  });

  const clearProgrammaticState = () => {
    isProgrammaticScrollRef.current = false;
    programmaticTargetRef.current = null;
    if (programmaticReleaseTimerRef.current) {
      clearTimeout(programmaticReleaseTimerRef.current);
      programmaticReleaseTimerRef.current = null;
    }
  };

  // const scrollToSnapIndex = (index: number) => {
  //   if (typeof window === "undefined") return;

  //   const section = sectionRef.current;
  //   if (!section) return;

  //   clearProgrammaticState();

  //   const sectionTop = section.getBoundingClientRect().top + window.scrollY;
  //   const scrollSpan = Math.max(1, section.offsetHeight - window.innerHeight);
  //   const ratio = index / Math.max(1, totalItems - 1);
  //   const targetTop = sectionTop + ratio * scrollSpan;

  //   isProgrammaticScrollRef.current = true;
  //   programmaticTargetRef.current = index;
  //   programmaticReleaseTimerRef.current = window.setTimeout(() => {
  //     clearProgrammaticState();
  //   }, 800);

  //   const maybeWindow = window as Window & {
  //     lenis?: {
  //       scrollTo?: (
  //         target: number,
  //         options?: {
  //           duration?: number;
  //           lock?: boolean;
  //           force?: boolean;
  //           onComplete?: () => void;
  //         },
  //       ) => void;
  //     };
  //   };

  //   if (maybeWindow.lenis?.scrollTo) {
  //     maybeWindow.lenis.scrollTo(targetTop, {
  //       duration: 0.45,
  //       lock: true,
  //       force: true,
  //       onComplete: () => {
  //         clearProgrammaticState();
  //       },
  //     });
  //     return;
  //   }

  //   window.scrollTo({ top: targetTop, behavior: "smooth" });
  // };

  useMotionValueEvent(continuousIndex, "change", (latest) => {
    const clamped = Math.max(0, Math.min(totalItems - 1, latest));
    latestIndexRef.current = clamped;
    const nearestScene = Math.round(clamped);
    const settledScene = Math.floor(clamped + 0.001);
    setActiveIndex((prev) => (prev === nearestScene ? prev : nearestScene));
    setOverlayStepIndex((prev) =>
      prev === settledScene ? prev : settledScene,
    );

    if (
      isProgrammaticScrollRef.current &&
      programmaticTargetRef.current !== null
    ) {
      const distanceToTarget = Math.abs(
        clamped - programmaticTargetRef.current,
      );
      if (distanceToTarget < 0.015) {
        clearProgrammaticState();
        return;
      }
      if (distanceToTarget > 0.18) {
        // User has taken control while a programmatic snap was in progress.
        clearProgrammaticState();
      } else {
        return;
      }
    }

    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
    }

    // settleTimerRef.current = setTimeout(() => {
    //   const current = latestIndexRef.current;
    //   const snapped = Math.round(current);
    //   if (Math.abs(current - snapped) < 0.002) return;
    //   scrollToSnapIndex(snapped);
    // }, 130);
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
      if (programmaticReleaseTimerRef.current) {
        clearTimeout(programmaticReleaseTimerRef.current);
      }
    };
  }, []);

  const activeItem = steps[activeIndex];
  const renderMobile = hasMounted && isMobile;
  const renderDesktop = hasMounted && !isMobile;

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-auto md:h-[calc(var(--route-steps)*95vh)]"
      style={{ ["--route-steps" as string]: steps.length }}
    >
      <motion.div
        style={
          disableMotion
            ? undefined
            : { y: headingY, opacity: headingOpacity, scale: headingScale }
        }
        className="mb-5 md:mb-8  w-full flex-col items-center justify-center md:flex"
      >
        {/* <p className="mb-3 inline-flex rounded-full border border-white/5 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">
          escenas de la noche
        </p> */}
        <h1
          className="pointer-events-none z-20 text-center font-semibold leading-none tracking-normal text-white"
          style={{
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            color: "#fff",
            fontSize: "clamp(2.2rem, 7vw, 6.5rem)",
          }}
        >
          <div className="flex flex-col items-center justify-center">
            {disableMotion ? (
              <>
                <span className="block leading-[1.1] text-white">
                  Una noche completa
                </span>
                <span className="block leading-[1.1] text-white">
                  contada paso a paso
                </span>
              </>
            ) : (
              <>
                <BounceInText
                  as="span"
                  text="Una noche completa"
                  triggerOnView
                  once={false}
                  className="block leading-[1.1] text-white"
                />
                <BounceInText
                  as="span"
                  text="contada paso a paso"
                  triggerOnView
                  once={false}
                  delay={0.2}
                  className="block leading-[1.1] text-white"
                />
              </>
            )}
          </div>
        </h1>
      </motion.div>
      <motion.div
        style={disableMotion ? undefined : { y: sceneY, scale: sceneScale }}
        className="relative overflow-visible px-4 py-15 sm:px-8 md:sticky md:top-20 md:h-[90vh] md:overflow-hidden md:px-10"
      >
        <div className="mx-auto flex h-full w-full max-w-[1420px] flex-col justify-between md:justify-start">
          {renderDesktop ? (
            <div className="h-[calc(100%-0rem)] grid-cols-[1.25fr_0.75fr] gap-8 md:grid hidden">
              <motion.article className="relative h-full overflow-hidden rounded-[2.3rem] border border-white/5 bg-white/[0.03] ">
                <div className="absolute inset-0 overflow-hidden bg-[#0b0b0f]">
                  <motion.div
                    key={activeItem.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="absolute -right-10 top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full blur-[110px]"
                    style={{ background: STEP_GLOW[activeItem.id] ?? STEP_GLOW.discover }}
                  />
                  <div className="absolute right-[6%] top-1/2 h-[82%] max-h-[640px] aspect-[9/19] -translate-y-1/2 rounded-[2.6rem] border border-white/15 bg-black p-[9px] shadow-[0_30px_90px_rgba(0,0,0,0.6),inset_0_0_0_5px_rgb(40,36,50)]">
                    <div className="relative h-full w-full overflow-hidden rounded-[2.1rem]">
                      <Image
                        src="/app/home.webp"
                        alt="Pantalla de inicio de ParyUp"
                        fill
                        sizes="320px"
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="absolute left-1/2 top-[14px] h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
                  </div>
                  <motion.div
                    key={`chip-${activeItem.id}`}
                    initial={{ opacity: 0, y: 14, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.15 }}
                    className="absolute right-[27%] top-[16%] rounded-2xl border border-white/15 bg-black/55 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-xl"
                  >
                    {STEP_CHIP[activeItem.id]}
                  </motion.div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/12 via-black/12 to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                <motion.div
                  variants={contentContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-10"
                >
                  <motion.div
                    // variants={contentItemVariants}
                    className="inline-flex w-fit items-center gap-3 rounded-full border border-white/5 bg-black/15 px-4 py-2 backdrop-blur-md md:backdrop-blur-2xl"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                      {activeItem.time}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-white/45" />
                    <span className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                      Escena {activeIndex + 1}
                    </span>
                  </motion.div>

                  <motion.div
                    // variants={contentItemVariants}
                    className="max-w-[50%]"
                  >
                    <p className="mb-4 text-sm uppercase tracking-[0.22em] text-white/60">
                      {activeItem.step}
                    </p>
                    <h3 className="text-balance text-[clamp(1.8rem,2.8vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-white">
                      {activeItem.title}
                    </h3>
                    <p className="mt-5 max-w-[50ch] text-[1.05rem] leading-relaxed text-white/75">
                      {activeItem.subtitle}
                    </p>
                  </motion.div>

                  <motion.div
                    // variants={contentItemVariants}
                    className="flex gap-2"
                  >
                    {steps.map((item, index) => (
                      <motion.span
                        key={item.id}
                        animate={{
                          width: index === activeIndex ? 56 : 32,
                          opacity: index === activeIndex ? 1 : 0.32,
                          y: index === activeIndex ? 0 : 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 280,
                          damping: 28,
                          mass: 0.75,
                        }}
                        className="h-1.5 rounded-full bg-white"
                      />
                    ))}
                  </motion.div>
                </motion.div>
              </motion.article>

              <aside className="relative rounded-[2rem] p-4">
                <div className="mb-3 px-2 text-xs uppercase tracking-[0.18em] text-white/45">
                  Timeline
                </div>
                <div className="absolute bottom-6 left-[1.13rem] top-[3.15rem] w-px bg-white/10" />
                <motion.div
                  className="absolute left-[1.13rem] top-[3.15rem] w-px origin-top bg-white/60"
                  style={{ scaleY: timelineProgressHeight }}
                />
                <div className="space-y-2 pl-3">
                  {steps.map((item, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        animate={{
                          opacity: isActive ? 1 : 0.76,
                          y: isActive ? -1 : 0,
                          x: isActive ? 0 : 8,
                          scale: isActive ? 1 : 0.988,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 250,
                          damping: 26,
                          mass: 0.75,
                        }}
                        className="relative"
                      >
                        {isActive ? (
                          <BorderBeam
                            size="line"
                            colorVariant="pary"
                            brightness={0.7}
                            strength={2}
                            saturation={3}
                          >
                            <div
                              className={`rounded-2xl border p-4 transition-all duration-400 ${
                                isActive
                                  ? "border-white/5 bg-white/20 text-black/30"
                                  : "border-white/0 bg-white/[0.02]"
                              }`}
                            >
                              <div className="mb-2 flex items-center gap-3">
                                <span
                                  className={`text-sm uppercase tracking-[0.16em] ${
                                    isActive ? "text-white/50" : "text-white/45"
                                  }`}
                                >
                                  {item.time}
                                </span>
                                <span
                                  className={cn(
                                    "h-px w-8 ",
                                    isActive ? "bg-white/30" : "bg-white/10",
                                  )}
                                />
                                <span
                                  className={`text-sm uppercase tracking-[0.16em] ${
                                    isActive ? "text-white/50" : "text-white/35"
                                  }`}
                                >
                                  {item.label}
                                </span>
                              </div>
                              <p
                                className={`text-lg leading-relaxed ${
                                  isActive ? "text-white" : "text-white/55"
                                }`}
                              >
                                {item.title}
                              </p>
                            </div>
                          </BorderBeam>
                        ) : (
                          <div
                            key={item.id}
                            className={`rounded-2xl border p-4 transition-all duration-400 ${
                              isActive
                                ? "border-white/25 bg-white/[0.08]"
                                : "border-white/0 bg-white/[0.02]"
                            }`}
                          >
                            <div className="mb-2 flex items-center gap-3">
                              <span
                                className={`text-sm uppercase tracking-[0.16em] ${
                                  isActive ? "text-white/80" : "text-white/45"
                                }`}
                              >
                                {item.time}
                              </span>
                              <span className="h-px w-8 bg-white/20" />
                              <span
                                className={`text-sm uppercase tracking-[0.16em] ${
                                  isActive ? "text-white/70" : "text-white/35"
                                }`}
                              >
                                {item.label}
                              </span>
                            </div>
                            <p
                              className={`text-md leading-relaxed ${
                                isActive ? "text-white/90" : "text-white/55"
                              }`}
                            >
                              {item.title}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </aside>
            </div>
          ) : null}

          {renderMobile ? (
            <div>
              <div className="flex gap-4 overflow-x-auto pb-3 pr-4">
                {steps.map((item, index) => (
                  <article
                    key={item.id}
                    className="relative h-[62vh] min-w-[86vw] overflow-hidden rounded-[1.9rem] border border-white/5 bg-white/[0.03]"
                  >
                    <Image
                      src="/app/home.webp"
                      alt=""
                      fill
                      sizes="86vw"
                      className="object-cover object-top opacity-[0.7]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/28 to-black/10" />
                    <div className="relative z-10 flex h-full flex-col justify-between p-5">
                      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-white/80">
                          {item.time}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-white/50" />
                        <span className="text-[10px] uppercase tracking-[0.15em] text-white/65">
                          Escena {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-3xl font-semibold leading-[0.98] tracking-[-0.02em] text-white">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-base leading-relaxed text-white/75">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
          {!hasMounted ? <div className="h-[62vh] w-full" /> : null}
        </div>
      </motion.div>
    </section>
  );
};
