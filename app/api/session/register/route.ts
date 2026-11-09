import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  API_URL,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  backendFetch,
  fetchSessionUser,
} from "@/lib/backend";
import { cookieOptions } from "@/lib/session-cookie";

// Registro con email y contraseña: usa el sign-up de better-auth (el mismo que el móvil), así la
// cuenta es única y sirve también en la app. Solo se envían email y contraseña: ningún campo de
// rol ni permisos puede llegar desde el navegador. El nombre real se pide después.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "email", code: "email" }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "weak", code: "weak" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await backendFetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: new URL(API_URL).origin,
      },
      body: JSON.stringify({ email, password, name: email.split("@")[0] }),
    });
  } catch {
    return NextResponse.json({ error: "connect", code: "connect" }, { status: 502 });
  }

  const token = res.headers.get("set-auth-token");
  if (!res.ok || !token) {
    // Cuenta existente: no se revela por qué ni se inicia sesión con ella.
    const exists = res.status === 422 || res.status === 409;
    return NextResponse.json(
      { error: exists ? "exists" : "generic", code: exists ? "exists" : "generic" },
      { status: res.status === 429 ? 429 : exists ? 409 : 400 },
    );
  }

  const user = await fetchSessionUser(token);
  if (!user) {
    return NextResponse.json({ error: "generic", code: "generic" }, { status: 400 });
  }
  (await cookies()).set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_MAX_AGE });
  return NextResponse.json({ user });
}
