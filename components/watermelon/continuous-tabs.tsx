"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { animate, motion, useMotionValue } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Color del icono y del texto cuando la pestaña está seleccionada */
  color?: string;
}

/**
 * La píldora se posiciona con la medida del botón activo respecto al propio
 * `nav`, no con `layoutId`. Así no se desplaza si la página cambia de tamaño
 * mientras carga (fuentes, datos) y no aparece "subiendo" desde otro sitio.
 */
export function ContinuousTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
}) {
  const nav = useRef<HTMLElement>(null);
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});
  const current = useRef(value);
  const measured = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const [ready, setReady] = useState(false);

  const place = (instant: boolean) => {
    const element = buttons.current[current.current];
    if (!element) return;
    const target = {
      x: element.offsetLeft,
      y: element.offsetTop,
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
    if (instant) {
      // `set` aplica el valor ya, sin esperar a un frame de animación
      x.set(target.x);
      y.set(target.y);
      width.set(target.width);
      height.set(target.height);
      return;
    }
    const transition = {
      type: "spring" as const,
      stiffness: 380,
      damping: 30,
      mass: 0.9,
    };
    animate(x, target.x, transition);
    animate(y, target.y, transition);
    animate(width, target.width, transition);
    animate(height, target.height, transition);
  };

  // Cambio de pestaña: se anima (salvo que aún no se haya medido nunca).
  useEffect(() => {
    current.current = value;
    place(!measured.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Tamaño y fuentes: ajustes instantáneos, sin deslizar.
  useEffect(() => {
    const element = nav.current;
    if (!element) return;
    const remeasure = () => {
      place(true);
      measured.current = true;
      setReady(true);
    };
    const observer = new ResizeObserver(remeasure);
    observer.observe(element);
    void document.fonts?.ready.then(remeasure);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav
      ref={nav}
      className="relative flex h-12 items-stretch gap-0.5 rounded-full bg-transparent p-1 sm:gap-1 sm:p-1.5"
    >
      <motion.div
        aria-hidden
        style={{ x, y, width, height, opacity: ready ? 1 : 0 }}
        className="absolute left-0 top-0 rounded-full bg-secondary"
      />
      {tabs.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            ref={(element) => {
              buttons.current[tab.id] = element;
            }}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-pressed={isActive}
            // Hasta medir, el botón activo lleva su propio fondo (sin parpadeo)
            style={
              isActive && !ready ? { backgroundColor: "#ffffff" } : undefined
            }
            className="relative flex cursor-pointer items-center gap-2 rounded-full px-4 outline-none sm:px-5"
          >
            {tab.icon ? (
              <span
                style={isActive ? { color: tab.color } : undefined}
                className={`relative z-10 flex transition-colors duration-200 ${
                  isActive ? "" : "text-white/60"
                }`}
              >
                {tab.icon}
              </span>
            ) : null}
            <span
              style={isActive ? { color: tab.color } : undefined}
              className={`relative z-10 text-sm font-semibold transition-colors duration-200 ${
                isActive ? "" : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
