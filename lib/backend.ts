import "server-only";

export const API_URL = process.env.API_URL ?? "http://localhost:4000";
export const SESSION_COOKIE = "paryup_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  nickname: string | null;
  image: string | null;
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
    const res = await backendFetch("/api/auth/get-session", { token });
    if (!res.ok) return null;
    const data = await res.json();
    const user = data?.user;
    if (!user?.id) return null;
    return {
      id: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
      nickname: user.nickname ?? null,
      image: user.avatarTabUrl ?? user.image ?? null,
    };
  } catch {
    return null;
  }
}
