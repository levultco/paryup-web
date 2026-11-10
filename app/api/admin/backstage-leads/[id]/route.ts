import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { sessionToken } from "@/lib/organizations-server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[\w-]+$/.test(id))
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  const token = await sessionToken();
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const res = await backendFetch(`/admin/backstage-leads/${id}`, {
      method: "PATCH",
      token,
      headers: { "Content-Type": "application/json" },
      body: (await request.text()) || "{}",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}
