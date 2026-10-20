import NexusReveal from "@/components/common/nexusReveal";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type NexusSectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export const NexusSectionHeader = ({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleClassName,
  descriptionClassName,
}: NexusSectionHeaderProps) => {
  const isCenter = align === "center";

  return (
    <header
      className={cn(
        "relative z-10 flex flex-col",
        isCenter ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <NexusReveal y={18} scale={1}>
          <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/55 backdrop-blur-sm">
            {eyebrow}
          </p>
        </NexusReveal>
      ) : null}

      <NexusReveal delay={0.04}>
        <h2
          className={cn(
            "max-w-[12ch] text-balance font-semibold leading-[0.94] tracking-[-0.045em] text-white",
            isCenter && "mx-auto",
            titleClassName,
          )}
          style={{ fontSize: "clamp(2.9rem, 7vw, 6.9rem)" }}
        >
          {title}
        </h2>
      </NexusReveal>

      {description ? (
        <NexusReveal delay={0.1} y={24} scale={1}>
          <p
            className={cn(
              "mt-6 max-w-[49ch] text-pretty text-base leading-relaxed text-white/58 md:text-lg",
              isCenter && "mx-auto",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        </NexusReveal>
      ) : null}
    </header>
  );
};

export default NexusSectionHeader;
