// Estado de registro compartido entre servidor y cliente. Las reglas de nombre de usuario son
// las del backend (users/username.util.ts): 3-30 caracteres, letras, números, "." y "_".
export const USERNAME_REGEX = /^[a-z0-9_.]{3,30}$/i;

export function normalizeUsername(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

export function isBasicProfileComplete(user: {
  name?: string | null;
  nickname?: string | null;
  basicProfileCompletedAt?: string | null;
}): boolean {
  return (
    !!user.basicProfileCompletedAt &&
    (user.name?.trim().length ?? 0) >= 2 &&
    !!user.nickname &&
    USERNAME_REGEX.test(user.nickname)
  );
}

export type SignupStep = "verify" | "profile" | null;

/** Siguiente paso pendiente de la cuenta (null = registro completo). Se deriva siempre del backend. */
export function nextSignupStep(user: {
  emailVerified: boolean;
  basicProfileComplete: boolean;
}): SignupStep {
  if (!user.emailVerified) return "verify";
  if (!user.basicProfileComplete) return "profile";
  return null;
}
