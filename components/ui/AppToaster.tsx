"use client";

import { Toaster } from "sileo";
import "sileo/styles.css";

/** Notificaciones de la web (Sileo), con el tema oscuro del sitio. */
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      theme="dark"
      offset={{ top: 92 }}
      options={{ roundness: 18, duration: 3500 }}
    />
  );
}
