import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PREVIEW_COOKIE = "paryup_preview";

// Textos legales: siempre públicos (los enlaza la app y las tiendas), incluso en modo lista de espera.
const PUBLIC_PATHS = [
  "/terms",
  "/privacy",
  "/legal",
  "/cookies",
  "/community-guidelines",
];

export function proxy(request: NextRequest) {
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

export const config = {
  // Excluye assets internos y ficheros estáticos (cualquier ruta con extensión).
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
