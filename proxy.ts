import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  PANEL_DIR,
  backstageHostFor,
  isBackstageHost,
  isSharedPath,
  panelCleanPath,
  panelRewrite,
} from "@/lib/backstage-host";

const PREVIEW_COOKIE = "paryup_preview";

// Textos legales: siempre públicos (los enlaza la app y las tiendas), incluso en modo lista de espera.
const PUBLIC_PATHS = [
  "/terms",
  "/privacy",
  "/legal",
  "/cookies",
  "/community-guidelines",
];

/** Control de acceso (lista de espera). */
function gate(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (process.env.WAITLIST_MODE !== "true") {
    // Sin lista de espera, la ruta y su API dejan de estar disponibles.
    if (pathname.startsWith("/api/waitlist")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (pathname === "/waitlist") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }
  const previewKey = process.env.WAITLIST_PREVIEW_KEY;

  // ?preview=<clave> activa el acceso a la web real en este navegador.
  if (previewKey && searchParams.get("preview") === previewKey) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("preview");
    const response = NextResponse.redirect(url);
    response.cookies.set(PREVIEW_COOKIE, previewKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  }

  if (previewKey && request.cookies.get(PREVIEW_COOKIE)?.value === previewKey) {
    return NextResponse.next();
  }

  if (
    pathname === "/waitlist" ||
    pathname.startsWith("/api/waitlist") ||
    PUBLIC_PATHS.includes(pathname)
  ) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/waitlist", request.url));
}

export function proxy(request: NextRequest) {
  const gated = gate(request);
  // Redirecciones y bloqueos de la lista de espera: tal cual.
  if (gated.headers.get("x-middleware-next") !== "1") return gated;

  const host = request.headers.get("host") ?? request.nextUrl.host;
  const { pathname, search, protocol } = request.nextUrl;
  const inPanelDir = pathname === PANEL_DIR || pathname.startsWith(`${PANEL_DIR}/`);

  if (isBackstageHost(host)) {
    // La ruta interna no se muestra: /organizations/x -> /x
    if (inPanelDir) {
      return NextResponse.redirect(new URL(`${panelCleanPath(pathname)}${search}`, request.url));
    }
    if (isSharedPath(pathname)) return gated;
    // Solo desarrollo: sin cookie en este host, la pide a localhost (ver /api/session/handoff).
    if (
      process.env.NODE_ENV !== "production" &&
      !process.env.SESSION_COOKIE_DOMAIN &&
      !request.cookies.get("paryup_session")
    ) {
      // (la redirección la hace la ruta: desde el proxy Next la dejaría relativa al mismo host)
      const handoff = request.nextUrl.clone();
      handoff.pathname = "/api/session/handoff";
      const headers = new Headers(request.headers);
      headers.set("x-handoff-next", `${pathname}${search}`);
      return NextResponse.rewrite(handoff, { request: { headers } });
    }
    const url = request.nextUrl.clone();
    url.pathname = panelRewrite(pathname);
    return NextResponse.rewrite(url);
  }

  // Web principal: el panel solo se sirve desde el subdominio.
  if (inPanelDir) {
    return NextResponse.redirect(
      `${protocol}//${backstageHostFor(host)}${panelCleanPath(pathname)}${search}`,
    );
  }
  return gated;
}

export const config = {
  // Excluye assets internos y ficheros estáticos (cualquier ruta con extensión).
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
