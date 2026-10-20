"use client";

import BorderBeams from "@/components/common/borderBeam";
import BounceInText from "@/components/common/bounceText";
import ChromaGrid from "@/components/common/chromaGrid";
import { eventsItems } from "@/constants/events";
import useIsMobile from "@/hooks/useIsMobile";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { X } from "lucide-react";
import { useState } from "react";
import { MapIcon, SearchEventIcon } from "@/public/icons/icons";

export const EventsScreen = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);
  const disableMotion = !hasMounted || isMobile;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const titleY = useTransform(scrollYProgress, [0, 1], [64, -42]);
  const titleScale = useTransform(
    scrollYProgress,
    [0, 0.24, 0.8, 1],
    [0.93, 1, 1, 0.97],
  );
  const titleRotateX = useTransform(
    scrollYProgress,
    [0, 0.24, 0.8, 1],
    [10, 0, 0, -6],
  );
  const gridY = useTransform(scrollYProgress, [0, 1], [80, -24]);
  const gridScale = useTransform(
    scrollYProgress,
    [0, 0.22, 0.8, 1],
    [0.9, 1, 1, 0.98],
  );
  const gridRotateX = useTransform(
    scrollYProgress,
    [0, 0.22, 0.82, 1],
    [12, 0, 0, -4],
  );
  const actionsY = useTransform(
    scrollYProgress,
    [0, 0.25, 0.82, 1],
    [28, 0, 0, -14],
  );
  const actionsScale = useTransform(
    scrollYProgress,
    [0, 0.25, 0.82, 1],
    [0.95, 1, 1, 0.98],
  );

  const primaryEventUrl = "/events";

  const [showMap, setShowMap] = useState(false);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden px-4 py-16 sm:px-8 md:px-10 md:pb-24"
    >
      <div className="pointer-events-none absolute inset-0">
        {/* <div className="absolute -left-28 top-52 h-64 w-64 rounded-full spectrum-glow" /> */}
        {/* <div className="absolute right-0 top-1/3 h-[22rem] w-[22rem] rounded-full spectrum-glow" /> */}
        {/* <div className="absolute inset-0 opacity-[0.006] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.82)_1px,transparent_0)] [background-size:16px_16px]" /> */}
      </div>

      <div className="relative mx-auto flex w-full max-w-[1220px] flex-col gap-20">
        <motion.div
          style={
            disableMotion
              ? undefined
              : {
                  y: titleY,
                  scale: titleScale,
                  rotateX: titleRotateX,
                }
          }
          className="z-10 pt-2 [transform-style:preserve-3d]"
        >
          {/* <p className="mb-3 inline-flex rounded-full border border-white/5 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
            esta noche no espera
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
                    Esto está pasando
                  </span>
                  <span className="block leading-[1.1] text-white">
                    hoy cerca de ti.
                  </span>
                </>
              ) : (
                <>
                  <BounceInText
                    as="span"
                    text="Esto está pasando"
                    triggerOnView
                    once={false}
                    className="block leading-[1.1] text-white"
                  />
                  <BounceInText
                    as="span"
                    text="hoy cerca de ti."
                    triggerOnView
                    once={false}
                    delay={0.2}
                    className="block leading-[1.1] text-white"
                  />
                </>
              )}
            </div>
          </h1>

          <p className="mx-auto mt-6 max-w-[42ch] text-center text-base leading-relaxed text-white/60 md:text-lg">
            Previsualiza los eventos en el mapa, mira el detalle de cada uno
            y compra tu entrada.
          </p>

          <motion.div
            animate={disableMotion ? { y: 0, scale: 1 } : undefined}
            initial={disableMotion ? false : { y: 40, scale: 0.8 }}
            whileInView={disableMotion ? undefined : { y: 0, scale: 1 }}
            viewport={disableMotion ? undefined : { once: false, amount: 0.12 }}
            transition={
              disableMotion
                ? undefined
                : {
                    duration: 0.65,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.08,
                  }
            }
          >
            <motion.div
              style={
                disableMotion ? undefined : { y: actionsY, scale: actionsScale }
              }
              className="mt-7 flex flex-wrap items-center justify-center gap-3"
            >
              <BorderBeams
                size="md"
                brightness={1}
                strength={2}
                saturation={5}
                colorVariant="pary"
              >
                <Link
                  href={primaryEventUrl}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 font-semibold text-[#101410] transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-px gap-2"
                >
                  <SearchEventIcon className="h-5 w-5 text-black" />
                  <span className="font-medium">Descubrir ahora</span>
                </Link>
              </BorderBeams>
              <div className="relative z-20">
                {disableMotion ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className={`relative flex cursor-pointer items-center justify-center gap-2 bg-zinc-200/10 px-5 py-3 text-white transition-opacity ${
                        showMap
                          ? "pointer-events-none opacity-0"
                          : "opacity-100"
                      }`}
                      style={{ borderRadius: 40 }}
                    >
                      <span className="flex items-center justify-center">
                        <MapIcon className="h-5 w-5 text-white" />
                      </span>
                      <span className="font-medium">Ver en el mapa</span>
                    </button>
                    {showMap && (
                      <div
                        className="absolute -bottom-7 left-0 h-[22rem] w-[min(26rem,calc(100vw-2.5rem))] overflow-hidden bg-zinc-200 md:h-96 md:w-96"
                        style={{ borderRadius: 40 }}
                      >
                        <iframe
                          width="800"
                          height="600"
                          src="https://www.openstreetmap.org/export/embed.html?bbox=11.518773436546327%2C3.8594215453837717%2C11.522313952445986%2C3.861929072022931&amp;layer=mapnik"
                          style={{ border: 0 }}
                          className="h-full w-full grayscale"
                        ></iframe>
                        <button
                          type="button"
                          onClick={() => setShowMap(false)}
                          className="absolute right-4 top-4 rounded-full bg-white p-2 shadow-xl"
                        >
                          <X
                            size={24}
                            strokeWidth={3}
                            className="text-gray-400"
                          />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <motion.div
                      onClick={() => setShowMap(true)}
                      className={`relative flex cursor-pointer items-center justify-center gap-2 bg-zinc-200/10 px-5 py-3 text-white transition-opacity ${
                        showMap
                          ? "pointer-events-none opacity-0"
                          : "opacity-100"
                      }`}
                      style={{ borderRadius: 40 }}
                      layoutId="map"
                    >
                      <motion.div
                        layoutId="close"
                        className="flex items-center justify-center"
                      >
                        <MapIcon className="h-5 w-5 text-white" />
                      </motion.div>
                      <span className="font-medium">Ver en el mapa</span>
                    </motion.div>
                    <AnimatePresence>
                      {showMap && (
                        <motion.div
                          layoutId="map"
                          className="absolute -bottom-7 left-0 h-[22rem] w-[min(26rem,calc(100vw-2.5rem))] overflow-hidden bg-zinc-200 md:h-96 md:w-96"
                          style={{ borderRadius: 40 }}
                        >
                          <iframe
                            width="800"
                            height="600"
                            src="https://www.openstreetmap.org/export/embed.html?bbox=11.518773436546327%2C3.8594215453837717%2C11.522313952445986%2C3.861929072022931&amp;layer=mapnik"
                            style={{ border: 0 }}
                            className="h-full w-full grayscale"
                          ></iframe>
                          <motion.button
                            layoutId="close"
                            onClick={() => setShowMap(false)}
                            className="absolute right-4 top-4 rounded-full bg-white p-2 shadow-xl"
                          >
                            <X
                              size={24}
                              strokeWidth={3}
                              className="text-gray-400"
                            />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          animate={disableMotion ? { y: 0, scale: 1, rotateX: 0 } : undefined}
          initial={disableMotion ? false : { y: 62, scale: 0.8, rotateX: 10 }}
          whileInView={
            disableMotion ? undefined : { y: 0, scale: 1, rotateX: 0 }
          }
          viewport={disableMotion ? undefined : { once: false, amount: 0.08 }}
          transition={
            disableMotion
              ? undefined
              : { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <motion.div
            style={
              disableMotion
                ? undefined
                : {
                    y: gridY,
                    scale: gridScale,
                    rotateX: gridRotateX,
                  }
            }
            className="z-10 [transform-style:preserve-3d]"
          >
            <ChromaGrid items={eventsItems} className="w-full" radius={330} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
