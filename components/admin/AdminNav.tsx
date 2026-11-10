"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TABS = [
  { href: "/organizations/admin/fourvenues", label: "Vinculaciones Fourvenues" },
  { href: "/organizations/admin/backstage-leads", label: "Solicitudes Backstage" },
];

/** Pestañas de administración: el fondo se desliza hasta la sección elegida. */
export function AdminNav() {
  const pathname = usePathname();
  const current = TABS.find((t) => pathname.endsWith(t.href))?.href ?? TABS[0].href;
  // Marca al instante al pulsar, sin esperar a que cargue la ruta.
  const [selected, setSelected] = useState(current);
  useEffect(() => setSelected(current), [current]);

  return (
    <nav
      aria-label="Administración"
      className="mb-8 inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/[0.07] p-1"
    >
      {TABS.map((t) => {
        const active = selected === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            onClick={() => setSelected(t.href)}
            aria-current={active ? "page" : undefined}
            className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
              active ? "font-medium text-black" : "text-white/60 hover:text-white"
            }`}
          >
            {active && (
              <motion.span
                layoutId="admin-tab-pill"
                className="absolute inset-0 rounded-full bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_6px_rgba(0,0,0,0.3)]"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
