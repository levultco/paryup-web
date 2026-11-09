import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/backend";

// SESSION_COOKIE_DOMAIN=.paryup.com comparte la sesión entre paryup.com y backstage.paryup.com.
export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  ...(process.env.SESSION_COOKIE_DOMAIN
    ? { domain: process.env.SESSION_COOKIE_DOMAIN }
    : {}),
};

/** Borra la cookie con el mismo dominio y ruta con que se creó. */
export function clearSession(store: Awaited<ReturnType<typeof cookies>>) {
  store.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
