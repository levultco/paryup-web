import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, backendFetch } from "@/lib/backend";
import {
  ORG_SLUG_REGEX,
  normalizeOrgSlug,
  type OrganizationsAccess,
} from "@/lib/organizations";

async function tokenOrNull() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/** Organizaciones del usuario y si puede crear nuevas. Todo lo decide el backend. */
export async function GET() {
  const token = await tokenOrNull();
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const [res, invitesRes] = await Promise.all([
      backendFetch("/organizations/mine", { token }),
      backendFetch("/organization-invites", { token }),
    ]);
    if (res.status === 401) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!res.ok) throw new Error("mine");
    const data = await res.json();
    const invitesData = invitesRes.ok
      ? await invitesRes.json().catch(() => null)
      : null;
    const access: OrganizationsAccess = {
      canCreateOrganization: data?.canCreateOrganization === true,
      organizations: Array.isArray(data?.organizations)
        ? data.organizations
        : [],
      pendingInvites: Array.isArray(invitesData?.invites)
        ? invitesData.invites
        : [],
    };
    return NextResponse.json(access);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const token = await tokenOrNull();
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const slug = normalizeOrgSlug(
    typeof body?.slug === "string" ? body.slug : "",
  );
  const city = typeof body?.city === "string" ? body.city.trim() : "";

  if (name.length < 2 || name.length > 80 || !ORG_SLUG_REGEX.test(slug)) {
    return NextResponse.json({ code: "invalid" }, { status: 400 });
  }

  try {
    const res = await backendFetch("/organizations", {
      method: "POST",
      token,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, ...(city ? { city } : {}) }),
    });
    if (res.ok) return NextResponse.json(await res.json());
    const code =
      res.status === 401
        ? "unauthorized"
        : res.status === 403
          ? "forbidden"
          : res.status === 409
            ? "slugTaken"
            : res.status === 400
              ? "invalid"
              : "generic";
    return NextResponse.json(
      { code },
      { status: res.status >= 400 && res.status < 500 ? res.status : 502 },
    );
  } catch {
    return NextResponse.json({ code: "connect" }, { status: 502 });
  }
}
