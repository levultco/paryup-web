"use client";

import { isMotionValue, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useId, useRef } from "react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const TRAIL_RATIO = 0.32;
const VANISH_START = 0.84;
const SVG_WIDTH = 2717;
const SVG_HEIGHT = 889;
const BASE_STROKE_WIDTH = 26;
const GLOW_STROKE_WIDTH = 170;
const CORE_STROKE_WIDTH = 24;
const GLOW_BLUR_STD = 10;
const SAFE_PADDING = Math.ceil(GLOW_STROKE_WIDTH + GLOW_BLUR_STD * 6);
const FILTER_X = -SAFE_PADDING * 2;
const FILTER_Y = -SAFE_PADDING * 2;
const FILTER_WIDTH = SVG_WIDTH + SAFE_PADDING * 4;
const FILTER_HEIGHT = SVG_HEIGHT + SAFE_PADDING * 4;

const LINE_D =
  "M0.0480042 50.3539C0.0480042 50.3539 324.343 83.4436 525.548 135.854C763.054 197.72 867.708 343.331 1112.55 360.354C1170.79 364.403 1213.62 327.742 1262.05 360.354C1333.96 408.78 1306.34 507.828 1262.05 582.354C1187.52 707.739 1007.93 666.165 888.548 582.354C718.511 462.976 718.511 169.732 888.548 50.3539C1007.93 -33.4573 1123.82 3.78003 1262.05 50.3539C1454.39 115.161 1467.18 296.067 1629.55 417.854C1766.99 520.946 1856.31 562.143 2010.55 637.824C2273.02 766.614 2431.13 822.759 2716.05 888.354";

export const LinePathMobile = ({
  className,
  progress = 0,
}: {
  className?: string;
  progress?: number | MotionValue<number>;
}) => {
  const gradientId = useId();
  const beamGradientId = useId();
  const glowFilterId = useId();
  const glowFilter2Id = useId();
  const guidePathRef = useRef<SVGPathElement | null>(null);
  const basePathRef = useRef<SVGPathElement | null>(null);
  const glowPathRef = useRef<SVGPathElement | null>(null);
  const corePathRef = useRef<SVGPathElement | null>(null);
  const totalLengthRef = useRef(0);

  const getProgressValue = useCallback(
    (value: number | MotionValue<number>) =>
      isMotionValue(value) ? value.get() : value,
    [],
  );

  const buildSegmentPath = useCallback(
    (guidePath: SVGPathElement, fromDistance: number, toDistance: number) => {
      const segmentLength = Math.max(0, toDistance - fromDistance);
      if (segmentLength <= 0) return "";

      const steps = Math.max(12, Math.ceil(segmentLength / 14));
      const points: string[] = [];

      for (let i = 0; i <= steps; i += 1) {
        const ratio = i / steps;
        const distance = fromDistance + segmentLength * ratio;
        const point = guidePath.getPointAtLength(distance);
        points.push(`${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
      }

      if (points.length === 0) return "";
      return `M ${points[0]} L ${points.slice(1).join(" L ")}`;
    },
    [],
  );

  const updateSegment = useCallback(
    (value: number) => {
      const guidePath = guidePathRef.current;
      const basePath = basePathRef.current;
      const glowPath = glowPathRef.current;
      const corePath = corePathRef.current;
      if (!guidePath || !basePath || !glowPath || !corePath) return;

      const totalLength = totalLengthRef.current || guidePath.getTotalLength();
      const headProgress = clamp(value, 0, 1);
      const vanishT = clamp(
        (headProgress - VANISH_START) / (1 - VANISH_START),
        0,
        1,
      );
      const trailRatio = TRAIL_RATIO * (1 - vanishT);
      const tailProgress = clamp(headProgress - trailRatio, 0, 1);
      const startDistance = totalLength * tailProgress;
      const endDistance = totalLength * headProgress;
      const segmentD = buildSegmentPath(guidePath, startDistance, endDistance);

      basePath.setAttribute("d", segmentD);
      glowPath.setAttribute("d", segmentD);
      corePath.setAttribute("d", segmentD);
    },
    [buildSegmentPath],
  );

  useEffect(() => {
    const guidePath = guidePathRef.current;
    if (!guidePath) return;
    const totalLength = guidePath.getTotalLength();
    totalLengthRef.current = totalLength;
    updateSegment(getProgressValue(progress));
  }, [progress, updateSegment, getProgressValue]);

  useEffect(() => {
    if (isMotionValue(progress)) {
      updateSegment(progress.get());
      const unsubscribe = progress.on("change", (value) => {
        updateSegment(value);
      });
      return () => {
        unsubscribe();
      };
    }

    updateSegment(getProgressValue(progress));
  }, [progress, updateSegment, getProgressValue]);

  return (
    <svg
      width={SVG_WIDTH}
      height={SVG_HEIGHT}
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path ref={guidePathRef} d={LINE_D} fill="none" stroke="none" />
      <defs>
        <filter
          id={glowFilterId}
          filterUnits="userSpaceOnUse"
          x={FILTER_X}
          y={FILTER_Y}
          width={FILTER_WIDTH}
          height={FILTER_HEIGHT}
        >
          <feGaussianBlur stdDeviation="5" result="blurred" />
          <feMerge>
            <feMergeNode in="blurred" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter
          id={glowFilter2Id}
          filterUnits="userSpaceOnUse"
          x={FILTER_X}
          y={FILTER_Y}
          width={FILTER_WIDTH}
          height={FILTER_HEIGHT}
        >
          <feGaussianBlur stdDeviation={GLOW_BLUR_STD} result="blurred" />
          <feMerge>
            <feMergeNode in="blurred" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient
          id={gradientId}
          x1="5"
          y1="0"
          x2="2717"
          y2="889"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#283C2F" />
          <stop offset="30%" stopColor="#43dce2" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#43dce2" />
        </linearGradient>

        <linearGradient
          id={beamGradientId}
          x1="0"
          y1="0"
          x2="2717"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="14%" stopColor="#c679c4" />
          <stop offset="28%" stopColor="#fa3d1d" />
          <stop offset="42%" stopColor="#ffb005" />
          <stop offset="58%" stopColor="#e1e1fe" />
          <stop offset="72%" stopColor="#0358f7" />
          <stop offset="86%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c679c4" />
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
        d=""
        stroke={`url(#${gradientId})`}
        strokeWidth={BASE_STROKE_WIDTH}
        opacity={0.18}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        ref={glowPathRef}
        d=""
        stroke={`url(#${beamGradientId})`}
        strokeWidth={GLOW_STROKE_WIDTH}
        opacity={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowFilterId})`}
      />
      <path
        ref={corePathRef}
        d=""
        stroke={`url(#${beamGradientId})`}
        strokeWidth={CORE_STROKE_WIDTH}
        opacity={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowFilter2Id})`}
      />
    </svg>
  );
};
