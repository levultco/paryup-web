import "server-only";
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { resolveMembership, sessionToken } from "@/lib/organizations-server";

type Allowed = { method: string; pattern: RegExp }[];

/**
 * Proxy genérico a rutas del backend con contexto de organización. Resuelve la
 * organización a partir del slug y de la membresía del usuario, nunca de un id
 * del cliente; el backend vuelve a comprobar permisos en cada operación.
 */
export async function proxyOrgRequest(
  request: Request,
  params: Promise<{ slug: string; path?: string[] }>,
  options: { prefix: string; allowed: Allowed },
) {
  const { slug, path } = await params;
  const relative = (path ?? []).join("/");
  const method = request.method;
  if (
    !options.allowed.some(
      (a) => a.method === method && a.pattern.test(relative),
    )
  ) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const token = await sessionToken();
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const resolved = await resolveMembership(token, slug);
  if (resolved.status !== 200) {
    return NextResponse.json({ error: "failed" }, { status: resolved.status });
  }

  const hasBody = method === "POST" || method === "PATCH";
  const body = hasBody ? await request.text() : undefined;
  try {
    const res = await backendFetch(
      `${options.prefix}${relative ? `/${relative}` : ""}${new URL(request.url).search}`,
      {
        method,
        token,
        headers: {
          "X-Org-Context": resolved.membership.organizationId,
          ...(hasBody ? { "Content-Type": "application/json" } : {}),
        },
        ...(hasBody ? { body: body || "{}" } : {}),
      },
    );
    const data = res.status === 204 ? {} : await res.json().catch(() => ({}));
    return NextResponse.json(data, {
      status: res.status === 204 ? 200 : res.status,
    });
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}
