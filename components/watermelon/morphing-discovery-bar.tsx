"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CloseIcon, MagnifierIcon } from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import {
  ContinuousTabs,
  type TabItem,
} from "@/components/watermelon/continuous-tabs";

/**
 * Morphing Discovery Bar (Watermelon): una barra de categorías que se
 * transforma en un campo de búsqueda. El botón de lupa se ensancha hasta ser
 * el campo y las categorías se funden y dejan paso a un botón de cerrar.
 * Las categorías usan el selector de pestañas medido (sin `layoutId`) para que
 * el indicador no se desplace si la página cambia de tamaño al cargar.
 */
export function MorphingDiscoveryBar({
  categories,
  value,
  onChange,
  query,
  onQueryChange,
  searching,
  onSearchingChange,
  placeholder: placeholderProp,
}: {
  categories: TabItem[];
  value: string;
  onChange: (id: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  searching: boolean;
  onSearchingChange: (searching: boolean) => void;
  placeholder?: string;
}) {
  const { t } = useI18n();
  const placeholder = placeholderProp ?? t("disc.search");
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(320);

  const transition = reduceMotion
    ? { duration: 0 }
    : ({ type: "spring", bounce: 0.2, duration: 0.55 } as const);

  const open = () => {
    setWidth(Math.min(320, window.innerWidth - 136));
    onSearchingChange(true);
  };
  const close = () => {
    onQueryChange("");
    onSearchingChange(false);
  };

  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={false}
        animate={{ width: searching ? width : 48 }}
        transition={transition}
        className="relative flex h-12 shrink-0 items-center overflow-hidden rounded-full bg-secondary"
      >
        <MagnifierIcon className="pointer-events-none absolute left-[14px] h-5 w-5 text-white" />
        {searching ? (
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") close();
            }}
            placeholder={placeholder}
            aria-label={placeholder}
            className="h-full w-full bg-transparent pl-12 pr-4 text-sm font-medium text-white outline-none placeholder:text-white/40 [&::-webkit-search-cancel-button]:hidden"
          />
        ) : (
          <button
            type="button"
            onClick={open}
            aria-label={t("disc.search")}
            className="absolute inset-0 cursor-pointer rounded-full transition-colors hover:bg-white/10"
          />
        )}
      </motion.div>

      <AnimatePresence mode="popLayout" initial={false}>
        {!searching ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <ContinuousTabs
              tabs={categories}
              value={value}
              onChange={onChange}
            />
          </motion.div>
        ) : (
          <motion.button
            key="close"
            type="button"
            onClick={close}
            aria-label={t("disc.searchClose")}
            initial={{ opacity: 0, scale: 0.8, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(6px)" }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            whileTap={{ scale: 0.92 }}
            className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-secondary text-white transition-colors hover:bg-white/10"
          >
            <CloseIcon className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
