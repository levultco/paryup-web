"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Phase = "loading" | "invalid" | "login" | "ready" | "waiting" | "paid";

const btn =
  "inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-40";

/** Pantalla del enlace que recibe la sala tras la demo: pago y, después, crear su organización. */
export function ActivationView() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const returnedFromStripe = params.get("paid") === "1";
  const [phase, setPhase] = useState<Phase>("loading");
  const [venue, setVenue] = useState("");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    let tries = 0;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/backstage-activation?token=${encodeURIComponent(token)}`,
        );
        if (!alive) return;
        if (!res.ok) return setPhase("invalid");
        const info = await res.json();
        setVenue(info.venue ?? "");
        if (info.paid) {
          setOrgId(info.organizationId ?? null);
          return setPhase("paid");
        }
        if (returnedFromStripe && tries++ < 20) {
          // Stripe tarda unos segundos en confirmar el pago al servidor.
          setPhase("waiting");
          return void setTimeout(load, 2000);
        }
        const me = await fetch("/api/organizations");
        if (!alive) return;
        setPhase(me.status === 401 ? "login" : "ready");
      } catch {
        if (alive) setPhase("invalid");
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [token, returnedFromStripe]);

  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/backstage-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data?.message ?? "No se pudo iniciar el pago. Inténtalo de nuevo.");
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("No se pudo conectar. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-white">
      {phase === "loading" && <p className="text-white/50">Cargando…</p>}
      {phase === "waiting" && (
        <p className="text-white/60">Confirmando tu pago…</p>
      )}
      {phase === "invalid" && (
        <>
          <h1 className="text-2xl font-semibold">Enlace no válido</h1>
          <p className="mt-2 text-white/60">
            Este enlace ha caducado o ya se ha usado. Escríbenos y te enviamos
            uno nuevo.
          </p>
        </>
      )}
      {phase === "login" && (
        <>
          <h1 className="text-2xl font-semibold">Activa {venue}</h1>
          <p className="mt-2 text-white/60">
            Inicia sesión con tu cuenta de ParyUp para continuar. La
            organización quedará a tu nombre.
          </p>
          <Link href="/login" className={`${btn} mt-6`}>
            Iniciar sesión
          </Link>
        </>
      )}
      {phase === "ready" && (
        <>
          <h1 className="text-2xl font-semibold">Activa {venue}</h1>
          <p className="mt-2 text-white/60">
            Añade tu tarjeta o cuenta SEPA para empezar. Tienes 30 días de
            prueba: no se te cobra nada hasta que terminen y puedes cancelar
            antes. Después podrás crear tu organización.
          </p>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          <button className={`${btn} mt-6`} disabled={busy} onClick={pay}>
            {busy ? "Redirigiendo…" : "Añadir método de pago y empezar"}
          </button>
        </>
      )}
      {phase === "paid" && (
        <>
          <h1 className="text-2xl font-semibold">
            {orgId ? "Ya está activada" : "¡Pago confirmado!"}
          </h1>
          <p className="mt-2 text-white/60">
            {orgId
              ? `${venue} ya tiene su organización.`
              : "Ya puedes crear tu organización. Tu prueba de 30 días empieza ahora."}
          </p>
          <Link
            href={orgId ? "/organizations" : "/organizations/new"}
            className={`${btn} mt-6`}
          >
            {orgId ? "Ir a mis organizaciones" : "Crear mi organización"}
          </Link>
        </>
      )}
    </main>
  );
}
