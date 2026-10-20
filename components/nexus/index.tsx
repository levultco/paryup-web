import NexusReveal from "@/components/common/nexusReveal";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type NexusChapterProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
};

export const NexusChapter = ({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleClassName,
}: NexusChapterProps) => {
  const isCenter = align === "center";

  return (
    <header
      className={cn(
        "relative flex flex-col",
        isCenter ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <NexusReveal y={16} scale={1}>
          <p className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/42">
            {eyebrow}
          </p>
        </NexusReveal>
      ) : null}
      <NexusReveal delay={0.04}>
        <h2
          className={cn(
            "max-w-[13ch] text-balance font-semibold leading-[0.9] tracking-[-0.06em] text-white",
            isCenter && "mx-auto",
            titleClassName,
          )}
          style={{ fontSize: "clamp(3.2rem, 7.6vw, 7.4rem)" }}
        >
          {title}
        </h2>
      </NexusReveal>
      {description ? (
        <NexusReveal delay={0.1} y={24} scale={1}>
          <p
            className={cn(
              "mt-7 max-w-[52ch] text-pretty text-base leading-relaxed text-white/58 md:text-xl",
              isCenter && "mx-auto",
            )}
          >
            {description}
          </p>
        </NexusReveal>
      ) : null}
    </header>
  );
};

type NexusShellProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

export const NexusShell = ({ children, className, innerClassName }: NexusShellProps) => {
  return (
    <div className={cn("rounded-[2.25rem] border border-white/10 bg-white/[0.025] p-2", className)}>
      <div className={cn("rounded-[1.75rem] bg-[#080809] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]", innerClassName)}>
        {children}
      </div>
    </div>
  );
};

export const NexusLine = ({ className }: { className?: string }) => (
  <span className={cn("block h-px bg-gradient-to-r from-transparent via-white/14 to-transparent", className)} />
);
