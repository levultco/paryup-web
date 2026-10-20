import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  className?: string;
  imageSlotClassName?: string;
  textClassName?: string;
  h3ClassName?: string;
  variant?: "horizontal" | "vertical";
  textPosition?: "left" | "right" | "top" | "bottom";
  isRelative?: boolean;
  children?: ReactNode;
};

export function FeatureCard({
  title,
  description,
  className,
  imageSlotClassName,
  textClassName,
  h3ClassName,
  variant = "vertical",
  textPosition,
  isRelative = true,
  children,
}: FeatureCardProps) {
  const resolvedTextPosition =
    textPosition ?? (variant === "horizontal" ? "left" : "top");

  const isHorizontal = variant === "horizontal";
  const textFirst =
    resolvedTextPosition === "left" || resolvedTextPosition === "top";

  return (
    <article
      className={cn(
        "relative flex h-full gap-7 rounded-[28px] border border-white/5 bg-secondary/60 p-6 md:p-8 overflow-hidden",
        isHorizontal ? "flex-col lg:flex-row lg:items-center" : "flex-col",
        className,
      )}
    >
      <div
        className={cn(
          "space-y-3  z-1",
          isHorizontal
            ? "max-w-[34rem] lg:w-[34rem] lg:max-w-none px-9"
            : "max-w-[22rem] ",
          !textFirst && "order-2 ",
          textClassName,
        )}
      >
        <h3
          className={cn(
            "text-balance text-2xl font-semibold leading-tight text-white md:text-2xl",
            h3ClassName,
          )}
        >
          {title}
        </h3>
        <p className="max-w-[60ch] text-pretty text-sm leading-relaxed text-white/65 md:text-base">
          {description}
        </p>
      </div>

      <div
        className={cn(
          "w-full xl:flex-1 overflow-hidden rounded-2xl",
          isRelative ? "relative" : "",
          isHorizontal ? "lg:w-[56%]" : "",
          !textFirst && "order-1",
          imageSlotClassName,
        )}
      >
        {children}
      </div>
    </article>
  );
}
