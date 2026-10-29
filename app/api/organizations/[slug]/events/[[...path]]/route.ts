import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { resolveMembership, sessionToken } from "@/lib/organizations-server";
import { stripEmails } from "@/lib/reserved";

// Operaciones de gestión de eventos que la web puede hacer. Son las mismas rutas
// que usa la app: el backend comprueba permisos, estado y ventas en cada una.
const ALLOWED: { method: string; pattern: RegExp }[] = [
  { method: "GET", pattern: /^manage$/ },
  { method: "POST", pattern: /^$/ },
  { method: "GET", pattern: /^[\w-]+$/ },
  { method: "PATCH", pattern: /^[\w-]+$/ },
  { method: "DELETE", pattern: /^[\w-]+$/ },
  { method: "POST", pattern: /^[\w-]+\/publish$/ },
  { method: "POST", pattern: /^[\w-]+\/cancel$/ },
  { method: "GET", pattern: /^[\w-]+\/list\/entries$/ },
  { method: "GET", pattern: /^[\w-]+\/sales$/ },
  { method: "GET", pattern: /^[\w-]+\/sales\/timeline$/ },
  { method: "GET", pattern: /^[\w-]+\/orders$/ },
  { method: "GET", pattern: /^[\w-]+\/attendees$/ },
  { method: "GET", pattern: /^[\w-]+\/access-requests$/ },
  {
    method: "POST",
    pattern: /^[\w-]+\/access-requests\/[\w-]+\/(approve|reject|cancel)$/,
  },
  { method: "GET", pattern: /^[\w-]+\/ticket-types$/ },
  { method: "POST", pattern: /^[\w-]+\/ticket-types$/ },
  { method: "PATCH", pattern: /^[\w-]+\/ticket-types\/[\w-]+$/ },
  { method: "DELETE", pattern: /^[\w-]+\/ticket-types\/[\w-]+$/ },
];

async function handle(
  request: Request,
  { params }: { params: Promise<{ slug: string; path?: string[] }> },
) {
  const { slug, path } = await params;
  const relative = (path ?? []).join("/");
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

  const hasBody = method === "POST" || method === "PATCH";
  const body = hasBody ? await request.text() : undefined;
  const search = new URL(request.url).search;

  try {
    const res = await backendFetch(
      `/events${relative ? `/${relative}` : ""}${search}`,
      {
        method,
        token,
        headers: {
          "X-Org-Context": organizationId,
          ...(hasBody ? { "Content-Type": "application/json" } : {}),
        },
        ...(hasBody ? { body: body || "{}" } : {}),
      },
    );
    const data = res.status === 204 ? {} : await res.json().catch(() => ({}));
    return NextResponse.json(stripEmails(data), {
      status: res.status === 204 ? 200 : res.status,
    });
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
