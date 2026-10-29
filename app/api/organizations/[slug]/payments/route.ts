import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { resolveMembership, sessionToken } from "@/lib/organizations-server";

// Reutiliza los endpoints de Stripe Connect que ya usa la app; no toca cobros ni comisiones.
async function context(params: Promise<{ slug: string }>) {
  const token = await sessionToken();
  if (!token)
    return {
      error: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  const resolved = await resolveMembership(token, (await params).slug);
  if (resolved.status !== 200) {
    return {
      error: NextResponse.json(
        { error: "failed" },
        { status: resolved.status },
      ),
    };
  }
  return { token, organizationId: resolved.membership.organizationId };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const ctx = await context(params);
  if ("error" in ctx) return ctx.error;
  try {
    const res = await backendFetch("/org/payments/connect/status", {
      token: ctx.token,
      headers: { "X-Org-Context": ctx.organizationId },
    });
    return NextResponse.json(await res.json().catch(() => ({})), {
      status: res.status,
    });
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const ctx = await context(params);
  if ("error" in ctx) return ctx.error;
  const body = await request.json().catch(() => null);
  const path =
    body?.action === "refresh"
      ? "/org/payments/connect/refresh"
      : body?.action === "onboarding"
        ? "/org/payments/connect/onboarding-link"
        : null;
  if (!path) return NextResponse.json({ code: "invalid" }, { status: 400 });
  try {
    const res = await backendFetch(path, {
      method: "POST",
      token: ctx.token,
      headers: {
        "X-Org-Context": ctx.organizationId,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    return NextResponse.json(await res.json().catch(() => ({})), {
      status: res.status,
    });
  } catch {
    return NextResponse.json({ error: "connect" }, { status: 502 });
  }
}
