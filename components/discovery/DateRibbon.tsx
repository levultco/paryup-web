"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  addDays,
  dayOfMonth,
  monthShort,
  daysBetween,
  longDateLabel,
  weekdayShort,
} from "@/lib/discovery";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  selected: string;
  today: string;
  onSelect: (key: string) => void;
  /** Mueve la selección relativa a la última (sin depender del render) */
  onShift: (days: number) => void;
  getCount: (key: string) => number | undefined;
};

/**
 * Cinta de fechas: el día elegido queda fijo en el centro y grande; la cinta se
 * desliza por debajo. Solo se montan los días que caben (selección ± ancho), así
 * que se puede avanzar sin fin sin acumular nodos.
 */
export function DateRibbon({
  selected,
  today,
  onSelect,
  onShift,
  getCount,
}: Props) {
  const { t, locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const dragX = useMotionValue(0);
  const drag = useRef<{
    x: number;
    t: number;
    moved: boolean;
    v: number;
  } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const step = Math.min(112, Math.max(60, (width || 360) / 8));
  const gap = step * 1.05; // el día grande necesita aire a los lados
  const total = width || 360;
  // En pantallas anchas el día elegido va a un tercio: así se ven más días futuros.
  const anchor = total >= 640 ? total * 0.34 : total / 2;
  const before = Math.ceil(anchor / step) + 2;
  const after = Math.ceil((total - anchor) / step) + 2;
  const room = daysBetween(today, selected); // cuántos días se puede retroceder

  const move = useCallback((days: number) => onShift(days), [onShift]);

  // Rueda / trackpad horizontal: un día por cada "paso" de desplazamiento.
  const wheelAcc = useRef(0);
  const wheelAt = useRef(0);
  const latest = useRef({ move, step });
  useEffect(() => {
    latest.current = { move, step };
  });
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      wheelAcc.current += event.deltaX;
      const now = performance.now();
      const threshold = latest.current.step * 0.7;
      if (
        Math.abs(wheelAcc.current) >= threshold &&
        now - wheelAt.current > 70
      ) {
        latest.current.move(wheelAcc.current > 0 ? 1 : -1);
        wheelAcc.current = 0;
        wheelAt.current = now;
      }
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag.current = {
      x: event.clientX,
      t: performance.now(),
      moved: false,
      v: 0,
    };
  };

  const onPointerMove = (event: PointerEvent) => {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.x;
    if (!state.moved && Math.abs(dx) > 5) {
      state.moved = true;
      box.current?.setPointerCapture(event.pointerId);
    }
    if (!state.moved) return;
    const now = performance.now();
    state.v =
      (event.clientX - (state.x + dragX.get())) / Math.max(1, now - state.t);
    state.t = now;
    // Tope por la izquierda: no se puede ir antes de hoy.
    dragX.set(Math.min(dx, room * step + step * 0.4));
  };

  const endDrag = (event: PointerEvent) => {
    const state = drag.current;
    drag.current = null;
    if (!state?.moved) return;
    suppressClick.current = true;
    setTimeout(() => (suppressClick.current = false), 0);
    box.current?.releasePointerCapture(event.pointerId);
    const projected = dragX.get() + state.v * 160;
    const days = -Math.round(projected / step);
    const landing = Math.max(days, -room);
    // La cinta salta a su nueva posición y el desplazamiento residual vuelve a 0.
    const offset = dragX.get() + landing * step;
    dragX.set(offset);
    if (landing !== 0) onShift(landing);
    animate(dragX, 0, {
      duration: reduceMotion ? 0 : 0.32,
      ease: EASE,
    });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => move(1),
      ArrowLeft: () => move(-1),
      PageDown: () => move(7),
      PageUp: () => move(-7),
      Home: () => onSelect(today),
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  const days = Array.from({ length: before + after + 1 }, (_, index) => {
    const rel = index - before;
    const key = addDays(selected, rel);
    return { rel, key, past: daysBetween(today, key) < 0 };
  });

  const transition = { duration: reduceMotion ? 0 : 0.38, ease: EASE };

  return (
    <div
      ref={box}
      role="listbox"
      tabIndex={0}
      aria-label={t("disc.ribbonLabel")}
      aria-activedescendant={`day-${selected}`}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="relative h-[7rem] w-full cursor-grab touch-pan-y select-none overflow-hidden rounded-3xl outline-none [mask-image:linear-gradient(to_right,transparent,#000_16%,#000_84%,transparent)] focus-visible:ring-1 focus-visible:ring-white/40 active:cursor-grabbing"
    >
      <motion.div className="absolute inset-0" style={{ x: dragX }}>
        {days.map(({ rel, key, past }) => {
          const active = rel === 0;
          const count = past ? undefined : getCount(key);
          const x = active ? 0 : rel * step + Math.sign(rel) * gap * 0.55;
          return (
            <motion.div
              key={key}
              id={`day-${key}`}
              role="option"
              aria-selected={active}
              aria-disabled={past || undefined}
              aria-label={`${longDateLabel(key, undefined, locale)}${
                count === undefined
                  ? ""
                  : count === 0
                    ? `, ${t("disc.noEventsAria")}`
                    : `, ${t(count === 1 ? "disc.eventsOne" : "disc.eventsMany", { n: count })}`
              }`}
              onClick={() => {
                if (suppressClick.current || active || past) return;
                onSelect(key);
              }}
              initial={{ x, opacity: 0 }}
              animate={{
                x,
                opacity: past
                  ? 0.06
                  : active
                    ? 1
                    : Math.max(0.3, 0.8 - Math.abs(rel) * 0.07),
              }}
              transition={transition}
              style={{ left: anchor }}
              className={`absolute top-1/2 flex w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center ${past ? "pointer-events-none" : "cursor-pointer"}`}
            >
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                  active
                    ? "text-white/85"
                    : dayOfMonth(key) === 1
                      ? "text-white"
                      : "text-white/70"
                }`}
              >
                {dayOfMonth(key) === 1 && !active
                  ? monthShort(key, locale)
                  : weekdayShort(key, locale)}
              </span>
              <motion.span
                animate={{ scale: active ? 1 : 0.42 }}
                transition={transition}
                className="font-display -mt-0.5 block origin-center text-[3.6rem] font-semibold leading-none tabular-nums text-white"
              >
                {dayOfMonth(key)}
              </motion.span>
              <span
                aria-hidden
                className={`mt-1 h-1.5 w-1.5 rounded-full bg-white transition-opacity duration-300 ${
                  count ? (active ? "opacity-90" : "opacity-60") : "opacity-0"
                }`}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
