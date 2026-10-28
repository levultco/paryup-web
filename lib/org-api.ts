// Cliente del BFF de organizaciones (`/api/organizations/[slug]/...`).

export type ApiResult<T> = { ok: boolean; status: number; data: T | null };

export async function orgFetch<T = unknown>(
  slug: string,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(
      `/api/organizations/${encodeURIComponent(slug)}/${path}`,
      {
        method: init.method ?? "GET",
        ...(init.body !== undefined
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(init.body),
            }
          : {}),
      },
    );
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

/** Clave de traducción para un error del equipo, según estado y mensaje del backend. */
export function teamErrorKey(status: number, data: unknown): string {
  const message = String(
    (data as { message?: unknown } | null)?.message ?? "",
  ).toLowerCase();
  if (message.includes("already a member")) return "orgs.tm.errAlready";
  if (message.includes("already pending")) return "orgs.tm.errPending";
  if (status === 403) return "orgs.tm.errRank";
  return "orgs.tm.errGeneric";
}
