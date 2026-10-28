import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, backendFetch } from "@/lib/backend";

/**
 * Detalle de una entrada (con el token del QR). Igual que la app: primero las
 * entradas de admisión (`/me/admission-tickets/:id`) y, si no existe, las antiguas.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const safe = encodeURIComponent(id);
    let res = await backendFetch(`/me/admission-tickets/${safe}`, { token });
    if (res.status === 404) {
      res = await backendFetch(`/tickets/me/${safe}`, { token });
    }
    if (res.status === 401) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (res.status === 404) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: "backend" }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json({ ticket: data.ticket ?? null });
  } catch {
    return NextResponse.json({ error: "backend" }, { status: 502 });
  }
}
