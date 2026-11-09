import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  API_URL,
  backendFetch,
  fetchSessionUser,
} from "@/lib/backend";
import { clearSession, cookieOptions } from "@/lib/session-cookie";

export async function GET() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null });

  const user = await fetchSessionUser(token);
  if (!user) {
    clearSession(store);
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
  // Registro explícito (pantalla "Crear cuenta"): permite crear la cuenta con Google. Sin esta
  // marca el backend rechaza un Google sin cuenta (`disableImplicitSignUp`).
  const requestSignUp = body?.register === true;

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
            ? {
                provider: "google",
                idToken: { token: googleIdToken },
                ...(requestSignUp ? { requestSignUp: true } : {}),
              }
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
    // solo registra con `register: true`, el registro es explícito.
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
              "No hay ninguna cuenta con ese Google. Crea una cuenta.",
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
  clearSession(store);
  return NextResponse.json({ user: null });
}
