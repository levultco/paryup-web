"use client";

import PixelScanTextReveal from "@/components/common/pixelScanTextReveal";
import { Spotlight } from "@/components/common/spotlight";
import { TodayNearYouSection } from "@/components/common/todayNearYouSection";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

export const IntroScreen = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // const titleY = useTransform(scrollYProgress, [0, 1], [200, -230]);
  // const subtitleY = useTransform(scrollYProgress, [0, 1], [0, -0]);
  // const textY = useTransform(scrollYProgress, [0, 1], [0, -260]);

  const titleScale = useTransform(scrollYProgress, [0, 1], [0.7, 1.5]);
  const subtitleScale = useTransform(scrollYProgress, [0, 1], [0.7, 1.5]);
  const textScale = useTransform(scrollYProgress, [0, 1], [0.7, 1.2]);

  const titleX = useTransform(scrollYProgress, [0.1, 0.5], [-200, 0]);
  const textX = useTransform(scrollYProgress, [0.1, 0.5], [200, 0]);

  const opacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);

  const rotateTitle = useTransform(scrollYProgress, [0.1, 0.5], [10, 0]);
  const rotateText = useTransform(scrollYProgress, [0.1, 0.5], [-10, 0]);

  const titleTransform = useMotionTemplate`translateX(${titleX}px) rotate(${rotateTitle}deg)`;
  const textTransform = useMotionTemplate`translateX(${textX}px) rotate(${rotateText}deg)`;

  return (
    <section
      ref={sectionRef}
      className="relative h-auto w-full overflow-hidden flex flex-col items-center justify-around mx-auto "
    >
      <Spotlight />

      <div className="w-full flex flex-row items-start justify-around">
        <motion.div>
          <PixelScanTextReveal
            text="Que es Paryup?"
            className="text-center text-4xl font-bold text-white md:text-6xl z-10 pb-0"
            fontFamily="Satoshi, system-ui, sans-serif"
            fontWeight={700}
            color="#ffffff"
            align="center"
            mode={0}
            layers={3}
            speed={1.2}
            delay={0}
            width={0.2}
            threshold={0.9}
          />
        </motion.div>
        <motion.div className="pt-0">
          <h3 className=" text-lg font-semibold text-white/48 md:text-[28px] max-w-4xl">
            <span className="text-white">
              Desde elegir el plan hasta vivirlo dentro.{" "}
            </span>
            Paryup es la app que organiza toda tu experiencia de fiesta.
            Descubre qué esta pasando, elige tu plan, entra sin complicaciones y
            conecta con la gente adecuada.
          </h3>
        </motion.div>
      </div>

      {/* <div className="flex flex-col items-center justify-center">
        <motion.div style={{ scale: titleScale }}>
          <PixelScanTextReveal
            text="La noche,"
            className="text-center text-4xl font-bold text-white md:text-6xl z-10 pb-0"
            fontFamily="Satoshi, system-ui, sans-serif"
            fontWeight={700}
            color="#ffffff"
            align="center"
            mode={0}
            layers={3}
            speed={1.2}
            delay={0}
            width={0.2}
            threshold={0.9}
          />
        </motion.div>

        <motion.div style={{ scale: subtitleScale }}>
          <PixelScanTextReveal
            text="bien hecha."
            className="text-center text-4xl font-bold text-white md:text-6xl z-10 pb-0"
            fontFamily="Satoshi, system-ui, sans-serif"
            fontWeight={700}
            color="#ffffff"
            align="center"
            mode={0}
            layers={3}
            speed={1.2}
            delay={0}
            width={0.2}
            threshold={0.9}
          />
        </motion.div>
      </div>

      <motion.div style={{ scale: textScale }} className="pt-10">
        <h3 className="text-center text-lg font-semibold text-white/48 md:text-[28px] max-w-5xl">
          <span className="text-white">
            Desde elegir el plan hasta vivirlo dentro.{" "}
          </span>
          Paryup organiza tu noche paso a paso para que solo te preocupes de
          disfrutar.
        </h3>
      </motion.div> */}
    </section>
  );
};
