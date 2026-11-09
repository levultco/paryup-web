import "server-only";
import { createHash } from "node:crypto";
import { backendFetch, fetchSessionUser } from "@/lib/backend";
import { decideBackstageAccess, type BackstageVerdict } from "@/lib/backstage-verdict";

// Backstage es solo para quien tiene organización, permiso de creación o una invitación pendiente
// (o es administrador de ParyUp). Se decide en el servidor, antes de servir nada. Falla cerrado:
// si el backend no responde, no se entra.
const TTL_MS = 20_000;
const cache = new Map<string, { at: number; verdict: BackstageVerdict }>();

const key = (token: string) => createHash("sha256").update(token).digest("hex");

async function json(res: Response | null) {
  return res?.ok ? await res.json().catch(() => null) : null;
}

export async function backstageVerdict(token: string | undefined): Promise<BackstageVerdict> {
  if (!token) return "login";
  const k = key(token);
  const hit = cache.get(k);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.verdict;

  try {
    const [user, mine, invites, boot] = await Promise.all([
      fetchSessionUser(token),
      backendFetch("/organizations/mine", { token }).catch(() => null),
      backendFetch("/organization-invites", { token }).catch(() => null),
      backendFetch("/authz/bootstrap", { token }).catch(() => null),
    ]);
    const verdict = decideBackstageAccess({
      user,
      mineOk: !!mine?.ok,
      mine: await json(mine),
      invites: await json(invites),
      boot: await json(boot),
    });
    // Solo se cachean decisiones firmes; un fallo del backend se reintenta en la siguiente petición.
    if (verdict !== "denied" || mine?.ok) {
      if (cache.size > 500) cache.clear();
      cache.set(k, { at: Date.now(), verdict });
    }
    return verdict;
  } catch {
    return "denied";
  }
}
