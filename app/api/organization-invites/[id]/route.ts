import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { sessionToken } from "@/lib/organizations-server";

/** El invitado acepta o rechaza su propia invitación (el backend comprueba que es suya). */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await sessionToken();
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const action =
    body?.action === "decline"
      ? "decline"
      : body?.action === "accept"
        ? "accept"
        : null;
  if (!action || !/^[\w-]+$/.test(id)) {
    return NextResponse.json({ code: "invalid" }, { status: 400 });
  }
  const path =
    action === "accept"
      ? `/organization-invites/by-id/${id}/accept`
      : `/organization-invites/${id}/decline`;
  try {
    const res = await backendFetch(path, {
      method: "POST",
      token,
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}
