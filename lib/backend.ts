import "server-only";

import { isBasicProfileComplete } from "@/lib/signup-state";
import { resolveBadge, type BadgeType } from "@/lib/social";

export const API_URL = process.env.API_URL ?? "http://localhost:4000";
export const SESSION_COOKIE = "paryup_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  nickname: string | null;
  image: string | null;
  emailVerified: boolean;
  /** Nombre y nombre de usuario válidos guardados (independiente del onboarding social del móvil). */
  basicProfileComplete: boolean;
  /** Insignia del usuario (verificado / pro), si la tiene. */
  badge: BadgeType | null;
};

type BackendInit = Omit<RequestInit, "headers"> & {
  token?: string;
  headers?: Record<string, string>;
};

export function backendFetch(path: string, init: BackendInit = {}) {
  const { token, headers, ...rest } = init;
  return fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });
}

export async function fetchSessionUser(
  token: string,
): Promise<SessionUser | null> {
  try {
    // `/users/me` aporta los datos de la insignia; es un extra y no bloquea la sesión.
    const [res, meRes] = await Promise.all([
      backendFetch("/api/auth/get-session", { token }),
      backendFetch("/users/me", { token }).catch(() => null),
    ]);
    if (!res.ok) return null;
    const me = meRes?.ok
      ? ((await meRes.json().catch(() => null))?.user ?? null)
      : null;
    const data = await res.json();
    const user = data?.user;
    if (!user?.id) return null;
    return {
      id: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
      nickname: user.nickname ?? null,
      image: user.avatarTabUrl ?? user.image ?? null,
      emailVerified: user.emailVerified === true,
      badge: resolveBadge(me),
      basicProfileComplete: isBasicProfileComplete({
        name: user.name,
        nickname: user.nickname,
        basicProfileCompletedAt: user.basicProfileCompletedAt,
      }),
    };
  } catch {
    return null;
  }
}
