import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { sessionToken } from "@/lib/organizations-server";

// Enlace de activación de Backstage: el backend valida token, rol y estado.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  try {
    const res = await backendFetch(
      `/backstage-leads/activation/${encodeURIComponent(token)}`,
    );
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const session = await sessionToken();
  if (!session)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const token = typeof body?.token === "string" ? body.token : "";
  try {
    const res = await backendFetch(
      `/backstage-leads/activation/${encodeURIComponent(token)}`,
      {
        token: session,
        method: "POST",
      },
    );
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}
