"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { OrganizationsAccess } from "@/lib/organizations";

export type OrganizationsState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "error" }
  | ({ status: "ready" } & OrganizationsAccess);

/** Permiso para crear y membresías del usuario, siempre según el backend. */
export function useOrganizations(): OrganizationsState {
  const { status: authStatus } = useAuth();
  const [state, setState] = useState<OrganizationsState>({ status: "loading" });

  useEffect(() => {
    if (authStatus !== "authenticated") {
      // Al cerrar sesión se descarta lo de la cuenta anterior para no mostrarlo a la siguiente.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "loading" });
      return;
    }

    let active = true;
    fetch("/api/organizations")
      .then(async (res) => {
        if (!active) return;
        if (res.status === 401) return setState({ status: "unauthenticated" });
        if (!res.ok) return setState({ status: "error" });
        const data: OrganizationsAccess = await res.json();
        setState({ status: "ready", ...data });
      })
      .catch(() => active && setState({ status: "error" }));
    return () => {
      active = false;
    };
  }, [authStatus]);

  if (authStatus === "unauthenticated") return { status: "unauthenticated" };
  return state;
}
