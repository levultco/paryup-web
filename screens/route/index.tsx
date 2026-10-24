"use client";

import useIsMobile from "@/hooks/useIsMobile";
import { TIMELINE_STORY_ITEMS, type TimeStoryItem } from "@/constants/route";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import "./route.css";

const STEPS = TIMELINE_STORY_ITEMS;
const LAST = STEPS.length - 1;

// Cada paso se queda quieto un rato y luego pasa al siguiente: en cada tramo
// de scroll, el primer 35% y el último 35% son pausa y el centro es el cambio.
function settle(raw: number) {
  const v = Math.max(0, Math.min(LAST, raw));
  const i = Math.floor(v);
  const f = v - i;
  if (f <= 0.35) return i;
  if (f >= 0.65) return i + 1;
  const t = (f - 0.35) / 0.3;
  return i + t * t * (3 - 2 * t);
}

// Opacidad de una capa según lo cerca que está el paso activo. El texto usa
// un fundido más corto para que el saliente se vaya antes de que entre el otro.
const layerOpacity = (v: number, index: number, speed = 1.6) =>
  Math.max(0, 1 - Math.abs(v - index) * speed);

function SceneText({
  item,
  index,
  progress,
}: {
  item: TimeStoryItem;
  index: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, (v) => layerOpacity(v, index, 2.6));
  const y = useTransform(progress, (v) => (index - v) * 36);

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-0">
      <p className="route-label">{item.label}</p>
      <h3 className="route-title">{item.title}</h3>
      <p className="route-copy">{item.subtitle}</p>
    </motion.div>
  );
}

function SceneVideo({
  item,
  index,
  progress,
  active,
}: {
  item: TimeStoryItem;
  index: number;
  progress: MotionValue<number>;
  active: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const opacity = useTransform(progress, (v) => layerOpacity(v, index));
  const scale = useTransform(
    progress,
    (v) => 1 + Math.min(1, Math.abs(v - index)) * 0.06,
  );

  // Solo se reproduce el vídeo del paso visible.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <motion.video
        ref={ref}
        style={{ scale }}
        className="h-full w-full object-cover"
        src={item.videoSrc}
        muted
        loop
        playsInline
        preload={index < 2 ? "auto" : "metadata"}
        aria-label={`ParyUp: ${item.title}`}
      />
    </motion.div>
  );
}

function NightTick({
  item,
  index,
  progress,
  onSelect,
}: {
  item: TimeStoryItem;
  index: number;
  progress: MotionValue<number>;
  onSelect: (index: number) => void;
}) {
  const opacity = useTransform(progress, (v) => (v >= index - 0.5 ? 1 : 0.45));

  return (
    <motion.button
      type="button"
      style={{ opacity }}
      onClick={() => onSelect(index)}
      className="route-tick"
    >
      <span className="route-tick-time">{item.time}</span>
      <span className="route-tick-label">{item.label}</span>
    </motion.button>
  );
}

function RouteDesktop() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progress = useTransform(scrollYProgress, (p) => settle(p * LAST));
  const clockY = useTransform(progress, (v) => `${-v}em`);
  const fill = useTransform(progress, (v) => v / LAST);
  const [active, setActive] = useState(0);

  useMotionValueEvent(progress, "change", (v) => {
    const next = Math.round(v);
    setActive((prev) => (prev === next ? prev : next));
  });

  const goTo = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const span = section.offsetHeight - window.innerHeight;
    const target = top + (index / LAST) * span;
    const lenis = (
      window as Window & {
        lenis?: { scrollTo?: (y: number, o?: { duration?: number }) => void };
      }
    ).lenis;
    if (lenis?.scrollTo) lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="route-heading"
      className="relative w-full"
      style={{ height: `${STEPS.length * 90 + 40}vh` }}
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pt-[112px] pb-10">
        <div className="route-frame flex min-h-0 flex-1 flex-col">
          <h2 id="route-heading" className="route-heading">
            Una noche completa, paso a paso
          </h2>

          <div className="mt-[4vh] grid min-h-0 flex-1 grid-cols-[0.8fr_1.2fr] items-center gap-[4vw]">
            <div className="flex h-full min-h-0 flex-col justify-center">
              {/* La hora gira como un marcador al hacer scroll */}
              <div className="route-clock" aria-hidden>
                <motion.div style={{ y: clockY }}>
                  {STEPS.map((item) => (
                    <span key={item.id} className="block">
                      {item.time}
                    </span>
                  ))}
                </motion.div>
              </div>

              <div className="relative mt-8 h-[220px]">
                {STEPS.map((item, index) => (
                  <SceneText
                    key={item.id}
                    item={item}
                    index={index}
                    progress={progress}
                  />
                ))}
              </div>
            </div>

            <div className="route-media">
              {STEPS.map((item, index) => (
                <SceneVideo
                  key={item.id}
                  item={item}
                  index={index}
                  progress={progress}
                  active={index === active}
                />
              ))}
            </div>
          </div>

          <nav aria-label="Momentos de la noche" className="mt-[4vh]">
            <div className="route-track">
              <motion.span
                className="route-track-fill"
                style={{ scaleX: fill }}
              />
            </div>
            <div className="mt-4 grid grid-cols-6 gap-4">
              {STEPS.map((item, index) => (
                <NightTick
                  key={item.id}
                  item={item}
                  index={index}
                  progress={progress}
                  onSelect={goTo}
                />
              ))}
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}

function RouteMobile() {
  return (
    <section aria-labelledby="route-heading-m" className="route-frame py-20">
      <h2 id="route-heading-m" className="route-heading">
        Una noche completa, paso a paso
      </h2>
      <ol className="mt-10 space-y-14">
        {STEPS.map((item) => (
          <li key={item.id}>
            <p className="route-clock-m">{item.time}</p>
            <h3 className="route-title mt-3">{item.title}</h3>
            <p className="route-copy">{item.subtitle}</p>
            <div className="route-media mt-5">
              <video
                className="h-full w-full object-cover"
                src={item.videoSrc}
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
                aria-label={`ParyUp: ${item.title}`}
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const noopSubscribe = () => () => {};

export const RouteScreen = () => {
  const isMobile = useIsMobile();
  // false en el servidor y en la hidratación, true después en el cliente.
  const hasMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  if (!hasMounted) return <div className="h-svh w-full" />;
  return isMobile ? <RouteMobile /> : <RouteDesktop />;
};
