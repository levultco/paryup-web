"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type PlanStep = {
  id: string;
  type: "stop" | "transport";
  title: string;
  subtitle?: string;
  icon?: string;
  time?: string;
};

export const planSteps: PlanStep[] = [
  { id: "1", type: "stop", title: "Casa", subtitle: "Salida", time: "22:45" },
  { id: "2", type: "transport", title: "Taxi", subtitle: "15 min", icon: "TX" },
  {
    id: "3",
    type: "stop",
    title: "Opium",
    subtitle: "Primer evento",
    time: "23:30",
  },
  { id: "4", type: "transport", title: "A pie", subtitle: "8 min", icon: "AP" },
  {
    id: "5",
    type: "stop",
    title: "Shoko",
    subtitle: "Segundo evento",
    time: "01:15",
  },
  { id: "6", type: "transport", title: "Uber", subtitle: "12 min", icon: "UB" },
  { id: "7", type: "stop", title: "Casa", subtitle: "Vuelta", time: "03:10" },
];

type PlanRoadmapCardProps = {
  steps?: PlanStep[];
  intervalMs?: number;
  loop?: boolean;
  className?: string;
  initialActiveStep?: number;
};

const CARD_HEIGHT = 320;
const ITEM_HEIGHT = 68;
const CENTER_OFFSET = CARD_HEIGHT / 2 - ITEM_HEIGHT / 2;
const RAIL_X = 18;

const StopNode = ({
  step,
  isActive,
}: {
  step: PlanStep;
  isActive: boolean;
}) => {
  return (
    <div
      className={`w-full rounded-2xl border px-3 py-2.5 transition-colors ${
        isActive
          ? "border-white/12 bg-[#181818]"
          : "border-white/[0.05] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={`text-sm font-semibold tracking-[0.01em] ${isActive ? "text-white" : "text-white/46"}`}
        >
          {step.title}
        </p>
        {step.time ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              isActive
                ? "border border-white/10 bg-white/12 text-white"
                : "border border-white/[0.05] bg-white/[0.03] text-white/46"
            }`}
          >
            {step.time}
          </span>
        ) : null}
      </div>
      {step.subtitle ? (
        <p className={`mt-0.5 text-[11px] ${isActive ? "text-white/56" : "text-white/40"}`}>
          {step.subtitle}
        </p>
      ) : null}
    </div>
  );
};

const TransportNode = ({
  step,
  isActive,
}: {
  step: PlanStep;
  isActive: boolean;
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${
        isActive
          ? "border-white/12 bg-[#181818]"
          : "border-white/[0.05] bg-white/[0.02]"
      }`}
    >
      {step.icon ? (
        <span
          className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[9px] font-semibold tracking-wider ${
            isActive
              ? "bg-white text-black"
              : "bg-white/[0.08] text-white/46"
          }`}
        >
          {step.icon}
        </span>
      ) : null}
      <div className="flex items-center gap-1.5">
        <span
          className={`text-xs font-medium ${isActive ? "text-white/88" : "text-white/46"}`}
        >
          {step.title}
        </span>
        {step.subtitle ? (
          <span className="text-[11px] text-white/40">{step.subtitle}</span>
        ) : null}
      </div>
    </div>
  );
};

export const PlanRoadmapCard = ({
  steps = planSteps,
  intervalMs = 1800,
  loop = true,
  className = "",
  initialActiveStep = 0,
}: PlanRoadmapCardProps) => {
  const safeInitial = Math.min(
    Math.max(initialActiveStep, 0),
    steps.length - 1,
  );
  const [activeStep, setActiveStep] = useState(safeInitial);

  useEffect(() => {
    if (steps.length < 2 || intervalMs <= 0) return;

    const timer = window.setInterval(() => {
      setActiveStep((prev) => {
        if (loop) {
          return prev >= steps.length - 1 ? 0 : prev + 1;
        }
        return Math.min(prev + 1, steps.length - 1);
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, loop, steps.length]);

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl ${className}`}
    >
      <div className="pointer-events-none absolute left-[18px] top-[11%] h-[78%] w-px bg-white/10" />

      <motion.div
        className="relative px-3 py-2"
        animate={{ y: CENTER_OFFSET - activeStep * ITEM_HEIGHT }}
        transition={{ type: "spring", stiffness: 110, damping: 20, mass: 0.8 }}
      >
        {steps.map((step, index) => {
          const distance = Math.abs(index - activeStep);
          const opacity = Math.max(1 - distance * 0.24, 0.2);
          const scale = Math.max(1 - distance * 0.04, 0.92);
          const isActive = index === activeStep;

          return (
            <motion.div
              key={step.id}
              className="relative flex h-[68px] items-center pl-8"
              animate={{
                opacity,
                scale,
              }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <span
                style={{ left: RAIL_X - 4 }}
                className={`absolute top-1/2 -translate-y-1/2 rounded-full transition-all ${
                  step.type === "stop"
                    ? `${isActive ? "h-2 w-2 bg-white" : "h-[5px] w-[5px] bg-white/35"}`
                    : `${isActive ? "h-2 w-2 bg-white" : "h-[5px] w-[5px] bg-white/35"}`
                }`}
              />

              <div className="w-[calc(100%-0.5rem)]">
                {step.type === "stop" ? (
                  <StopNode step={step} isActive={isActive} />
                ) : (
                  <TransportNode step={step} isActive={isActive} />
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

    </div>
  );
};

export const PlanCard = PlanRoadmapCard;
