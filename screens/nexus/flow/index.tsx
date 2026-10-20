"use client";

import BounceInText from "@/components/common/bounceText";
import { Compare } from "@/components/common/compare";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const FlowScreen = () => {
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
      className="relative w-full overflow-hidden px-4 py-16 sm:px-8 md:px-10 md:pb-24"
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
              <BounceInText
                as="span"
                text="Todo lo que ahora "
                triggerOnView
                once={false}
                className="block leading-[1.1] text-white"
              />
              <BounceInText
                as="span"
                text="llevas separado"
                triggerOnView
                once={false}
                className="block leading-[1.1] text-white"
              />
              <BounceInText
                as="span"
                text="en un solo flujo."
                triggerOnView
                once={false}
                delay={0.2}
                className="block leading-[1.1] text-white"
              />
            </div>
          </h1>
          <p className="mx-auto mt-6 max-w-[42ch] text-center text-base leading-relaxed text-white/60 md:text-lg">
            Centraliza entradas, accesos, equipo y datos para que cada evento
            deje de gestionarse a base de mensajes, listas manuales y decisiones
            a última hora.
          </p>

          <motion.div
            className="p-4 border rounded-3xl dark:bg-neutral-900 bg-neutral-100  border-neutral-200 dark:border-neutral-800 px-4 w-full h-190 mt-14"
            animate={{ y: 0, scale: 1 }}
            initial={{ y: 40, scale: 0.8 }}
            whileInView={{ y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.12 }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.08,
            }}
          >
            <Compare
              firstImage="/flow/before.png"
              secondImage="/flow/after.png"
              firstImageClassName="object-cover object-left-top w-full"
              secondImageClassname="object-cover object-left-top w-full"
              className="h-full w-full rounded-4xl md:rounded-lg"
              slideMode="drag"
              autoplay={false}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
