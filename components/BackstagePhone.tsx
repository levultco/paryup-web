"use client";

import Image from "next/image";
import PhoneFrame from "@/components/PhoneFrame";
import { useI18n } from "@/components/i18n/LocaleProvider";

// Captura real de Backstage en la app (920 × 2000, como /app/home.webp).
// Mientras no exista, la tarjeta muestra un hueco reservado, igual que la home.
const SCREEN: string | null = null;

/** El móvil de la tarjeta "Eventos": la app de Backstage dentro del marco del hero. */
export default function PhoneEvents() {
  const { t } = useI18n();
  return (
    <div className="flex h-full w-full items-start justify-center">
      <PhoneFrame glow={false} className="w-[min(340px,70%)]">
        {SCREEN ? (
          <Image
            src={SCREEN}
            alt={t("backstage.feature.eventos.title")}
            width={920}
            height={2000}
            sizes="300px"
            className="h-auto w-full"
          />
        ) : (
          <div
            style={{ aspectRatio: "920 / 2000" }}
            className="flex w-full items-end justify-center bg-gradient-to-b from-[#161616] to-[#0a0a0a] pb-[28%]"
          >
            <span className="max-w-[70%] rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-center text-[11px] font-medium uppercase leading-snug tracking-[0.14em] text-white/45">
              {t("backstage.feature.eventos.slot")}
            </span>
          </div>
        )}
      </PhoneFrame>
    </div>
  );
}
