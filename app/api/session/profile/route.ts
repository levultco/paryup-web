import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, backendFetch, fetchSessionUser } from "@/lib/backend";

// Perfil básico del registro web (nombre + nombre de usuario). El backend valida formato y
// unicidad y no sobrescribe un perfil ya completo.
export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : "";
  const username = typeof body?.username === "string" ? body.username : "";

  let res: Response;
  try {
    res = await backendFetch("/users/me/basic-profile", {
      method: "POST",
      token,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username }),
    });
  } catch {
    return NextResponse.json({ code: "connect" }, { status: 502 });
  }
  if (!res.ok) {
    const code = res.status === 409 ? "taken" : res.status === 400 ? "invalid" : "generic";
    return NextResponse.json({ code }, { status: res.status === 409 ? 409 : 400 });
  }
  const user = await fetchSessionUser(token);
  return NextResponse.json({ user });
}
