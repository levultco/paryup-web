"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type NexusRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
  amount?: number;
  once?: boolean;
};

export const NexusReveal = ({
  children,
  className,
  delay = 0,
  y = 36,
  scale = 0.98,
  amount = 0.18,
  once = false,
}: NexusRevealProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y, scale }}
      whileInView={
        shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }
      }
      viewport={shouldReduceMotion ? undefined : { once, amount }}
      transition={
        shouldReduceMotion
          ? undefined
          : { duration: 0.68, delay, ease: [0.22, 1, 0.36, 1] }
      }
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
};

export default NexusReveal;
