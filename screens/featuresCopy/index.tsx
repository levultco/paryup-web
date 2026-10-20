"use client";

import { HorizontalStorySection } from "@/components/common/horizontalStory";
import PixelScanTextReveal from "@/components/common/pixelScanTextReveal";
import { FEATURE_STORY_ITEMS } from "@/constants/featuresStory";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

export const FeaturesScreen = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });

  const titleScale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);
  const titleTransform = useMotionTemplate`scale(${titleScale})`;

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-auto overflow-hidden py-14 md:py-24 "
    >
      <motion.div
        className="mb-3 flex flex-col items-center justify-center md:mb-4"
        style={{ transform: titleTransform, transformOrigin: "50% 50%" }}
      >
        <PixelScanTextReveal
          text="Organiza, entra y conecta "
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

        <PixelScanTextReveal
          text="desde una sola app."
          className="text-center text-4xl font-bold text-white md:text-6xl z-10 pb-0"
          fontFamily="Satoshi, system-ui, sans-serif"
          fontWeight={700}
          color="#ffffff"
          align="center"
          mode={0}
          layers={3}
          speed={0.75}
          delay={0.2}
          width={0.2}
          threshold={0.9}
        />
      </motion.div>

      <HorizontalStorySection items={FEATURE_STORY_ITEMS} />
    </section>
  );
};
