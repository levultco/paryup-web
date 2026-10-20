"use client";

import { InfiniteSlider } from "@/components/common/infiniteSlider";
import { ProgressiveBlur } from "@/components/common/progressiveBlur";
import { SPONSOR_LOGOS } from "@/constants/sponsors";
import useIsMobile from "@/hooks/useIsMobile";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const repeatedSponsorLogos = [
  ...SPONSOR_LOGOS,
  ...SPONSOR_LOGOS,
  ...SPONSOR_LOGOS,
];

export default function Sponsors() {
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (isMobile) {
    return <div></div>;
  }

  return (
    <section className="relative pt-0 overflow-hidden ">
      <motion.div
        initial={{
          y: 26,
          rotate: 1.4,
          clipPath: "inset(0 18% 0 18% round 999px)",
          scale: 0.92,
          opacity: 0.72,
        }}
        whileInView={{
          y: 0,
          rotate: 0,
          clipPath: "inset(0 0% 0 0% round 999px)",
          scale: 1,
          opacity: 1,
        }}
        viewport={{ once: false, amount: 0.12 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-full w-full items-center"
        style={{ willChange: "transform, clip-path, opacity" }}
      >
        <InfiniteSlider
          className="flex h-full w-full items-center mb-0 py-5 "
          duration={42}
          gap={38}
        >
          {repeatedSponsorLogos.map((logo, index) => (
            <div
              key={`${logo.description}-${index}`}
              className="flex w-full  items-center justify-center"
            >
              <img
                src={logo.image}
                alt={logo.description}
                className={logo.className}
              />
            </div>
          ))}
        </InfiniteSlider>
        <ProgressiveBlur
          className="pointer-events-none absolute top-0 left-0 h-full w-[200px]"
          direction="left"
          blurIntensity={1}
        />
        <ProgressiveBlur
          className="pointer-events-none absolute top-0 right-0 h-full w-[200px]"
          direction="right"
          blurIntensity={1}
        />
      </motion.div>
    </section>
  );
}
