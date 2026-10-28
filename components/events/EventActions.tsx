"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircleIcon,
  CloseIcon,
  LinkRoundIcon,
  SmartphoneIcon,
} from "@/components/icons/solar";
import StoreButtons from "@/components/StoreButtons";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/components/content";
import { useI18n } from "@/components/i18n/LocaleProvider";

// La app solo registra el esquema `paryup://` (app.json); no hay universal links.
// Expo Router resuelve la ruta (events)/[eventId] como `/<id>`.
const deepLink = (id: string) => `paryup://${id}`;

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

export function EventActions({ id, title }: { id: string; title: string }) {
  const { t } = useI18n();
  const [dialog, setDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!dialog) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialog(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialog]);

  useEffect(
    () => () => {
      if (fallback.current) clearTimeout(fallback.current);
    },
    [],
  );

  const buy = () => {
    const platform = detectPlatform();
    const store = platform === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
    if (platform === "desktop") return setDialog(true);

    // Si la app está instalada el sistema la abre y esta pestaña pasa a segundo
    // plano; si no, tras un momento se lleva a la tienda.
    const cancel = () => {
      if (document.hidden && fallback.current) {
        clearTimeout(fallback.current);
        fallback.current = null;
      }
    };
    document.addEventListener("visibilitychange", cancel, { once: true });
    fallback.current = setTimeout(() => {
      fallback.current = null;
      document.removeEventListener("visibilitychange", cancel);
      if (document.hidden) return;
      if (store === "#") setDialog(true);
      else window.location.href = store;
    }, 1400);
    window.location.href = deepLink(id);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* el usuario canceló el menú de compartir */
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={buy}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-[0.98]"
        >
          <SmartphoneIcon className="h-5 w-5" />
          {t("actions.buy")}
        </button>
        <button
          type="button"
          onClick={share}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-medium transition hover:bg-white/10"
        >
          {copied ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <LinkRoundIcon className="h-5 w-5" />
          )}
          {copied ? t("actions.copied") : t("actions.share")}
        </button>
      </div>

      {dialog ? (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
          onClick={() => setDialog(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="handoff-title"
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-white/5 bg-secondary p-7"
          >
            <button
              type="button"
              onClick={() => setDialog(false)}
              aria-label={t("common.close")}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            <h2
              id="handoff-title"
              className="font-display text-2xl font-semibold"
            >
              {t("actions.dialogTitle")}
            </h2>
            <p className="mt-3 text-muted">
              {t("actions.dialogText", { title })}
            </p>
            <StoreButtons className="mt-6" />
          </div>
        </div>
      ) : null}
    </>
  );
}
