import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { resolveMembership, sessionToken } from "@/lib/organizations-server";

// Suscripción de Backstage de la organización: resumen (GET) y portal de facturación de Stripe (POST).
async function context(params: Promise<{ slug: string }>) {
  const token = await sessionToken();
  if (!token)
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const resolved = await resolveMembership(token, (await params).slug);
  if (resolved.status !== 200) {
    return { error: NextResponse.json({ error: "failed" }, { status: resolved.status }) };
  }
  return { token, organizationId: resolved.membership.organizationId };
}

async function forward(
  params: Promise<{ slug: string }>,
  path: string,
  method: "GET" | "POST",
) {
  const ctx = await context(params);
  if ("error" in ctx) return ctx.error;
  try {
    const res = await backendFetch(path, {
      method,
      token: ctx.token,
      headers: {
        "X-Org-Context": ctx.organizationId,
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
      },
      ...(method === "POST" ? { body: "{}" } : {}),
    });
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return forward(params, "/org/billing", "GET");
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return forward(params, "/org/billing/portal", "POST");
}
