"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import useMeasure from "react-use-measure";
import { CloseIcon } from "@/components/icons/solar";

/**
 * Botón que se transforma en su propio panel: la caja crece desde el botón (anclada arriba a la
 * derecha) y el contenido aparece dentro. Cerrado ocupa el sitio del botón y no mueve el diseño.
 */
export function MorphingButton({
  open,
  onOpenChange,
  icon,
  label,
  title,
  closeLabel,
  buttonClassName,
  panelWidth = 380,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: ReactNode;
  label: string;
  /** Título del panel abierto. */
  title: string;
  closeLabel: string;
  /** Aspecto del botón cerrado (el de los botones principales de la web). */
  buttonClassName: string;
  panelWidth?: number;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const [ref, bounds] = useMeasure({ offsetSize: true });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <div className="relative">
      {/* Reserva el hueco del botón cerrado para que el panel no empuje nada */}
      <span aria-hidden className={`invisible ${buttonClassName}`}>
        {icon}
        {label}
      </span>
      <MotionConfig
        transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.5 }}
      >
        <motion.div
          className={`absolute right-0 top-0 z-30 flex items-start overflow-hidden rounded-[28px] transition-[background-color,box-shadow] duration-300 ease-out ${
            open
              ? "bg-raised shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_60px_rgba(0,0,0,0.55)]"
              : "bg-[#f4efe6] shadow-none hover:bg-white"
          }`}
          animate={{
            width: bounds.width > 0 ? bounds.width : "auto",
            height: bounds.height > 0 ? bounds.height : "auto",
          }}
        >
          <div ref={ref} className="shrink-0">
            <AnimatePresence mode="popLayout" initial={false}>
              {!open ? (
                <motion.button
                  key="closed"
                  type="button"
                  aria-expanded={false}
                  className={`${buttonClassName} !bg-transparent`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  transition={{ duration: 0.2, ease: "easeOut", delay: reduce ? 0 : 0.12 }}
                  onClick={() => onOpenChange(true)}
                >
                  {icon}
                  {label}
                </motion.button>
              ) : (
                <motion.div
                  key="open"
                  className="flex shrink-0 flex-col gap-4 p-5"
                  style={{ width: `min(${panelWidth}px, calc(100vw - 3rem))` }}
                  exit={{ opacity: 0, transition: { duration: 0.08, ease: "easeOut" } }}
                >
                  <motion.div
                    className="flex items-center justify-between gap-3"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduce ? { duration: 0 } : { delay: 0.1, type: "spring", bounce: 0, duration: 0.4 }}
                  >
                    <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
                    <button
                      type="button"
                      aria-label={closeLabel}
                      onClick={() => onOpenChange(false)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-white/70 transition-[background-color,color,transform] duration-100 hover:bg-white/[0.14] hover:text-white active:scale-[0.94]"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduce ? { duration: 0 } : { delay: 0.16, type: "spring", bounce: 0, duration: 0.4 }}
                  >
                    {children}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  );
}
