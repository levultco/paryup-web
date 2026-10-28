import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { sessionToken } from "@/lib/organizations-server";

/** Busca usuarios registrados para invitarlos al equipo. */
export async function GET(request: Request) {
  const token = await sessionToken();
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const query = (new URL(request.url).searchParams.get("query") ?? "").trim();
  if (query.length < 2) return NextResponse.json({ users: [] });
  try {
    const res = await backendFetch(
      `/users/search?query=${encodeURIComponent(query)}&scope=people&limit=8`,
      { token },
    );
    if (!res.ok) throw new Error("search");
    const data = await res.json();
    const users = (Array.isArray(data?.users) ? data.users : []).map(
      (u: Record<string, unknown>) => ({
        id: String(u.id),
        name: String(u.name ?? ""),
        nickname: typeof u.nickname === "string" ? u.nickname : null,
        image:
          typeof u.avatarTabUrl === "string"
            ? u.avatarTabUrl
            : typeof u.image === "string"
              ? u.image
              : null,
      }),
    );
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
