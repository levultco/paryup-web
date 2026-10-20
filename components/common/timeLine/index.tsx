"use client";

import { type MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const LINE_D =
  "M960 0 C1042 270 1062 560 960 850 C860 1138 846 1420 964 1700 C1082 1980 1110 2270 986 2550 C862 2830 838 3115 958 3386 C1078 3658 1110 3945 986 4218 C862 4492 838 4788 958 5062 C1078 5336 1094 5616 970 5938";

export const TimeLine = ({
  className,
  progress = 0,
}: {
  className?: string;
  progress?: number | MotionValue<number>;
}) => {
  const progressPathRef = useRef<SVGPathElement | null>(null);
  const corePathRef = useRef<SVGPathElement | null>(null);
  const totalLengthRef = useRef(0);

  const applyProgress = (value: number) => {
    const progressPath = progressPathRef.current;
    const corePath = corePathRef.current;
    if (!progressPath || !corePath) return;

    const totalLength = totalLengthRef.current || progressPath.getTotalLength();
    const normalized = clamp(value, 0, 1);
    const dashoffset = `${totalLength * (1 - normalized)}`;

    progressPath.style.strokeDashoffset = dashoffset;
    corePath.style.strokeDashoffset = dashoffset;
  };

  useEffect(() => {
    const progressPath = progressPathRef.current;
    const corePath = corePathRef.current;
    if (!progressPath || !corePath) return;

    const totalLength = progressPath.getTotalLength();
    totalLengthRef.current = totalLength;

    [progressPath, corePath].forEach((path) => {
      path.style.strokeDasharray = `${totalLength} ${totalLength}`;
      path.style.strokeDashoffset = `${totalLength}`;
    });
  }, []);

  useEffect(() => {
    if (typeof progress === "number") {
      applyProgress(progress);
      return;
    }

    applyProgress(progress.get());
    const unsubscribe = progress.on("change", (latest) => {
      applyProgress(latest);
    });

    return unsubscribe;
  }, [progress]);

  return (
    <svg
      width="1920"
      height="5939"
      viewBox="0 0 1920 5939"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={LINE_D}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="10 20"
      />

      <path
        ref={progressPathRef}
        d={LINE_D}
        stroke="rgba(199, 221, 255, 0.38)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity={0.42}
      />

      <path
        ref={corePathRef}
        d={LINE_D}
        stroke="rgba(245, 250, 255, 0.82)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity={0.78}
      />
    </svg>
  );
};
