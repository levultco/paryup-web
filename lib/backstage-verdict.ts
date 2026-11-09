import { nextSignupStep } from "@/lib/signup-state";

export type BackstageVerdict = "ok" | "login" | "continue" | "denied";

type Json = Record<string, unknown> | null;

/** Decisión pura de acceso a Backstage a partir de lo que responde el backend. */
export function decideBackstageAccess(input: {
  user: { emailVerified: boolean; basicProfileComplete: boolean } | null;
  mineOk: boolean;
  mine: Json;
  invites: Json;
  boot: Json;
}): BackstageVerdict {
  const { user, mineOk, mine, invites, boot } = input;
  if (!user) return "login";
  // Correo sin verificar o perfil básico incompleto: se termina el registro en la web principal.
  if (nextSignupStep(user) !== null) return "continue";
  if (!mineOk) return "denied"; // falla cerrado

  const organizations = Array.isArray(mine?.organizations) ? mine.organizations : [];
  const pendingInvites = Array.isArray(invites?.invites) ? invites.invites : [];
  const bootUser = boot?.user as { globalRole?: string } | undefined;
  const allowed =
    organizations.length > 0 ||
    mine?.canCreateOrganization === true ||
    pendingInvites.length > 0 ||
    bootUser?.globalRole === "ADMIN";
  return allowed ? "ok" : "denied";
}
