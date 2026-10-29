import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { resolveMembership, sessionToken } from "@/lib/organizations-server";

// Lista cerrada de operaciones que la web puede hacer sobre una organización.
// El backend vuelve a validar permisos y jerarquía en cada una.
const ALLOWED: { method: string; pattern: RegExp }[] = [
  { method: "GET", pattern: /^overview$/ },
  { method: "GET", pattern: /^locations$/ },
  { method: "GET", pattern: /^reserved-areas$/ },
  { method: "POST", pattern: /^reserved-areas$/ },
  { method: "PATCH", pattern: /^reserved-areas\/[\w-]+$/ },
  { method: "DELETE", pattern: /^reserved-areas\/[\w-]+$/ },
  { method: "POST", pattern: /^reserved-areas\/[\w-]+\/table-types$/ },
  {
    method: "DELETE",
    pattern: /^reserved-areas\/[\w-]+\/table-types\/[\w-]+$/,
  },
  { method: "POST", pattern: /^locations$/ },
  { method: "PATCH", pattern: /^profile$/ },
  { method: "GET", pattern: /^members$/ },
  { method: "PATCH", pattern: /^members\/[\w-]+$/ },
  { method: "DELETE", pattern: /^members\/[\w-]+$/ },
  { method: "GET", pattern: /^invites$/ },
  { method: "POST", pattern: /^invites$/ },
  { method: "POST", pattern: /^invites\/[\w-]+\/revoke$/ },
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

  const hasBody = method === "POST" || method === "PATCH";
  const body = hasBody ? await request.text() : undefined;
  const search = new URL(request.url).search;

  try {
    const res = await backendFetch(
      `/organizations/${encodeURIComponent(organizationId)}/${relative}${search}`,
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
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
