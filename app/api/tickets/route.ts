import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, backendFetch } from "@/lib/backend";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const res = await backendFetch("/tickets/me/list", { token });
    if (res.status === 401) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: "backend" }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json({ tickets: data.tickets ?? [] });
  } catch {
    return NextResponse.json({ error: "backend" }, { status: 502 });
  }
}
