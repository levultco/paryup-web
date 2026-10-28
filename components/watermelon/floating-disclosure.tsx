"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import useMeasure from "react-use-measure";

export interface DisclosureItem {
  title: string;
  description: string;
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
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
      >
        <motion.div
          // El radio es fijo (24 px ya es un círculo en el botón de 44 px). Cambiarlo
          // entre "full" y "3xl" al cerrar dibujaba una burbuja mientras la caja encogía.
          // Fondo y borde se desvanecen en lugar de desaparecer de golpe.
          className={`absolute right-0 top-0 z-30 flex items-center justify-center overflow-hidden rounded-3xl transition-[background-color,box-shadow] duration-300 ease-out ${
            isOpen
              ? "bg-neutral-900 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.6)]"
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
                  className="flex w-64 shrink-0 flex-col gap-1"
                >
                  <motion.div
                    className="px-2 pb-2 pt-1"
                    initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      delay: 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                  >
                    {header}
                  </motion.div>
                  {items.map((item, index) => (
                    <motion.button
                      key={item.title}
                      type="button"
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-1.5 text-left hover:bg-white/5"
                      initial={{ opacity: 0, filter: "blur(4px)", y: 20 }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      exit={{
                        opacity: 0,
                        filter: "blur(4px)",
                        transition: { duration: 0.2, ease: "easeOut" },
                      }}
                      transition={{
                        delay: 0.15 + index * 0.04,
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                      onClick={() => {
                        setIsOpen(false);
                        item.onSelect();
                      }}
                    >
                      <span
                        className={`shrink-0 rounded-lg bg-neutral-700 p-2 ${
                          item.danger ? "text-red-400" : "text-neutral-100"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="flex flex-col leading-tight">
                        <span
                          className={`font-semibold ${
                            item.danger ? "text-red-400" : "text-neutral-100"
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-sm text-neutral-400">
                          {item.description}
                        </span>
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  );
}
