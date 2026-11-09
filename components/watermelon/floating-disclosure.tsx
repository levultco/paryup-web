"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import useMeasure from "react-use-measure";

export interface DisclosureItem {
  title: string;
  /** Ya no se muestra en el menú; se conserva por si otro uso lo necesita. */
  description?: string;
  icon: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

export function FloatingDisclosure({
  trigger,
  header,
  items,
  label,
}: {
  trigger: ReactNode;
  header: ReactNode;
  items: DisclosureItem[];
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const reduce = useReducedMotion();
  const [ref, bounds] = useMeasure({ offsetSize: true });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative h-11 w-11">
      <MotionConfig
        transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.45 }}
      >
        <motion.div
          // El radio es fijo (24 px ya es un círculo en el botón de 44 px). Cambiarlo
          // entre "full" y "3xl" al cerrar dibujaba una burbuja mientras la caja encogía.
          // Fondo y borde se desvanecen en lugar de desaparecer de golpe.
          className={`absolute right-0 top-0 z-30 flex items-center justify-center overflow-hidden rounded-[28px] transition-[background-color,box-shadow] duration-300 ease-out ${
            isOpen
              ? "bg-[#1b1a18] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_60px_rgba(0,0,0,0.65)]"
              : "bg-neutral-900/0 shadow-[0_0_0_1px_rgba(255,255,255,0),0_0_0_rgba(0,0,0,0)]"
          }`}
          animate={{
            width: bounds.width > 0 ? bounds.width : "auto",
            height: bounds.height > 0 ? bounds.height : "auto",
          }}
        >
          <div ref={ref} className={`shrink-0 ${isOpen ? "p-2" : ""}`}>
            <AnimatePresence mode="popLayout" initial={false}>
              {!isOpen ? (
                <motion.button
                  key="closed"
                  type="button"
                  aria-label={label}
                  aria-expanded={false}
                  className="block h-11 w-11 cursor-pointer overflow-hidden rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  // Al abrir, el botón se quita al instante: con `popLayout` un fundido se
                  // quedaba flotando a la izquierda de la caja mientras crecía.
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsOpen(true)}
                >
                  {trigger}
                </motion.button>
              ) : (
                <motion.div
                  key="open"
                  className="flex w-64 shrink-0 flex-col"
                >
                  <motion.div
                    className="px-3 pb-3.5 pt-2.5"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduce ? { duration: 0 } : { delay: 0.08, type: "spring", bounce: 0, duration: 0.4 }
                    }
                  >
                    {header}
                  </motion.div>
                  <div className="flex flex-col gap-1">
                    {items.map((item, index) => (
                      <div key={item.title}>
                        {item.danger && index > 0 ? (
                          <div className="h-1.5" />
                        ) : null}
                        <motion.button
                          type="button"
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-2.5 py-2 text-left text-[15px] font-medium transition-[background-color,transform] duration-100 active:scale-[0.98] ${
                            item.danger
                              ? "text-red-400 hover:bg-red-500/10"
                              : "text-neutral-100 hover:bg-white/[0.06]"
                          }`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeOut" } }}
                          transition={
                            reduce
                              ? { duration: 0 }
                              : { delay: 0.12 + index * 0.03, type: "spring", bounce: 0, duration: 0.4 }
                          }
                          onClick={() => {
                            setIsOpen(false);
                            item.onSelect();
                          }}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl [&>svg]:h-[18px] [&>svg]:w-[18px] ${
                              item.danger
                                ? "bg-red-500/10"
                                : "bg-white/[0.06] text-white/70"
                            }`}
                          >
                            {item.icon}
                          </span>
                          {item.title}
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  );
}
