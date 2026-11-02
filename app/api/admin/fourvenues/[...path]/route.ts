import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { sessionToken } from "@/lib/organizations-server";

// Panel de administración de vinculaciones Fourvenues. El backend exige UserRole.ADMIN.
const ALLOWED: { method: string; pattern: RegExp }[] = [
  { method: "GET", pattern: /^health$/ },
  { method: "POST", pattern: /^hosts\/refresh$/ },
  { method: "GET", pattern: /^link-requests$/ },
  { method: "GET", pattern: /^link-requests\/[\w-]+$/ },
  { method: "POST", pattern: /^link-requests\/[\w-]+\/(approve|reject)$/ },
  {
    method: "POST",
    pattern: /^links\/[\w-]+\/(suspend|reactivate|revoke|disconnect)$/,
  },
  { method: "POST", pattern: /^organizations\/[\w-]+\/native-mode$/ },
];

async function handle(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const relative = (await params).path.join("/");
  const method = request.method;
  if (!ALLOWED.some((a) => a.method === method && a.pattern.test(relative))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const token = await sessionToken();
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const isPost = method === "POST";
  const search = new URL(request.url).search;

  try {
    const res = await backendFetch(`/admin/fourvenues/${relative}${search}`, {
      method,
      token,
      ...(isPost
        ? {
            headers: { "Content-Type": "application/json" },
            body: (await request.text()) || "{}",
          }
        : {}),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}

export { handle as GET, handle as POST };
