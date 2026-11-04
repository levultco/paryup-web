import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/backend";
import { backstageHostFor, isBackstageHost } from "@/lib/backstage-host";

// Solo desarrollo: en local el navegador no comparte cookies entre localhost y
// backstage.localhost, así que la sesión se traspasa una vez. En producción la comparte
// SESSION_COOKIE_DOMAIN (.paryup.com) y esta ruta no existe.
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  const next = safeNext(
    url.searchParams.get("next") ?? request.headers.get("x-handoff-next"),
  );

  if (isBackstageHost(host)) {
    // Llega con el token desde localhost: lo guarda para este host.
    const token = url.searchParams.get("token");
    if (!token) {
      // Sin cookie en este host: la pide a localhost, que sí la tiene.
      const main = host.replace(/^backstage\./i, "");
      return NextResponse.redirect(
        `${url.protocol}//${main}/api/session/handoff?next=${encodeURIComponent(next)}`,
      );
    }
    const response = NextResponse.redirect(`${url.protocol}//${host}${next}`);
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  }

  // Host principal: tiene la cookie; la envía al subdominio.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const target = new URL(`${url.protocol}//${backstageHostFor(host)}`);
  if (!token) {
    target.pathname = "/login";
  } else {
    target.pathname = "/api/session/handoff";
    target.searchParams.set("token", token);
    target.searchParams.set("next", next);
  }
  return NextResponse.redirect(target);
}
