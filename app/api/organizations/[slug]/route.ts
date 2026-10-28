import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { resolveMembership, sessionToken } from "@/lib/organizations-server";
import type { OrganizationContext } from "@/lib/organizations";

/** Contexto del panel: perfil, rol y permisos reales del usuario en la organización. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const token = await sessionToken();
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const resolved = await resolveMembership(token, (await params).slug);
  if (resolved.status !== 200) {
    return NextResponse.json({ error: "failed" }, { status: resolved.status });
  }
  const { organizationId, role } = resolved.membership;

  try {
    const headers = { "X-Org-Context": organizationId };
    const [profileRes, authzRes] = await Promise.all([
      backendFetch(
        `/organizations/${encodeURIComponent(organizationId)}/profile`,
        { token, headers },
      ),
      backendFetch("/authz/bootstrap", { token, headers }),
    ]);
    if (!profileRes.ok || !authzRes.ok) throw new Error("context");
    const organization = (await profileRes.json())?.organization;
    const authz = await authzRes.json();
    if (!organization) throw new Error("context");

    const data: OrganizationContext = {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo ?? null,
        banner: organization.banner ?? null,
        bio: organization.bio ?? null,
        city: organization.city ?? null,
        socialLinks: organization.socialLinks ?? null,
        isVerified: organization.isVerified === true,
        createdAt: organization.createdAt,
      },
      role,
      permissions: Array.isArray(authz?.permissions) ? authz.permissions : [],
    };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
