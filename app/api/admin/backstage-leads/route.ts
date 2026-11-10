import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { sessionToken } from "@/lib/organizations-server";

// Solicitudes de Backstage (solo administradores; el backend vuelve a exigir el rol).
export async function GET(request: Request) {
  const token = await sessionToken();
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const status = new URL(request.url).searchParams.get("status");
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  try {
    const res = await backendFetch(`/admin/backstage-leads${query}`, { token });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}
