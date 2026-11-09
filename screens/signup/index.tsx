"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Check, Loader2, X } from "lucide-react";
import { ParyUpIsoIcon } from "@/public/icons/icons";
import { useAuth, type AuthUser } from "@/components/auth/AuthProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { FloatingInput } from "@/components/watermelon/floating-input";
import { ShimmerButton } from "@/components/watermelon/shimmer-button";
import {
  USERNAME_REGEX,
  nextSignupStep,
  normalizeUsername,
} from "@/lib/signup-state";

/**
 * Destino al terminar: si se llegó desde backstage (`?to=backstage&next=/ruta`) se vuelve allí
 * (en desarrollo pasando por el traspaso de sesión, porque localhost y backstage.localhost no
 * comparten cookies; en producción la cookie del dominio ya vale en el subdominio).
 */
function destinationUrl(): string {
  const params = new URLSearchParams(window.location.search);
  if (params.get("to") !== "backstage") return "/";
  const raw = params.get("next");
  const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  if (process.env.NODE_ENV !== "production") {
    return `/api/session/handoff?next=${encodeURIComponent(next)}`;
  }
  const host = window.location.host.replace(/^www\./i, "");
  return `${window.location.protocol}//backstage.${host}${next}`;
}

async function post(url: string, body: unknown) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { code: "connect" } };
  }
}

/** Pasos pendientes de la cuenta, derivados siempre del backend: recupera un registro interrumpido. */
export function SignupContinueScreen() {
  const router = useRouter();
  const { user, status, updateUser } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const step = user ? nextSignupStep(user) : null;
  useEffect(() => {
    if (user && step === null) window.location.assign(destinationUrl());
  }, [user, step]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-[400px]">
        <Link href="/" aria-label="ParyUp">
          <ParyUpIsoIcon className="mb-8 h-10 w-10" />
        </Link>
        {!user || step === null ? (
          <Loader2 className="h-5 w-5 animate-spin text-white/50" />
        ) : step === "verify" ? (
          <VerifyStep user={user} onDone={updateUser} />
        ) : (
          <ProfileStep user={user} onDone={updateUser} />
        )}
      </div>
    </main>
  );
}

function VerifyStep({
  user,
  onDone,
}: {
  user: AuthUser;
  onDone: (u: AuthUser) => void;
}) {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<"idle" | "sending" | "sent">("idle");
  const requested = useRef(false);

  const send = async () => {
    setSent("sending");
    setError(null);
    const { ok, data } = await post("/api/session/email-verification", {
      action: "send",
    });
    if (ok && data.alreadyVerified) {
      onDone({ ...user, emailVerified: true });
      return;
    }
    setSent(ok ? "sent" : "idle");
    if (!ok) setError("send");
  };

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    void send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const { ok, data } = await post("/api/session/email-verification", {
      action: "verify",
      code,
    });
    setBusy(false);
    if (ok && data.user) onDone(data.user);
    else setError(data.code ?? "generic");
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {t("signup.verify.title")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {t("signup.verify.subtitle", { email: user.email })}
        </p>
      </div>
      <FloatingInput
        id="verify-code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        label={t("signup.verify.code")}
        labelClassName="bg-background"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
      />
      {error ? (
        <p role="alert" className="-mt-2 text-sm text-red-400">
          {t(`signup.verify.error.${error}`)}
        </p>
      ) : null}
      <ShimmerButton
        type="submit"
        disabled={busy || code.length !== 6}
        className="h-12 w-full px-6 py-0 text-sm font-semibold"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {t("signup.verify.submit")}
      </ShimmerButton>
      <button
        type="button"
        onClick={() => void send()}
        disabled={sent === "sending"}
        className="text-sm text-white/60 underline-offset-4 hover:text-white hover:underline disabled:opacity-50"
      >
        {sent === "sent" ? t("signup.verify.resent") : t("signup.verify.resend")}
      </button>
    </form>
  );
}

type Availability = "idle" | "checking" | "ok" | "taken" | "invalid";

function ProfileStep({
  user,
  onDone,
}: {
  user: AuthUser;
  onDone: (u: AuthUser) => void;
}) {
  const { t } = useI18n();
  // El nombre provisional de una cuenta de email es la parte local del correo: se pide de nuevo.
  const provisional = user.name === user.email.split("@")[0];
  const [name, setName] = useState(provisional ? "" : user.name);
  const [username, setUsername] = useState(user.nickname ?? "");
  const [availability, setAvailability] = useState<Availability>("idle");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const value = normalizeUsername(username);
    if (!value) return setAvailability("idle");
    if (!USERNAME_REGEX.test(value)) return setAvailability("invalid");
    setAvailability("checking");
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/session/username?u=${encodeURIComponent(value)}`,
        );
        const data = await res.json();
        if (!active) return;
        if (!res.ok) return setAvailability("idle");
        setAvailability(
          data.valid === false ? "invalid" : data.exists ? "taken" : "ok",
        );
      } catch {
        if (active) setAvailability("idle");
      }
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [username]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || availability === "taken" || availability === "invalid") return;
    setBusy(true);
    setError(null);
    const { ok, data } = await post("/api/session/profile", { name, username });
    setBusy(false);
    if (ok && data.user) onDone(data.user);
    else {
      if (data.code === "taken") setAvailability("taken");
      setError(data.code ?? "generic");
    }
  };

  const hint =
    availability === "taken"
      ? t("signup.profile.taken")
      : availability === "invalid"
        ? t("signup.profile.invalid")
        : null;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {t("signup.profile.title")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {t("signup.profile.subtitle")}
        </p>
      </div>
      <FloatingInput
        id="profile-name"
        autoComplete="name"
        label={t("signup.profile.name")}
        labelClassName="bg-background"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={50}
      />
      <FloatingInput
        id="profile-username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        label={t("signup.profile.username")}
        labelClassName="bg-background"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        maxLength={31}
        trailing={
          availability === "checking" ? (
            <Loader2 className="h-4 w-4 animate-spin text-white/50" />
          ) : availability === "ok" ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : availability === "taken" || availability === "invalid" ? (
            <X className="h-4 w-4 text-red-400" />
          ) : null
        }
      />
      {hint || error ? (
        <p role="alert" className="-mt-2 text-sm text-red-400">
          {hint ?? t(`signup.profile.error.${error}`)}
        </p>
      ) : null}
      <ShimmerButton
        type="submit"
        disabled={
          busy ||
          name.trim().length < 2 ||
          availability === "taken" ||
          availability === "invalid" ||
          availability === "checking" ||
          !username
        }
        className="h-12 w-full px-6 py-0 text-sm font-semibold"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {t("signup.profile.submit")}
      </ShimmerButton>
    </form>
  );
}
