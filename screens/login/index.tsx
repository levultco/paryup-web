"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { ParyUpIsoIcon } from "@/public/icons/icons";
import { useAuth } from "@/components/auth/AuthProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { FloatingInput } from "@/components/watermelon/floating-input";
import { ShimmerButton } from "@/components/watermelon/shimmer-button";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M16.37 12.62c-.03-2.7 2.2-4 2.3-4.06-1.25-1.83-3.2-2.08-3.9-2.11-1.66-.17-3.24.98-4.08.98-.85 0-2.15-.96-3.53-.93-1.82.03-3.49 1.06-4.43 2.69-1.89 3.28-.48 8.13 1.36 10.79.9 1.3 1.97 2.76 3.37 2.71 1.36-.05 1.87-.88 3.51-.88 1.63 0 2.1.88 3.53.85 1.46-.02 2.38-1.32 3.27-2.63 1.03-1.51 1.46-2.97 1.48-3.04-.03-.01-2.84-1.09-2.88-4.37zM13.7 4.67c.75-.91 1.25-2.17 1.11-3.43-1.08.04-2.38.72-3.15 1.62-.69.8-1.3 2.09-1.14 3.32 1.2.09 2.43-.61 3.18-1.51z" />
    </svg>
  );
}

export function LoginScreen({ art }: { art?: ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { status, login, loginWithGoogle } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  const finish = (code: string | null) => {
    if (code) {
      setError(code);
      setSubmitting(false);
      return;
    }
    router.replace(next);
  };

  // Vuelve a la página de la que se venía; solo si se abrió el login directamente va al inicio.
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    finish(await login(email, password));
  };

  const onGoogle = async (idToken: string) => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    finish(await loginWithGoogle(idToken));
  };

  return (
    <main className="relative grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <button
        type="button"
        onClick={goBack}
        className="absolute left-5 top-5 z-20 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-black/50 px-5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/15"
      >
        <ArrowLeft className="h-4 w-4" /> {t("login.back")}
      </button>
      <section className="relative hidden overflow-hidden border-r border-white/10 lg:block">
        {art}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 via-35% to-black/30" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-14">
          <h2 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight">
            {t("login.artTitle1")}
            <br />
            {t("login.artTitle2")}
          </h2>
          <p className="mt-4 max-w-sm text-base leading-7 text-white/65">
            {t("login.artSub")}
          </p>
        </div>
      </section>

      <section className="relative flex items-center justify-center px-5 py-20">
        <div className="w-full max-w-[400px]">
          <Link href="/" aria-label="ParyUp">
            <ParyUpIsoIcon className="mb-8 h-10 w-10" />
          </Link>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {t("login.title")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {t("login.subtitle")}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <GoogleSignInButton onCredential={onGoogle} disabled={submitting} />
            <button
              type="button"
              disabled
              title={t("login.soonTitle")}
              className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-6 text-sm font-medium text-white/45"
            >
              <AppleIcon className="h-[18px] w-[18px]" />
              {t("login.apple")}
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                {t("login.soon")}
              </span>
            </button>
          </div>

          <div className="my-7 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-white/35">
            <span className="h-px flex-1 bg-white/10" />
            {t("login.or")}
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
            <FloatingInput
              id="login-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              label={t("login.email")}
              labelClassName="bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FloatingInput
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              label={t("login.password")}
              labelClassName="bg-background"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword
                      ? t("login.hidePassword")
                      : t("login.showPassword")
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />
            {error ? (
              <p role="alert" className="-mt-2 text-sm text-red-400">
                {t(`auth.error.${error}`)}
              </p>
            ) : null}
            <ShimmerButton
              type="submit"
              disabled={submitting || !email || !password}
              className="h-12 w-full px-6 py-0 text-sm font-semibold"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? t("login.submitting") : t("login.submit")}
            </ShimmerButton>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            {t("login.newHere")}{" "}
            <Link
              href="/#descarga"
              className="text-white underline-offset-4 hover:underline"
            >
              {t("login.appLink")}
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
