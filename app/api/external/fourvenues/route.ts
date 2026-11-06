import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, backendFetch } from "@/lib/backend";

// Historial del usuario en Fourvenues (solo lectura): inscripciones en listas y solicitudes de reserva.
// La web no crea ni modifica nada: las altas y solicitudes se hacen desde la app.
export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const [lists, bookings] = await Promise.all([
      backendFetch("/external/fourvenues/lists/me", { token }),
      backendFetch("/external/fourvenues/bookings/me", { token }),
    ]);
    if (lists.status === 401 || bookings.status === 401) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!lists.ok || !bookings.ok) {
      return NextResponse.json({ error: "backend" }, { status: 502 });
    }
    return NextResponse.json({
      lists: await lists.json(),
      bookings: await bookings.json(),
    });
  } catch {
    return NextResponse.json({ error: "backend" }, { status: 502 });
  }
}
