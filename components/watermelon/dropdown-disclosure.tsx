"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowDownIcon, CloseIcon } from "@/components/icons/solar";
import useMeasure from "react-use-measure";
import { useI18n } from "@/components/i18n/LocaleProvider";

export interface DropdownItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

/**
 * Dropdown Disclosure (Watermelon): el propio botón se despliega en la lista
 * y su tamaño se anima con un muelle. Se reserva el hueco del botón cerrado
 * para que el desplegable flote sin empujar el resto de la página.
 */
export function DropdownDisclosure({
  items,
  value,
  onChange,
  title,
  label,
  triggerIcon,
  triggerIconClass = "bg-white/10 text-white",
}: {
  items: DropdownItem[];
  value: string;
  onChange: (id: string) => void;
  title: string;
  label: string;
  triggerIcon?: ReactNode;
  triggerIconClass?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const selected = items.find((item) => item.id === value) ?? items[0];
  const [measureRef, bounds] = useMeasure({ offsetSize: true });
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerContent = (
    <>
      {triggerIcon ? (
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${triggerIconClass}`}
        >
          {triggerIcon}
        </span>
      ) : null}
      <span className="text-sm font-semibold">{selected.label}</span>
      <ArrowDownIcon className="ml-1 h-4 w-4 text-white/60" />
    </>
  );

  return (
    <div ref={root} className="relative h-12">
      {/* Copia invisible del botón cerrado: reserva el hueco en el layout */}
      <div
        aria-hidden
        className="invisible flex h-12 items-center gap-2.5 pl-2 pr-4"
      >
        {triggerContent}
      </div>

      <MotionConfig
        transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.9 }}
      >
        <motion.div
          initial={false}
          animate={{
            width: bounds.width > 0 ? bounds.width : "auto",
            height: bounds.height > 0 ? bounds.height : "auto",
          }}
          className={`absolute right-0 top-0 z-30 overflow-hidden rounded-3xl border ${
            open
              ? "border-white/5 bg-secondary"
              : "border-transparent bg-secondary hover:bg-white/10"
          }`}
        >
          <div ref={measureRef} className="w-max">
            <AnimatePresence mode="popLayout" initial={false}>
              {!open ? (
                <motion.button
                  key="trigger"
                  type="button"
                  aria-label={label}
                  aria-haspopup="listbox"
                  aria-expanded={false}
                  onClick={() => setOpen(true)}
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  className="flex h-[2.875rem] cursor-pointer items-center gap-2.5 pl-2 pr-4 text-white"
                >
                  {triggerContent}
                </motion.button>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  className="min-w-[17rem] p-3"
                >
                  <div className="mb-2 flex items-center justify-between px-2">
                    <span className="text-sm font-semibold text-white/50">
                      {title}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label={t("common.close")}
                      className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10"
                    >
                      <CloseIcon className="h-5 w-5 text-white" />
                    </button>
                  </div>
                  <div
                    role="listbox"
                    aria-label={label}
                    className="flex flex-col gap-0.5"
                  >
                    {items.map((item) => {
                      const active = item.id === selected.id;
                      return (
                        <motion.button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={active}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onChange(item.id);
                            setOpen(false);
                          }}
                          className="flex cursor-pointer items-center justify-between gap-6 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.07]"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-white">
                              {item.label}
                            </span>
                            {item.description ? (
                              <span className="block truncate text-xs text-white/45">
                                {item.description}
                              </span>
                            ) : null}
                          </span>
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                              active
                                ? "border-white bg-white"
                                : "border-white/20"
                            }`}
                          >
                            <AnimatePresence initial={false}>
                              {active ? (
                                <motion.span
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ duration: 0.18 }}
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4 text-black"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden
                                  >
                                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                                  </svg>
                                </motion.span>
                              ) : null}
                            </AnimatePresence>
                          </span>
                        </motion.button>
                      );
                    })}
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
