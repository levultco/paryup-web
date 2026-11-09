"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  nickname: string | null;
  image: string | null;
  emailVerified: boolean;
  basicProfileComplete: boolean;
  badge?: "verified" | "pro" | null;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<string | null>;
  loginWithGoogle: (idToken: string, register?: boolean) => Promise<string | null>;
  register: (email: string, password: string) => Promise<string | null>;
  /** Sustituye el usuario tras completar un paso (perfil, verificación). */
  updateUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setUser(data.user ?? null);
        setStatus(data.user ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!active) return;
        setStatus("unauthenticated");
      });
    return () => {
      active = false;
    };
  }, []);

  const submit = useCallback(
    async (payload: Record<string, string | boolean>, url = "/api/session") => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        return data.code ?? "generic";
      }
      setUser(data.user);
      setStatus("authenticated");
      return null;
    } catch {
      return "connect";
    }
    },
    [],
  );

  const login = useCallback(
    (email: string, password: string) => submit({ email, password }),
    [submit],
  );
  const loginWithGoogle = useCallback(
    (googleIdToken: string, register = false) =>
      submit(register ? { googleIdToken, register: true } : { googleIdToken }),
    [submit],
  );
  const register = useCallback(
    (email: string, password: string) =>
      submit({ email, password }, "/api/session/register"),
    [submit],
  );
  const updateUser = useCallback((next: AuthUser) => {
    setUser(next);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/session", { method: "DELETE" }).catch(() => null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ user, status, login, loginWithGoogle, register, updateUser, logout }),
    [user, status, login, loginWithGoogle, register, updateUser, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
