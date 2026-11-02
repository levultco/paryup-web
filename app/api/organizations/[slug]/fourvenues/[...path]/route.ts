import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { resolveMembership, sessionToken } from "@/lib/organizations-server";

// Vinculación con Fourvenues de la organización (`/org/fourvenues/*` del backend).
// Lista cerrada; el backend vuelve a validar permiso y estado en cada operación.
const ALLOWED: { method: string; pattern: RegExp }[] = [
  { method: "GET", pattern: /^status$/ },
  { method: "GET", pattern: /^hosts$/ },
  { method: "POST", pattern: /^link-requests$/ },
  { method: "POST", pattern: /^link-requests\/[\w-]+\/cancel$/ },
  { method: "POST", pattern: /^link\/disconnect$/ },
];

async function handle(
  request: Request,
  { params }: { params: Promise<{ slug: string; path: string[] }> },
) {
  const { slug, path } = await params;
  const relative = path.join("/");
  const method = request.method;
  if (!ALLOWED.some((a) => a.method === method && a.pattern.test(relative))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const token = await sessionToken();
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const resolved = await resolveMembership(token, slug);
  if (resolved.status !== 200) {
    return NextResponse.json({ error: "failed" }, { status: resolved.status });
  }
  const { organizationId } = resolved.membership;
  const isPost = method === "POST";

  try {
    const res = await backendFetch(`/org/fourvenues/${relative}`, {
      method,
      token,
      headers: {
        "X-Org-Context": organizationId,
        ...(isPost ? { "Content-Type": "application/json" } : {}),
      },
      ...(isPost ? { body: (await request.text()) || "{}" } : {}),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}

export { handle as GET, handle as POST };
