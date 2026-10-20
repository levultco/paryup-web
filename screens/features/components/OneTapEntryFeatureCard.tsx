"use client";

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";
import { ReactQRCode } from "@lglab/react-qr-code";
import { FeatureCard } from "./FeatureCard";

type OneTapEntryFeatureCardProps = {
  className?: string;
};

export function OneTapEntryFeatureCard({
  className,
}: OneTapEntryFeatureCardProps) {
  const scanProgress = useMotionValue(0);

  useEffect(() => {
    const control = animate(scanProgress, [0, 1, 0], {
      duration: 4,
      ease: "easeInOut",
      repeat: Number.POSITIVE_INFINITY,
    });

    return () => control.stop();
  }, [scanProgress]);

  const insetVal = useTransform(scanProgress, (s) =>
    Math.max(0, 100 - s * 100),
  );
  const clipPath = useMotionTemplate`inset(0 0 ${insetVal}% 0)`;
  const scannerY = useTransform(scanProgress, (s) => `${s * 100}%`);

  return (
    <FeatureCard
      className={className}
      variant="horizontal"
      textPosition="left"
      title="Compra y vende entradas"
      description="Compra tu entrada y accede con QR. Si no puedes ir, véndela desde la app."
      imageSlotClassName="h-[280px] min-h-[280px] md:h-[340px]"
    >
      <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
        <div className="relative">
          <ReactQRCode
            value="https://paryup.com/entry/one-tap"
            size={220}
            dataModulesSettings={{ style: "rounded", color: "#ffffff" }}
            finderPatternOuterSettings={{ style: "rounded", color: "#ffffff" }}
            finderPatternInnerSettings={{ style: "rounded", color: "#ffffff" }}
            background="#ffffff00"
            marginSize={0}
            svgProps={{ className: "rounded-2xl" }}
          />

          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              clipPath,
            }}
          >
            <ReactQRCode
              value="https://paryup.com/entry/one-tap"
              size={220}
              dataModulesSettings={{ style: "rounded", color: "#24ff57" }}
              finderPatternOuterSettings={{
                style: "rounded",
                color: "#24ff57",
              }}
              finderPatternInnerSettings={{
                style: "rounded",
                color: "#24ff57",
              }}
              background="#ffffff00"
              marginSize={0}
              svgProps={{ className: "rounded-2xl" }}
            />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute left-0 right-0 h-[4px] rounded-full bg-[#24ff57]"
            style={{
              top: scannerY,
              boxShadow: "0 0 12px rgba(36,255,87,0.65)",
            }}
          />
        </div>
      </div>
    </FeatureCard>
  );
}
