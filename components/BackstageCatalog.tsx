"use client";

import Image from "next/image";
import { useI18n } from "@/components/i18n/LocaleProvider";

/** Captura del catálogo del panel web dentro de una ventana de navegador de macOS, anclada abajo a la derecha. */
export default function BackstageCatalog({
  src = "/app/catalogo.webp",
  width = 1540,
  height = 1021,
  alt = "backstage.feature.entradas.title",
  centered = false,
  fill = false,
  zoom = 100,
  children,
}: {
  src?: string;
  width?: number;
  height?: number;
  alt?: string;
  /** Centrada horizontalmente y pegada abajo, en vez de asomar por la esquina derecha. */
  centered?: boolean;
  /** Ocupa todo el ancho, pegada arriba y recortada por abajo (sin sombra). */
  fill?: boolean;
  /** Amplía la captura dentro de la ventana (porcentaje, centrada): recorta márgenes vacíos y gana altura. */
  zoom?: number;
  /** Contenido propio en lugar de la imagen. */
  children?: React.ReactNode;
} = {}) {
  const { t } = useI18n();
  const base =
    "absolute overflow-hidden border-t border-white/15 bg-[#0b0b0b] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.9)]";
  const frame = fill
    ? "absolute inset-x-0 top-0 overflow-hidden rounded-t-xl border-x border-t border-white/15 bg-[#0b0b0b]"
    : centered
    ? `${base} bottom-[-8%] left-1/2 w-[92%] -translate-x-1/2 rounded-t-xl border-x`
    : `${base} left-[14%] top-[6%] w-[150%] rounded-tl-xl border-l md:left-[18%] md:w-[135%]`;
  return (
    <div className="relative h-full w-full">
      <div className={frame}>
        <div className="flex h-9 items-center gap-3 border-b border-white/10 bg-[#1f1f1f] px-3.5">
          <div aria-hidden className="flex gap-1.5">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="mx-auto flex h-6 w-[55%] items-center justify-center gap-1.5 rounded-md bg-black/40 text-[11px] font-medium text-white/50">
            <svg aria-hidden viewBox="0 0 12 12" className="size-2.5 fill-current">
              <path d="M6 0a3.5 3.5 0 0 0-3.5 3.5V5H2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-.5V3.5A3.5 3.5 0 0 0 6 0Zm2 5H4V3.5a2 2 0 1 1 4 0V5Z" />
            </svg>
            backstage.paryup.com
          </div>
          <div className="w-[54px]" />
        </div>
        {children ?? (
        <Image
          src={src}
          alt={t(alt)}
          width={width}
          height={height}
          unoptimized
          className="h-auto max-w-none"
          style={{ width: `${zoom}%`, marginLeft: `${(100 - zoom) / 2}%` }}
        />
        )}
      </div>
    </div>
  );
}
