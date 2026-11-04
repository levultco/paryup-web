// El panel de organizaciones vive en un subdominio propio:
//   backstage.paryup.com           -> listado de organizaciones (app/organizations)
//   backstage.paryup.com/{slug}/…  -> panel de la organización (app/organizations/[slug]/…)
// En local funciona igual con backstage.localhost:3001 (el navegador lo resuelve a localhost).

export const PANEL_DIR = "/organizations";

/** Rutas compartidas con la web principal que no son una organización. */
const SHARED_PATHS = [
  "/api",
  "/login",
  "/assets",
  "/.well-known",
  "/terms",
  "/privacy",
  "/legal",
  "/cookies",
  "/community-guidelines",
];

export function isBackstageHost(host: string): boolean {
  return host.toLowerCase().startsWith("backstage.");
}

/** `paryup.com` / `www.paryup.com` / `localhost:3001` -> `backstage.…` */
export function backstageHostFor(host: string): string {
  return `backstage.${host.replace(/^www\./i, "")}`;
}

export function isSharedPath(pathname: string): boolean {
  return SHARED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Ruta interna que sirve una URL limpia del subdominio. */
export function panelRewrite(pathname: string): string {
  return pathname === "/" ? PANEL_DIR : `${PANEL_DIR}${pathname}`;
}

/** URL limpia del subdominio para una ruta interna `/organizations/…`. */
export function panelCleanPath(pathname: string): string {
  const rest = pathname.slice(PANEL_DIR.length);
  return rest === "" ? "/" : rest;
}
