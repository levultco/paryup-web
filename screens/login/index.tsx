"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { ParyUpIsoIcon } from "@/public/icons/icons";
import { useAuth } from "@/components/auth/AuthProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { FloatingInput } from "@/components/watermelon/floating-input";
import { ShimmerButton } from "@/components/watermelon/shimmer-button";

export function LoginScreen({
  art,
  mode = "login",
}: {
  art?: ReactNode;
  mode?: "login" | "signup";
}) {
  const signup = mode === "signup";
  const router = useRouter();
  const { status, login, loginWithGoogle, register } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const leave = () => {
    // Siempre pasa por /signup/continue: si falta verificar el correo o completar el perfil
    // básico lo pide ahí (también recupera un registro interrumpido); si no, sigue su camino.
    const search = window.location.search;
    router.replace(`/signup/continue${search}`);
  };

  useEffect(() => {
    if (status === "authenticated") leave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const finish = (code: string | null) => {
    if (code) {
      setError(code);
      setSubmitting(false);
      return;
    }
    leave();
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
    finish(
      signup ? await register(email, password) : await login(email, password),
    );
  };

  const onGoogle = async (idToken: string) => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    finish(await loginWithGoogle(idToken, signup));
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
            {t(signup ? "signup.title" : "login.title")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {t(signup ? "signup.subtitle" : "login.subtitle")}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <GoogleSignInButton onCredential={onGoogle} disabled={submitting} />
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
              autoComplete={signup ? "new-password" : "current-password"}
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
              {submitting
                ? t("login.submitting")
                : t(signup ? "signup.submit" : "login.submit")}
            </ShimmerButton>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            {t(signup ? "signup.haveAccount" : "login.newHere")}{" "}
            <Link
              href={signup ? "/login" : "/signup"}
              className="text-white underline-offset-4 hover:underline"
            >
              {t(signup ? "signup.loginLink" : "login.signupLink")}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
