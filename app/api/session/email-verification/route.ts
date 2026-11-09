import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, backendFetch, fetchSessionUser } from "@/lib/backend";

// Verificación del correo de la sesión actual: solo se puede verificar el email de quien tiene
// sesión (nunca uno enviado por el navegador). El backend limita los intentos del código.
export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = token ? await fetchSessionUser(token) : null;
  if (!user) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const action = body?.action === "verify" ? "verify" : "send";
  const call = (path: string, payload: Record<string, string>) =>
    backendFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  try {
    if (action === "send") {
      const res = await call("/auth/send-email-verification", { email: user.email });
      if (!res.ok) return NextResponse.json({ code: "generic" }, { status: 502 });
      return NextResponse.json(await res.json());
    }
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    if (!/^\d{6}$/.test(code)) return NextResponse.json({ code: "invalid" }, { status: 400 });
    const res = await call("/auth/verify-email", { email: user.email, code });
    if (!res.ok) {
      const text = JSON.stringify(await res.json().catch(() => ({}))).toLowerCase();
      const c = text.includes("expirado") ? "expired" : text.includes("intentos") ? "attempts" : "invalid";
      return NextResponse.json({ code: c }, { status: 400 });
    }
    return NextResponse.json({ user: await fetchSessionUser(token!) });
  } catch {
    return NextResponse.json({ code: "connect" }, { status: 502 });
  }
}
