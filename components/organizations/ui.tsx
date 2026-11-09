import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  aside,
}: {
  title: string;
  subtitle?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-4xl font-semibold text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-white/45">{subtitle}</p>
        ) : null}
      </div>
      {aside}
    </header>
  );
}

export function Card({
  title,
  action,
  children,
  id,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-card
      className={`scroll-mt-32 rounded-[32px] bg-raised p-6 ring-1 ring-white/[0.04] sm:p-9 ${className}`}
    >
      {title || action ? (
        <div className="mb-6 flex items-center justify-between gap-3">
          {title ? (
            <h2 className="font-display text-xl font-semibold text-white">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export const pillButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/[0.07] px-5 text-sm font-medium text-white transition-[background-color,color,transform] duration-100 hover:bg-white/[0.13] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40";
export const primaryButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#f4efe6] px-6 text-sm font-semibold text-[#1b1916] transition-[background-color,transform] duration-100 hover:bg-white active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40";
export const dangerButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-red-400 transition-[background-color,transform] duration-100 hover:bg-red-500/10 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40";

export function Notice({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-2xl px-4 py-3 text-sm ${
        tone === "error"
          ? "bg-red-500/10 text-red-300"
          : "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      }`}
    >
      {children}
    </p>
  );
}

export function RolePill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/70">
      {children}
    </span>
  );
}
