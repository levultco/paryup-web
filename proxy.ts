import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PREVIEW_COOKIE = "paryup_preview";

export function proxy(request: NextRequest) {
  if (process.env.WAITLIST_MODE !== "true") return NextResponse.next();

  const { pathname, searchParams } = request.nextUrl;
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

  if (pathname === "/waitlist" || pathname.startsWith("/api/waitlist")) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/waitlist", request.url));
}

export const config = {
  // Excluye assets internos y ficheros estáticos (cualquier ruta con extensión).
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
