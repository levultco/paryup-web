import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  API_URL,
  backendFetch,
  fetchSessionUser,
} from "@/lib/backend";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function GET() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null });

  const user = await fetchSessionUser(token);
  if (!user) {
    store.delete(SESSION_COOKIE);
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const googleIdToken =
    typeof body?.googleIdToken === "string" ? body.googleIdToken : "";

  if (!googleIdToken && (!email || !password)) {
    return NextResponse.json(
      { error: "Introduce tu email y contraseña.", code: "missing" },
      { status: 400 },
    );
  }

  let res: Response;
  try {
    res = await backendFetch(
      googleIdToken ? "/api/auth/sign-in/social" : "/api/auth/sign-in/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: new URL(API_URL).origin,
        },
        body: JSON.stringify(
          googleIdToken
            ? { provider: "google", idToken: { token: googleIdToken } }
            : { email, password },
        ),
      },
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con el servidor.", code: "connect" },
      { status: 502 },
    );
  }

  const token = res.headers.get("set-auth-token");
  if (!res.ok || !token) {
    // El backend no crea cuentas con Google si no se pide el registro: la web
    // solo inicia sesión, el registro se hace desde la app.
    if (googleIdToken && !res.ok) {
      const detail = await res.json().catch(() => null);
      const text = JSON.stringify(detail ?? "").toLowerCase();
      if (
        text.includes("signup disabled") ||
        text.includes("sign up disabled")
      ) {
        return NextResponse.json(
          {
            error:
              "No hay ninguna cuenta con ese Google. Regístrate primero desde la app de ParyUp.",
            code: "noAccount",
          },
          { status: 403 },
        );
      }
    }
    return NextResponse.json(
      {
        error: googleIdToken
          ? "No se pudo iniciar sesión con Google."
          : "Email o contraseña incorrectos.",
        code: googleIdToken ? "google" : "credentials",
      },
      { status: res.status === 429 ? 429 : 401 },
    );
  }

  const user = await fetchSessionUser(token);
  if (!user) {
    return NextResponse.json(
      { error: "No se pudo iniciar sesión.", code: "generic" },
      { status: 401 },
    );
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    ...cookieOptions,
    maxAge: SESSION_MAX_AGE,
  });
  return NextResponse.json({ user });
}

export async function DELETE() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await backendFetch("/api/auth/sign-out", {
      method: "POST",
      token,
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }).catch(() => null);
  }
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ user: null });
}
