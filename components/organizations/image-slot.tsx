"use client";

import { CloseIcon, GalleryAddIcon } from "@/components/icons/solar";
import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { APPLE_EASE } from "@/components/organizations/promoters-ui";

const TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Hueco de imagen con estado vacío: invita a añadir (clic o arrastrar), y con imagen
 * ofrece Cambiar / Quitar sobre la propia imagen. El padre decide tamaño con `className`.
 */
export function ImageSlot({
  src,
  title,
  hint,
  uploading,
  disabled,
  circle,
  flat,
  className = "",
  emptyClassName = "",
  onFile,
  onRemove,
}: {
  src?: string | null;
  title: string;
  hint?: string;
  uploading?: boolean;
  disabled?: boolean;
  circle?: boolean;
  /** Hueco sin borde discontinuo: relleno plano y texto con más contraste. */
  flat?: boolean;
  className?: string;
  /** Clases extra solo para el estado vacío (p. ej. dejar sitio a un elemento solapado). */
  emptyClassName?: string;
  onFile: (file: File) => void;
  onRemove?: () => void;
}) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const shape = circle ? "rounded-full" : "rounded-2xl";
  const blocked = disabled || uploading;

  const drop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (blocked) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      className={`group relative isolate overflow-hidden ${shape} ${className}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!blocked) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
    >
      <input
        ref={input}
        type="file"
        hidden
        accept={TYPES.join(",")}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />

      {src && flat ? (
        <>
          {/* Toda la imagen es el botón de cambiar; sin controles que no quepan. */}
          <button
            type="button"
            disabled={blocked}
            aria-label={t("orgs.img.change")}
            onClick={() => input.current?.click()}
            className="absolute inset-0 block h-full w-full cursor-pointer outline-none transition-transform duration-100 active:scale-[0.99] disabled:cursor-not-allowed"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <span
              className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/45 text-[13px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
              style={{ transitionTimingFunction: APPLE_EASE }}
            >
              <GalleryAddIcon aria-hidden className="h-5 w-5 shrink-0" />
              {circle ? null : t("orgs.img.change")}
            </span>
          </button>
          {onRemove && !circle ? (
            <button
              type="button"
              disabled={blocked}
              aria-label={t("orgs.pf.remove")}
              onClick={onRemove}
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-[background-color,transform] duration-100 hover:bg-black/70 active:scale-95 disabled:opacity-50"
            >
              <CloseIcon aria-hidden className="h-4 w-4" />
            </button>
          ) : null}
        </>
      ) : src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-full w-full object-cover" />
          {!disabled ? (
            <div
              className={`absolute flex items-center gap-1.5 inset-x-2 bottom-2 justify-center ${circle ? "inset-x-0 bottom-0 top-0 items-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/45 group-hover:opacity-100" : ""}`}
            >
              <button
                type="button"
                disabled={blocked}
                onClick={() => input.current?.click()}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-black/55 px-3.5 text-[13px] font-medium text-white backdrop-blur-md transition-[background-color,transform] duration-100 hover:bg-black/70 active:scale-95 disabled:opacity-50"
              >
                <GalleryAddIcon aria-hidden className="h-3.5 w-3.5" />
                {t("orgs.img.change")}
              </button>
              {onRemove && !circle ? (
                <button
                  type="button"
                  disabled={blocked}
                  aria-label={t("orgs.pf.remove")}
                  onClick={onRemove}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-[background-color,transform] duration-100 hover:bg-black/70 active:scale-95 disabled:opacity-50"
                >
                  <CloseIcon aria-hidden className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <button
          type="button"
          disabled={blocked}
          onClick={() => input.current?.click()}
          className={`${emptyClassName} flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center ${flat ? "" : "border border-dashed"} transition-[background-color,border-color,transform] duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${shape} ${
            flat
              ? over
                ? "scale-[1.01] bg-white/[0.18]"
                : "bg-white/[0.09] hover:bg-white/[0.14]"
              : over
                ? "scale-[1.01] border-white/60 bg-white/[0.1]"
                : "border-white/15 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.07]"
          }`}
          style={{ transitionTimingFunction: APPLE_EASE }}
        >
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/80 ${flat ? "bg-white/[0.12]" : "bg-white/[0.08]"}`}>
            <GalleryAddIcon aria-hidden className="h-5 w-5" />
          </span>
          {circle ? null : (
            <>
              <span className="text-[15px] font-medium text-white/90">
                {title}
              </span>
              {hint ? (
                <span className={`max-w-[16rem] text-xs leading-snug ${flat ? "text-white/60" : "text-white/40"}`}>
                  {hint}
                </span>
              ) : null}
            </>
          )}
        </button>
      )}

      {uploading ? (
        <span className="skeleton absolute inset-0 z-10 flex items-center justify-center bg-black/60 text-sm text-white">
          {t("orgs.pf.uploading")}
        </span>
      ) : null}
      {over && src ? (
        <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 text-sm text-white">
          {title}
        </span>
      ) : null}
    </div>
  );
}
