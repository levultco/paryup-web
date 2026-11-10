"use client";

import { CloseIcon } from "@/components/icons/solar";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

// Curva de Apple para sheets y disclosures: arranque rápido, asentamiento suave.
export const APPLE_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

/** Interruptor estilo iOS: responde al pulsar (la bolita se estira) y respeta reduced-motion. */
export function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-300 motion-reduce:transition-none disabled:opacity-40 ${
        checked ? "bg-emerald-400" : "bg-white/20"
      }`}
    >
      <span
        className={`absolute left-[2px] top-[2px] h-[27px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-300 motion-reduce:transition-none w-[27px] group-active:w-[33px] ${
          checked
            ? "translate-x-[20px] group-active:translate-x-[14px]"
            : "translate-x-0"
        }`}
        style={{ transitionTimingFunction: APPLE_EASE }}
      />
    </button>
  );
}

/** Control segmentado con indicador deslizante. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  disabled,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
  disabled?: boolean;
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  return (
    <div
      role="tablist"
      aria-label={label}
      className={`relative inline-grid rounded-full bg-white/[0.08] p-[3px] ${disabled ? "opacity-50" : ""}`}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      <span
        aria-hidden
        className="absolute bottom-[3px] top-[3px] rounded-full bg-white/[0.18] shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-transform duration-300 motion-reduce:transition-none"
        style={{
          left: 3,
          width: `calc((100% - 6px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
          transitionTimingFunction: APPLE_EASE,
        }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={`relative z-10 h-8 whitespace-nowrap px-4 text-[13px] font-medium transition-colors ${
            o.value === value
              ? "text-white"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Avatar({
  name,
  image,
  size = 40,
}: {
  name: string;
  image?: string | null;
  size?: number;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-white/20 to-white/[0.06] text-sm font-semibold text-white"
      style={{ width: size, height: size }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        name.trim().charAt(0).toUpperCase() || "P"
      )}
    </span>
  );
}

const DOT: Record<string, string> = {
  ACTIVE: "bg-emerald-400",
  PAUSED: "bg-amber-400",
  REVOKED: "bg-white/25",
};
export function StatusDot({ status }: { status: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2 w-2 rounded-full ${DOT[status] ?? "bg-white/25"}`}
    />
  );
}

/** Grupo de filas con esquinas continuas y separadores insertados (lista agrupada de iOS). */
export function Group({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section>
      {title ? (
        <h2 className="mb-2 px-4 text-[13px] font-medium uppercase tracking-[0.04em] text-white/40">
          {title}
        </h2>
      ) : null}
      <ul className="divide-y divide-white/[0.07] overflow-hidden rounded-[28px] bg-raised shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
        {children}
      </ul>
    </section>
  );
}

/** Revela contenido animando la altura sin medirla (grid 0fr → 1fr). */
export function Disclosure({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none"
      style={{
        gridTemplateRows: open ? "1fr" : "0fr",
        opacity: open ? 1 : 0,
        transitionTimingFunction: APPLE_EASE,
      }}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

/** Fila con etiqueta y interruptor (sustituye al checkbox nativo en formularios). */
export function SwitchRow({
  label,
  hint,
  checked,
  onChange,
  disabled,
  className = "",
}: {
  label: ReactNode;
  hint?: ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl bg-white/[0.04] px-4 py-3 ${className}`}
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[15px] text-white/90">{label}</span>
        {hint ? <span className="text-xs text-white/40">{hint}</span> : null}
      </span>
      <Switch
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        label={typeof label === "string" ? label : "toggle"}
      />
    </div>
  );
}

/**
 * Diálogo modal. En móvil sube como hoja desde abajo; desde `sm` aparece centrado con
 * escala. Se cierra con Escape, tocando el fondo o con la CloseIcon, y bloquea el scroll de la página.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  size = "md",
  variant = "center",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "md" | "lg";
  /** `side`: hoja lateral derecha, para formularios largos. */
  variant?: "center" | "side";
}) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      return;
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), 250);
    return () => clearTimeout(timer);
  }, [open]);

  // La entrada solo se lanza cuando el panel ya está en el DOM y con su estado inicial
  // calculado (reflow forzado): con doble rAF, a veces el navegador no llegaba a pintar el
  // estado inicial y el panel aparecía de golpe, sin transición.
  useEffect(() => {
    if (!open || !mounted) return;
    const el = panel.current;
    if (!el) return;
    void el.getBoundingClientRect();
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [open, mounted]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") closeRef.current();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    const prev = document.body.style.overflow;
    const prevGutter = html.style.scrollbarGutter;
    // Al ocultar el scroll de la página, se reserva su hueco para que nada salte.
    html.style.scrollbarGutter = "stable";
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      html.style.scrollbarGutter = prevGutter;
      document.removeEventListener("keydown", onKey);
    };
  }, [mounted, onKey]);

  if (!mounted) return null;
  return createPortal(
    <div
      className={`fixed inset-0 z-[2000] flex ${variant === "side" ? "justify-end sm:p-3" : "items-end justify-center sm:items-center sm:p-6"}`}
      role="presentation"
    >
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none"
        style={{ opacity: shown ? 1 : 0 }}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative flex w-full flex-col overflow-hidden bg-[#161618] shadow-[0_30px_90px_rgba(0,0,0,0.6)] outline-none ring-1 ring-white/10 transition-[transform,opacity] duration-[420ms] motion-reduce:transition-none ${
          variant === "side"
            ? "h-full sm:max-w-[600px] sm:rounded-[28px]"
            : `max-h-[92dvh] rounded-t-[28px] sm:rounded-[28px] ${size === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl"}`
        }`}
        style={{
          transitionTimingFunction: APPLE_EASE,
          opacity: shown ? 1 : 0,
          transform: shown
            ? "none"
            : variant === "side"
              ? "translateX(calc(100% + 24px))"
              : "translateY(24px) scale(0.98)",
        }}
      >
        <header className="flex items-center justify-between gap-4 px-6 pb-3 pt-5">
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-white">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.1] text-white/70 transition-[background-color,transform] duration-100 hover:bg-white/[0.18] hover:text-white active:scale-90"
          >
            <CloseIcon aria-hidden className="h-4 w-4" />
          </button>
        </header>
        <div
          className={`overflow-y-auto overscroll-contain px-6 pb-8 pt-2 [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin] ${
            variant === "side"
              ? "[&_[data-card]:first-child]:border-0 [&_[data-card]:first-child]:pt-0 [&_[data-card]]:rounded-none [&_[data-card]]:border-t [&_[data-card]]:border-white/[0.08] [&_[data-card]]:bg-transparent [&_[data-card]]:p-0 [&_[data-card]]:pt-6 [&_[data-card]]:ring-0 sm:[&_[data-card]]:p-0 sm:[&_[data-card]]:pt-6"
              : ""
          }`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
