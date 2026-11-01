"use client";

import { useEffect } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { notify } from "@/lib/toast";

type FlashMessage = { tone: "success" | "error"; text: string };

/**
 * Convierte el estado `message` de una pantalla en una notificación. No pinta nada:
 * cada vez que llega un mensaje nuevo (por identidad) lanza un toast.
 */
export function Flash({
  message,
  tone = "error",
}: {
  message: FlashMessage | string | null;
  /** Solo para mensajes en forma de texto. */
  tone?: FlashMessage["tone"];
}) {
  const { t } = useI18n();
  useEffect(() => {
    if (!message) return;
    const [kind, text] =
      typeof message === "string"
        ? ([tone, message] as const)
        : ([message.tone, message.text] as const);
    // Título corto por tipo; el texto completo aparece al pasar el cursor.
    notify(kind, t(`orgs.toast.${kind}`), text);
  }, [message, tone, t]);
  return null;
}
