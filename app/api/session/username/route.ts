import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

// Disponibilidad de un nombre de usuario con las reglas del backend (formato + unicidad).
export async function GET(request: Request) {
  const value = new URL(request.url).searchParams.get("u") ?? "";
  if (value.trim().length < 2) {
    return NextResponse.json({ valid: false, exists: false, reason: "too_short" });
  }
  try {
    const res = await backendFetch("/auth/check-nickname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: value }),
    });
    if (!res.ok) return NextResponse.json({ error: "generic" }, { status: 502 });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}
