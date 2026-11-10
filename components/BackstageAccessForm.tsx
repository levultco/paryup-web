"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CheckIcon } from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { Dialog } from "@/components/organizations/promoters-ui";
import { Select } from "@/components/organizations/select";
import { notify } from "@/lib/toast";

type System = "none" | "fourvenues" | "other";
type Field = "name" | "email" | "venue" | "city" | "system";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const input =
  "w-full rounded-xl bg-white/[0.07] px-3.5 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-white/30 focus:bg-white/[0.11] focus-visible:ring-2 focus-visible:ring-white/20 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-400/60";

function Label({
  text,
  error,
  children,
}: {
  text: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-medium text-white/50">
      {text}
      {children}
      {error ? (
        <span className="text-xs font-normal text-red-400">{error}</span>
      ) : null}
    </label>
  );
}

/** Solicitud de acceso a Backstage: se abre en la hoja lateral y llega al equipo por correo. */
export default function BackstageAccessForm({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    email: "",
    venue: "",
    city: "",
    system: "" as System | "",
    phone: "",
    message: "",
    website: "", // trampa anti-spam
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<Field, string>> = {};
    const required = t("backstage.form.required");
    if (!form.name.trim()) next.name = required;
    if (!form.email.trim()) next.email = required;
    else if (!EMAIL_RE.test(form.email.trim()))
      next.email = t("backstage.form.invalidEmail");
    if (!form.venue.trim()) next.venue = required;
    if (!form.city.trim()) next.city = required;
    if (!form.system) next.system = required;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending || !validate()) return;
    setSending(true);
    try {
      const res = await fetch("/api/backstage-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("send");
      setDone(true);
    } catch {
      notify("error", t("backstage.form.errSend"));
    } finally {
      setSending(false);
    }
  };

  const close = () => {
    onClose();
    // Al volver a abrir, un formulario limpio si ya se envió.
    if (done) {
      setTimeout(() => {
        setDone(false);
        setForm((f) => ({
          ...f,
          name: "",
          email: "",
          venue: "",
          city: "",
          system: "",
          phone: "",
          message: "",
        }));
      }, 350);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={t("backstage.form.title")}
      variant="side"
    >
      {done ? (
        <div className="flex min-h-[calc(100dvh-9rem)] flex-col justify-between gap-10 pb-6">
          <div className="flex flex-col gap-10 pt-6">
            <div className="flex flex-col items-start gap-5">
              <span className="bs-pop relative flex h-14 w-14 items-center justify-center rounded-full bg-[#30d158] text-black">
                <span
                  aria-hidden
                  className="bs-ring absolute inset-0 rounded-full ring-2 ring-[#30d158]/50"
                />
                <CheckIcon aria-hidden className="h-7 w-7" />
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.025em] text-white">
                  {t("backstage.form.doneTitle")}
                </h3>
                <p className="max-w-[36ch] text-[15px] leading-snug text-white/55">
                  {t("backstage.form.doneText", { email: form.email.trim() })}
                </p>
              </div>
            </div>
            <ol className="flex flex-col">
              {(
                [
                  ["backstage.form.step1", "done"],
                  ["backstage.form.step2", "now"],
                  ["backstage.form.step3", "next"],
                ] as const
              ).map(([key, state], i, all) => (
                <li key={key} className="relative flex gap-4 pb-7 last:pb-0">
                  {i < all.length - 1 && (
                    <span
                      aria-hidden
                      className={`absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px ${
                        state === "done" ? "bg-[#30d158]/60" : "bg-white/12"
                      }`}
                    />
                  )}
                  <span
                    className={`relative mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      state === "done"
                        ? "bg-[#30d158] text-black"
                        : state === "now"
                          ? "ring-2 ring-white/70"
                          : "ring-1 ring-white/20"
                    }`}
                  >
                    {state === "done" ? (
                      <CheckIcon aria-hidden className="h-3.5 w-3.5" />
                    ) : state === "now" ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    ) : null}
                  </span>
                  <span
                    className={`text-[16px] leading-6 ${
                      state === "next" ? "text-white/40" : "text-white"
                    }`}
                  >
                    {t(key)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-black transition-[opacity,transform] duration-100 hover:opacity-90 active:scale-[0.98]"
          >
            {t("backstage.form.close")}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <p className="text-[15px] leading-snug text-white/55">
            {t("backstage.form.intro")}
          </p>

          <Label text={t("backstage.form.name")} error={errors.name}>
            <input
              className={input}
              value={form.name}
              maxLength={80}
              autoComplete="name"
              aria-invalid={!!errors.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Label>
          <Label text={t("backstage.form.email")} error={errors.email}>
            <input
              className={input}
              type="email"
              inputMode="email"
              value={form.email}
              maxLength={254}
              autoComplete="email"
              aria-invalid={!!errors.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Label text={t("backstage.form.venue")} error={errors.venue}>
              <input
                className={input}
                value={form.venue}
                maxLength={100}
                autoComplete="organization"
                aria-invalid={!!errors.venue}
                onChange={(e) => set("venue", e.target.value)}
              />
            </Label>
            <Label text={t("backstage.form.city")} error={errors.city}>
              <input
                className={input}
                value={form.city}
                maxLength={60}
                autoComplete="address-level2"
                aria-invalid={!!errors.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </Label>
          </div>
          <Label text={t("backstage.form.system")} error={errors.system}>
            <Select
              className="w-full"
              dimEmpty
              label={t("backstage.form.system")}
              placeholder={t("backstage.form.systemPlaceholder")}
              value={form.system}
              onChange={(v) => set("system", v)}
              options={(["none", "fourvenues", "other"] as const).map((v) => ({
                value: v,
                label: t(`backstage.form.sys.${v}`),
              }))}
            />
          </Label>
          <Label text={t("backstage.form.phone")}>
            <input
              className={input}
              type="tel"
              inputMode="tel"
              value={form.phone}
              maxLength={30}
              autoComplete="tel"
              onChange={(e) => set("phone", e.target.value)}
            />
          </Label>
          <Label text={t("backstage.form.message")}>
            <textarea
              rows={3}
              className={`${input} min-h-20 resize-none`}
              value={form.message}
              maxLength={1000}
              onChange={(e) => set("message", e.target.value)}
            />
          </Label>

          {/* Campo trampa: oculto para personas, los bots lo rellenan. */}
          <input
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
          />

          <button
            type="submit"
            disabled={sending}
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-black transition-[opacity,transform] duration-100 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            {sending ? t("backstage.form.sending") : t("backstage.form.submit")}
          </button>
          <p className="text-center text-xs text-white/40">
            {t("backstage.form.privacy")}
          </p>
        </form>
      )}
    </Dialog>
  );
}
