import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, backendFetch } from "@/lib/backend";
import type { OrgRole } from "@/lib/organizations";

export async function sessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export type Membership = { organizationId: string; role: OrgRole };

/**
 * Resuelve el slug a una organización SOLO si el usuario es miembro.
 * Nunca se usa un id de organización enviado por el cliente.
 */
export async function resolveMembership(
  token: string,
  slug: string,
): Promise<
  { status: 200; membership: Membership } | { status: 401 | 404 | 502 }
> {
  try {
    const res = await backendFetch("/organizations/mine", { token });
    if (res.status === 401) return { status: 401 };
    if (!res.ok) return { status: 502 };
    const data = await res.json();
    const found = (data?.organizations ?? []).find(
      (m: { organization?: { slug?: string } }) =>
        m?.organization?.slug === slug.trim().toLowerCase(),
    );
    if (!found) return { status: 404 };
    return {
      status: 200,
      membership: { organizationId: found.organizationId, role: found.role },
    };
  } catch {
    return { status: 502 };
  }
}
