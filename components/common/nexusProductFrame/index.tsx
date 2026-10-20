import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type NexusProductFrameProps = {
  title: string;
  subtitle?: string;
  status?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export const NexusProductFrame = ({
  title,
  subtitle,
  status,
  children,
  footer,
  className,
  bodyClassName,
}: NexusProductFrameProps) => {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0c]/88 shadow-[0_24px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.11),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_36%)]" />
      <div className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/28" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/16" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white/84">{title}</p>
            {subtitle ? (
              <p className="truncate text-xs text-white/40">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {status ? (
          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/55">
            {status}
          </span>
        ) : null}
      </div>
      <div className={cn("relative z-10 p-4 sm:p-5 md:p-6", bodyClassName)}>
        {children}
      </div>
      {footer ? (
        <div className="relative z-10 border-t border-white/10 px-4 py-3 text-sm text-white/50 sm:px-5">
          {footer}
        </div>
      ) : null}
    </article>
  );
};

export default NexusProductFrame;
