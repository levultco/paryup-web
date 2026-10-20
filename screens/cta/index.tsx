"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const CTAScreen = () => {
  const container = useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"],
  });

  const height = useTransform(scrollYProgress, [0, 0.9], [50, 0]);

  return (
    <section
      ref={container}
      className="relative z-10 mx-auto w-full   bg-background"
    >
      <motion.div style={{ height }} className={"relative "}>
        <div className={"circle"}></div>
      </motion.div>
    </section>
  );
};
