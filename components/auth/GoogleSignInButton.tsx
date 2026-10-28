"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";

type GoogleId = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    ux_mode?: "popup";
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: Record<string, string | number>,
  ) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject());
    if (!existing) {
      script.src = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

export function GoogleSignInButton({
  onCredential,
  disabled,
}: {
  onCredential: (idToken: string) => void;
  disabled?: boolean;
}) {
  const { t, locale } = useI18n();
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  const [failed, setFailed] = useState(!CLIENT_ID);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    callback.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const element = container.current;
    if (!CLIENT_ID || !element) return;
    let active = true;
    loadScript()
      .then(() => {
        if (!active || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: ({ credential }) => callback.current(credential),
          ux_mode: "popup",
        });
        window.google.accounts.id.renderButton(element, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
          width: Math.min(400, Math.round(element.clientWidth)),
          locale,
        });
        // Si Google no acepta el origen, el botón se queda sin tamaño
        setTimeout(() => {
          if (active && !element.querySelector("iframe")?.offsetHeight) {
            setBlocked(true);
          }
        }, 4000);
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [locale]);

  if (failed) {
    return (
      <p className="text-center text-xs text-muted">
        {t("login.googleFailed")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        aria-disabled={disabled || blocked}
        className={`group relative h-12 w-full ${
          disabled || blocked ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <div
          aria-hidden
          className="flex h-full w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-6 text-sm font-medium text-white transition-colors group-hover:border-white/30 group-hover:bg-white/10"
        >
          <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]">
            <path
              fill="#EA4335"
              d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"
            />
            <path
              fill="#FBBC05"
              d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
            />
          </svg>
          {t("login.google")}
        </div>
        {/* El botón oficial de Google, invisible, encima: mantiene el flujo seguro y recibe el clic */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full opacity-[0.01]">
          <div
            ref={container}
            className="flex h-10 w-full justify-center"
            style={{ transform: "scaleY(1.2)" }}
          />
        </div>
      </div>
      {blocked ? (
        <p className="text-center text-xs text-muted">
          {t("login.googleUnavailable")}
        </p>
      ) : null}
    </div>
  );
}
