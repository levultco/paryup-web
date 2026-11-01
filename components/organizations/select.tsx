"use client";

import { ArrowDownIcon, CheckIcon } from "@/components/icons/solar";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { APPLE_EASE } from "@/components/organizations/promoters-ui";

type Option<T extends string> = { value: T; label: string };

/**
 * Desplegable propio (reemplaza al `<select>` nativo). La lista va en un portal con
 * posición fija para no recortarse dentro de los Disclosure, y nace desde el botón.
 */
export function Select<T extends string>({
  value,
  options,
  onChange,
  placeholder,
  label,
  disabled,
  className = "",
  size = "md",
  dimEmpty = false,
}: {
  value: T | "";
  options: Option<T>[];
  onChange: (v: T) => void;
  placeholder?: string;
  label: string;
  disabled?: boolean;
  className?: string;
  /** `sm`: píldora compacta para filtros. */
  size?: "md" | "sm";
  /** Atenúa el texto cuando el valor es "" (opción de tipo «Elegir…»). */
  dimEmpty?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const selected = options.find((o) => o.value === value);

  const close = useCallback(() => {
    setShown(false);
    setTimeout(() => setOpen(false), 150);
  }, []);

  const openList = () => {
    if (disabled) return;
    setRect(button.current?.getBoundingClientRect() ?? null);
    setActive(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };

  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => {
      const n = e.target as Node;
      if (list.current?.contains(n) || button.current?.contains(n)) return;
      close();
    };
    const dismiss = () => close();
    const onScroll = (e: Event) => {
      if (!list.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", away);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", away);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, close]);

  const pick = (o: Option<T>) => {
    onChange(o.value);
    close();
    button.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (options[active]) pick(options[active]);
    }
  };

  const below =
    rect && typeof window !== "undefined"
      ? window.innerHeight - rect.bottom > 260
      : true;

  return (
    <>
      <button
        ref={button}
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKey}
        className={`flex items-center justify-between gap-2 bg-white/[0.07] text-left ${
          size === "sm"
            ? "h-10 rounded-full pl-4 pr-3 text-sm"
            : "h-11 rounded-xl px-3.5 text-[15px]"
        } outline-none transition-[background-color,transform] duration-100 hover:bg-white/[0.1] focus-visible:ring-2 focus-visible:ring-white/30 active:scale-[0.985] disabled:opacity-40 ${className}`}
      >
        <span
          className={`truncate ${selected && !(dimEmpty && value === "") ? "text-white" : "text-white/35"}`}
        >
          {selected?.label ?? placeholder ?? label}
        </span>
        <ArrowDownIcon
          aria-hidden
          className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && rect
        ? createPortal(
            <ul
              ref={list}
              id={id}
              role="listbox"
              aria-label={label}
              className="fixed z-[3000] max-h-64 overflow-y-auto rounded-2xl bg-[#1c1c1e]/85 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/10 backdrop-blur-xl backdrop-saturate-150 transition-[opacity,transform] duration-200 motion-reduce:transition-none"
              style={{
                left: rect.left,
                minWidth: rect.width,
                ...(below
                  ? { top: rect.bottom + 6, transformOrigin: "top left" }
                  : {
                      bottom: window.innerHeight - rect.top + 6,
                      transformOrigin: "bottom left",
                    }),
                opacity: shown ? 1 : 0,
                transform: shown ? "scale(1)" : "scale(0.96)",
                transitionTimingFunction: APPLE_EASE,
              }}
            >
              {options.map((o, i) => (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={o.value === value}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => pick(o)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[15px] text-white transition-colors ${
                    i === active ? "bg-white/[0.12]" : ""
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {o.value === value ? (
                    <CheckIcon
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-white/80"
                    />
                  ) : null}
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </>
  );
}
