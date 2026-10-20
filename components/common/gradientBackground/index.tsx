"use client";

import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

type GradientType = "pary" | "ocean";

const GRADIENT_PRESETS: Record<
  GradientType,
  { colors: string[]; stops: number[] }
> = {
  pary: {
    colors: [
      "#0A0A0A00",
      "#171717",
      "#c679c4",
      "#ffb005",
      "#fff2cc",
      "#ffb005",
      "#e1e1fe",
    ],
    stops: [35, 50, 60, 70, 80, 90, 100],
  },
  ocean: {
    colors: [
      "#0A0A0A00",
      "#0b1f2a",
      "#0e7490",
      "#ffffff",
      "#67e8f9",
      "#22d3ee",
      "#e0f2fe",

      // "#0A0A0A00",
      // "#121212",
      // "#121212",
      // "#ffffff",
      // "#121212",
      // "#22d3ee",
      // "#e0f2fe",

      // "#0A0A0A00",
      // "#171717",
      // "#91fff4",
      // "#13bd89",
      // "#FF1E56",
      // "#FF7F11",
      // "#4361EE",
    ],
    stops: [35, 50, 60, 70, 80, 90, 100],
  },
};

interface AnimatedGradientBackgroundProps {
  /**
   * Preset gradient style.
   * @default "Pary"
   */
  type?: GradientType;

  /**
   * Initial size of the radial gradient, defining the starting width.
   * @default 110
   */
  startingGap?: number;

  /**
   * Enables or disables the breathing animation effect.
   * @default false
   */
  Breathing?: boolean;

  /**
   * Array of colors to use in the radial gradient.
   * Each color corresponds to a stop percentage in `gradientStops`.
   * @default ["#0A0A0A", "#2979FF", "#FF80AB", "#FF6D00", "#FFD600", "#00E676", "#3D5AFE"]
   */
  gradientColors?: string[];

  /**
   * Array of percentage stops corresponding to each color in `gradientColors`.
   * The values should range between 0 and 100.
   * @default [35, 50, 60, 70, 80, 90, 100]
   */
  gradientStops?: number[];

  /**
   * Speed of the breathing animation.
   * Lower values result in slower animation.
   * @default 0.02
   */
  animationSpeed?: number;

  /**
   * Maximum range for the breathing animation in percentage points.
   * Determines how much the gradient "breathes" by expanding and contracting.
   * @default 5
   */
  breathingRange?: number;

  /**
   * Additional inline styles for the gradient container.
   * @default {}
   */
  containerStyle?: React.CSSProperties;

  /**
   * Additional class names for the gradient container.
   * @default ""
   */
  containerClassName?: string;

  /**
   * Additional top offset for the gradient container form the top to have a more flexible control over the gradient.
   * @default 0
   */
  topOffset?: number;
}

/**
 * AnimatedGradientBackground
 *
 * This component renders a customizable animated radial gradient background with a subtle breathing effect.
 * It uses `framer-motion` for an entrance animation and raw CSS gradients for the dynamic background.
 *
 *
 * @param {AnimatedGradientBackgroundProps} props - Props for configuring the gradient animation.
 * @returns JSX.Element
 */
const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
  type = "Pary",
  startingGap = 125,
  Breathing = false,
  gradientColors,
  gradientStops,
  animationSpeed = 0.02,
  breathingRange = 5,
  containerStyle = {},
  topOffset = 0,
  containerClassName = "",
}) => {
  const selectedPreset = GRADIENT_PRESETS[type];
  const resolvedGradientColors = gradientColors ?? selectedPreset.colors;
  const resolvedGradientStops = gradientStops ?? selectedPreset.stops;

  // Validation: Ensure gradientStops and gradientColors lengths match
  if (resolvedGradientColors.length !== resolvedGradientStops.length) {
    throw new Error(
      `GradientColors and GradientStops must have the same length.
     Received gradientColors length: ${resolvedGradientColors.length},
     gradientStops length: ${resolvedGradientStops.length}`,
    );
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    let animationFrame: number;
    let width = startingGap;
    let directionWidth = 1;

    const gradientStopsString = resolvedGradientStops
      .map((stop, index) => `${resolvedGradientColors[index]} ${stop}%`)
      .join(", ");

    const setGradient = (nextWidth: number) => {
      const gradient = `radial-gradient(${nextWidth}% ${nextWidth + topOffset}% at 50% 20%, ${gradientStopsString})`;

      if (containerRef.current) {
        containerRef.current.style.background = gradient;
      }
    };

    if (isMobile || !Breathing) {
      setGradient(startingGap);
      return;
    }

    const animateGradient = () => {
      if (width >= startingGap + breathingRange) directionWidth = -1;
      if (width <= startingGap - breathingRange) directionWidth = 1;
      width += directionWidth * animationSpeed;

      setGradient(width);

      animationFrame = requestAnimationFrame(animateGradient);
    };

    animationFrame = requestAnimationFrame(animateGradient);

    return () => cancelAnimationFrame(animationFrame); // Cleanup animation
  }, [
    startingGap,
    Breathing,
    resolvedGradientColors,
    resolvedGradientStops,
    animationSpeed,
    breathingRange,
    topOffset,
    isMobile,
  ]);

  return (
    <motion.div
      key="animated-gradient-background"
      initial={{
        opacity: 0,
        scale: 1.5,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 2,
          ease: [0.25, 0.1, 0.25, 1], // Cubic bezier easing
        },
      }}
      className={`absolute inset-0 overflow-hidden ${containerClassName}`}
    >
      <div
        ref={containerRef}
        style={containerStyle}
        className="absolute inset-0 transition-transform "
      />
    </motion.div>
  );
};

export default AnimatedGradientBackground;
