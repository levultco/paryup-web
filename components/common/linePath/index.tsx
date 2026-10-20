"use client";

import {
  isMotionValue,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef } from "react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const LINE_D =
  "M6.71323 260.099C6.71323 260.099 -29.2568 444.582 71.8972 534.25C260.228 701.195 655.984 662.183 934.331 548.731C1185.8 446.236 995.336 17.907 1247.72 122.274C1500.09 226.641 1715.59 -48.2236 1974.77 29.8917C2156.54 84.6772 2186.37 173.301 2289.82 278.076C2395.11 384.714 2336.74 494.93 2503.76 568.207C2701.85 655.113 2986 685.869 3133.04 568.207C3194.36 519.128 3097.1 453.519 3210.75 418.397C3324.41 383.275 3482.8 384.135 3561.75 303.543C3616.87 247.265 3549.75 194.317 3606.87 138.753C3704.6 43.6945 3883.88 15.9706 4061.49 50.3657C4259.02 88.6204 4337.27 322.02 4337.27 322.02C4423.07 412.571 4413.2 541.522 4578.78 531.753C4728.74 522.906 4676.03 399.609 4782.69 336.002C4873.8 281.672 4979.08 204.17 5056.8 226.641C5134.52 249.113 5370.83 58.0279 5621.73 32.3886C5847.74 9.2918 6132.59 -46.6627 6202.53 83.8231C6244.06 161.3 6088.55 205.837 6115.62 285.566C6146.83 377.479 6396.72 371.409 6383.04 464.838C6373.91 527.234 6099.46 588.68 6232.62 597.669C6365.77 606.658 6488.97 644.769 6647.95 623.137C6936 583.943 6988.64 397.59 7151.04 285.566C7313.44 173.542 7097.6 207.366 7120.96 159.726C7158.7 82.7558 7283.64 58.522 7413.45 51.8638C7543.26 45.2056 7720.82 -34.9885 7800.37 41.8765C7872.34 111.412 7678.36 238.127 7678.36 238.127C7638.53 300.214 7723.35 378.454 7818.76 443.865C7976.29 551.868 8178.42 591.801 8407.09 548.731C8657.98 501.475 8582.36 314.437 8789 217.153C8953.38 139.763 9074.67 50.1377 9276.2 83.8231C9418.98 107.687 9406.23 237.898 9554.49 238.127C9648.79 238.272 9615.5 164.72 9772.61 176.206C9929.72 187.691 9971.5 730.5 9971.5 730.5";

export const LinePath = ({
  className,
  progress = 0,
}: {
  className?: string;
  progress?: number | MotionValue<number>;
}) => {
  const basePathRef = useRef<SVGPathElement | null>(null);
  const glowPathRef = useRef<SVGPathElement | null>(null);
  const corePathRef = useRef<SVGPathElement | null>(null);
  const totalLengthRef = useRef(0);

  const setDashoffset = (value: number) => {
    const basePath = basePathRef.current;
    const glowPath = glowPathRef.current;
    const corePath = corePathRef.current;
    if (!basePath || !glowPath || !corePath) return;

    const totalLength = totalLengthRef.current || basePath.getTotalLength();
    const normalized = clamp(value, 0, 1);
    const dashoffset = `${totalLength * (1 - normalized)}`;

    basePath.style.strokeDashoffset = dashoffset;
    glowPath.style.strokeDashoffset = dashoffset;
    corePath.style.strokeDashoffset = dashoffset;
  };

  useEffect(() => {
    const basePath = basePathRef.current;
    const glowPath = glowPathRef.current;
    const corePath = corePathRef.current;
    if (!basePath || !glowPath || !corePath) return;

    const totalLength = basePath.getTotalLength();
    totalLengthRef.current = totalLength;

    [basePath, glowPath, corePath].forEach((path) => {
      path.style.strokeDasharray = `${totalLength} ${totalLength}`;
      path.style.strokeDashoffset = `${totalLength}`;
    });
  }, []);

  useEffect(() => {
    setDashoffset(isMotionValue(progress) ? progress.get() : progress);
  }, [progress]);

  useEffect(() => {
    if (!isMotionValue(progress)) return;

    return progress.on("change", (value) => {
      setDashoffset(value);
    });
  }, [progress]);

  return (
    <svg
      width="9972"
      height="732"
      viewBox="0 0 9972 732"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <filter id="linePathGlow" x="-20%" y="-30%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blurred" />
          <feMerge>
            <feMergeNode in="blurred" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="linePathGlow2" x="-20%" y="-30%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="10" result="blurred" />
          <feMerge>
            <feMergeNode in="blurred" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient
          id="linePathGradient"
          x1="5"
          y1="0"
          x2="9972"
          y2="732"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#283C2F" />
          <stop offset="30%" stopColor="#43dce2" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#43dce2" />
        </linearGradient>

        <linearGradient
          id="linePathBeamGradient"
          x1="0"
          y1="0"
          x2="9972"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="14%" stopColor="#ccf7ff" />
          <stop offset="28%" stopColor="#a3f0f7" />
          <stop offset="42%" stopColor="#c7d3ff" />
          <stop offset="58%" stopColor="#ffffff" />
          <stop offset="72%" stopColor="#f2ffb8" />
          <stop offset="86%" stopColor="#ffb8ce" />
          <stop offset="100%" stopColor="#6bf3ff" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-1600 0; 0 0; 1600 0; 0 0; -1600 0"
            dur="7s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>

      <path
        ref={basePathRef}
        d={LINE_D}
        stroke="url(#linePathGradient)"
        strokeWidth="18"
        opacity={0.18}
        strokeLinecap="round"
      />
      <path
        ref={glowPathRef}
        d={LINE_D}
        stroke="url(#linePathBeamGradient)"
        strokeWidth="26"
        opacity={1}
        strokeLinecap="round"
        filter="url(#linePathGlow)"
      />
      <path
        ref={corePathRef}
        d={LINE_D}
        stroke="url(#linePathBeamGradient)"
        strokeWidth="16"
        opacity={1}
        strokeLinecap="round"
        filter="url(#linePathGlow2)"
      />
    </svg>
  );
};
