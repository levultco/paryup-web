"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type FormEvent, useEffect, useState } from "react";
import { ParyUpIsoIcon } from "@/public/icons/icons";
import { PhotoRing } from "./PhotoRing";

type Step = "name" | "email" | "done";

// El contador sigue en la página pero oculto con opacidad. Ponlo en true para mostrarlo.
const SHOW_COUNTER = false;

export function WaitlistScreen({
  initialCount,
}: {
  initialCount: number | null;
}) {
  const [count, setCount] = useState(initialCount);
  const [revealed, setRevealed] = useState(false);

  // Si la escena tarda en arrancar, mostramos el formulario igualmente.
  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 5000);
    return () => window.clearTimeout(timer);
  }, []);
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (step === "name") {
      if (!name.trim()) return;
      setStep("email");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company }),
      });
      if (response.ok) {
        setStep("done");
        setCount((current) => (current === null ? current : current + 1));
      } else {
        const data = await response.json().catch(() => ({}));
        setError(
          data.error === "invalid_email"
            ? "Revisa tu correo, parece incorrecto."
            : "No hemos podido apuntarte. Inténtalo otra vez.",
        );
      }
    } catch {
      setError("Sin conexión. Inténtalo otra vez.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="relative flex min-h-svh w-full flex-col items-center justify-end overflow-hidden bg-black px-4 pb-8">
      <PhotoRing onReveal={() => setRevealed(true)} />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,transparent_0%,rgba(0,0,0,0.55)_60%,#000_100%)]" />
      </div>

      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute left-6 top-5 z-10"
      >
        <ParyUpIsoIcon aria-label="ParyUp" role="img" className="h-10 w-10" />
      </motion.header>

      {count !== null ? (
        <motion.div
          aria-hidden={!SHOW_COUNTER}
          initial={{ opacity: 0 }}
          animate={{ opacity: SHOW_COUNTER && revealed ? 1 : 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="pointer-events-none absolute right-6 top-5 z-10 flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.08] px-4 py-2 text-sm text-white backdrop-blur-xl"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {count.toLocaleString("es-ES")} en la cola
        </motion.div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 14 }}
        transition={{ delay: 1.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mb-16 flex w-full max-w-md flex-col items-center gap-6 text-center"
      >
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-5xl">
          {step === "done" ? "Estás dentro" : "Apúntate antes que nadie"}
        </h1>

        <AnimatePresence mode="wait">
          {step === "done" ? (
            <motion.p
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/70"
            >
              Gracias, {name.trim()}. Te avisamos al correo cuando abramos.
            </motion.p>
          ) : (
            <motion.form
              key={step}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex w-full items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.09] p-1.5 backdrop-blur-xl"
            >
              {step === "name" ? (
                <input
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tu nombre"
                  maxLength={80}
                  aria-label="Tu nombre"
                  className="min-w-0 flex-1 bg-transparent px-4 text-base text-white outline-none placeholder:text-white/35"
                />
              ) : (
                <input
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Tu correo"
                  maxLength={254}
                  aria-label="Tu correo"
                  className="min-w-0 flex-1 bg-transparent px-4 text-base text-white outline-none placeholder:text-white/35"
                />
              )}
              <input
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="absolute h-0 w-0 opacity-0"
                name="company"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-full bg-[#f5f1ea] px-5 py-3 text-sm font-semibold text-black transition hover:bg-white disabled:opacity-60"
              >
                {step === "name"
                  ? "Siguiente"
                  : sending
                    ? "Enviando…"
                    : "Apuntarme"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {error ? (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        ) : null}
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="relative z-10 text-center text-xs text-white/35"
      >
        <p>Guardamos tu nombre y tu correo para avisarte cuando abramos. Nada más.</p>
        <p className="mt-1">© 2026 ParyUp</p>
      </motion.footer>
    </section>
  );
}
