"use client";

import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import React, { useRef, useState } from "react";

type BounceInTextProps<T extends React.ElementType = "div"> = {
  text: string;
  className?: string;
  as?: T;
  triggerOnView?: boolean;
  once?: boolean;
  amount?: number;
  play?: boolean;
  delay?: number;
  typeColor?: "default" | "ocean";
};

const chromaGradient =
  "linear-gradient(90deg,#fff 0,#fff 33.33%,#c679c4 40%,#fa3d1d 45%,#ffb005 50%,#e1e1fe 55%,#0358f7 60%,transparent 66.67%,transparent)";

const theme = {
  default:
    "linear-gradient(90deg,#fff 0,#fff 33.33%,#c679c4 40%,#fa3d1d 45%,#ffb005 50%,#e1e1fe 55%,#0358f7 60%,transparent 66.67%,transparent)",

  ocean:
    "linear-gradient(90deg,#fff 0,#fff 33.33%,#c679c4 40%,#fa3d1d 45%,#ffb005 50%,#e1e1fe 55%,#0358f7 60%,transparent 66.67%,transparent)",
};

const BounceInText = <T extends React.ElementType = "div">({
  text,
  className,
  as,
  triggerOnView = false,
  once = true,
  amount = 0.4,
  play,
  delay = 0,
  typeColor = "default",
}: BounceInTextProps<T>) => {
  const Component = as || "div";
  const containerRef = useRef<Element | null>(null);
  const isInView = useInView(containerRef, { once, amount });
  const shouldAnimate = play ?? (!triggerOnView || isInView);
  const [hasSeenOnce, setHasSeenOnce] = useState(!triggerOnView);

  const gradient = theme[typeColor];

  return (
    <Component
      ref={(node) => {
        containerRef.current = node;
      }}
      className={cn(
        "flex flex-wrap items-center justify-center overflow-hidden",
        className,
      )}
    >
      <motion.span
        initial={{
          opacity: 0,
          y: "115%",
          scale: 0.8,
          filter: "blur(1px)",
          "--chroma-pos": "100%",
        }}
        animate={
          shouldAnimate
            ? {
                opacity: 1,
                y: "0%",
                scale: 1,
                filter: "blur(0px)",
                "--chroma-pos": "0%",
              }
            : {
                opacity: 0,
                y: "105%",
                scale: 0.88,
                filter: "blur(1px)",
                "--chroma-pos": hasSeenOnce ? "0%" : "100%",
              }
        }
        transition={{
          opacity: { duration: 0.24, ease: "easeOut" },
          y: { duration: 0.78, type: "spring", bounce: 0.36 },
          scale: { duration: 0.78, type: "spring", bounce: 0.36 },
          filter: { duration: 0.28, ease: "easeOut", delay: delay + 0.1 },
          "--chroma-pos": {
            duration: hasSeenOnce ? 0.01 : 0.9,
            ease: "easeInOut",
            delay: delay + 0.1,
          },
        }}
        onAnimationComplete={() => {
          if (shouldAnimate && !hasSeenOnce) {
            setHasSeenOnce(true);
          }
        }}
        style={
          {
            backgroundImage: gradient,
            backgroundSize: "300% 100%",
            backgroundPosition: "var(--chroma-pos) 0%",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            willChange: "transform, filter, background-position",
          } as React.CSSProperties
        }
        className="inline-block"
      >
        {text}
      </motion.span>
    </Component>
  );
};

export default BounceInText;
