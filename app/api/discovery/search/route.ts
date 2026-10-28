import { NextResponse } from "next/server";
import { searchUpcoming } from "@/lib/discovery-server";
import { MAX_QUERY_LENGTH } from "@/lib/discovery";

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (!q || q.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: "Búsqueda inválida" }, { status: 400 });
  }

  const events = await searchUpcoming(q).catch(() => null);
  if (!events) {
    return NextResponse.json({ error: "No se pudo cargar" }, { status: 502 });
  }
  return NextResponse.json({ events });
}
