import { NextResponse, type NextRequest } from "next/server";
import { API_URL } from "@/lib/backend";

// Enlace corto de promotor: /r/K7M2-9QXA → /events/:id?ref=K7M2... (la app lo intercepta antes si está instalada).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const home = new URL("/", request.url);
  try {
    const res = await fetch(
      `${API_URL}/promoter-links/${encodeURIComponent(code)}/resolve`,
      { cache: "no-store" },
    );
    if (!res.ok) return NextResponse.redirect(home);
    const link = (await res.json()) as { eventId: string; code: string };
    const target = new URL(
      `/events/${encodeURIComponent(link.eventId)}`,
      request.url,
    );
    target.searchParams.set("ref", link.code);
    return NextResponse.redirect(target);
  } catch {
    return NextResponse.redirect(home);
  }
}
