"use client";

import BounceInText from "@/components/common/bounceText";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const EventSourceScreen = () => {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

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

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden px-4 py-16 sm:px-8 md:px-10 md:pb-24  bg-[#121417] rounded-3xl"
    >
      <div className="relative mx-auto flex w-full max-w-[1220px] flex-col gap-20">
        <motion.div
          style={{
            y: titleY,
            scale: titleScale,
            rotateX: titleRotateX,
          }}
          className="z-10 pt-2 [transform-style:preserve-3d]"
        >
          <div className="mt-8 flex w-full flex-col gap-6 md:flex-row md:items-stretch md:gap-8">
            <div className="flex-1">
              <h1
                className="pointer-events-none z-20 text-left font-semibold leading-none tracking-normal text-white"
                style={{
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                  color: "#fff",
                  fontSize: "clamp(2.2rem, 7vw, 6.5rem)",
                }}
              >
                <div className="flex flex-col items-start justify-center">
                  <BounceInText
                    as="span"
                    text="Crea el evento oficial "
                    triggerOnView
                    once={false}
                    className="block leading-[1.1] text-white"
                    typeColor="ocean"
                  />
                  <BounceInText
                    as="span"
                    text="desde móvil o web"
                    triggerOnView
                    once={false}
                    className="block leading-[1.1] text-white"
                    typeColor="ocean"
                  />
                  {/* <BounceInText
                    as="span"
                    text="en un solo flujo."
                    triggerOnView
                    once={false}
                    delay={0.2}
                    className="block leading-[1.1] text-white"
                  /> */}
                </div>
              </h1>

              <p className="mt-6 max-w-[42ch] text-left text-base leading-relaxed text-white/60 md:text-lg">
                Publica una única ficha del evento con fecha, sala, flyer, tipos
                de entrada y aforo. Desde ahí se conectan las ventas, los
                accesos, el equipo y los datos de la noche.
              </p>
            </div>

            <motion.div
              className="h-200 w-full rounded-3xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900 md:max-w-[520px]"
              animate={{ y: 0, scale: 1 }}
              initial={{ y: 40, scale: 0.8 }}
              whileInView={{ y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.12 }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.08,
              }}
            />
          </div>

          <h1
            className="pointer-events-none z-20 text-center font-semibold leading-none tracking-normal text-white mt-30"
            style={{
              fontWeight: 600,
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              color: "#fff",
              fontSize: "clamp(2.2rem, 7vw, 6.5rem)",
            }}
          >
            <div className="flex flex-col items-center justify-center">
              <BounceInText
                as="span"
                text="Crea el evento oficial "
                triggerOnView
                once={false}
                className="block leading-[1.1] text-white"
                typeColor="ocean"
              />
              <BounceInText
                as="span"
                text="desde móvil o web"
                triggerOnView
                once={false}
                className="block leading-[1.1] text-white"
                typeColor="ocean"
              />
              {/* <BounceInText
                    as="span"
                    text="en un solo flujo."
                    triggerOnView
                    once={false}
                    delay={0.2}
                    className="block leading-[1.1] text-white"
                  /> */}
            </div>
          </h1>
          <motion.div
            className="mt-8 h-[520px] w-full rounded-3xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900"
            animate={{ y: 0, scale: 1 }}
            initial={{ y: 40, scale: 0.8 }}
            whileInView={{ y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.12 }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.08,
            }}
          ></motion.div>
        </motion.div>
      </div>
    </section>
  );
};
