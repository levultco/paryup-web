"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { QrCode } from "@/components/tickets/QrCode";
import { DISCOVERY_TZ } from "@/lib/discovery";
import { intlLocale, type Locale } from "@/lib/i18n";
import { timeLabel } from "@/lib/format";
import {
  qrUnavailableReason,
  qrValue,
  typeLabel,
  type MyTicket,
} from "@/lib/tickets";

const dateFormat = (locale: Locale) =>
  new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: DISCOVERY_TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

/**
 * Entrada abierta: tarjeta clara con fecha, hora, evento y QR, como la de la app.
 * El token del QR solo viene en el detalle, así que se pide al abrirla.
 */
export function TicketDialog({
  ticket,
  now,
  onClose,
}: {
  ticket: MyTicket;
  now: Date;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const [detail, setDetail] = useState<MyTicket | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/tickets/${encodeURIComponent(ticket.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => active && data?.ticket && setDetail(data.ticket))
      .catch(() => null);
    return () => {
      active = false;
    };
  }, [ticket.id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const current = detail ?? ticket;
  const value = qrValue(current, now);
  const date = new Date(current.event.date);
  const dateLabel = Number.isNaN(date.getTime())
    ? current.event.date
    : dateFormat(locale).format(date).replace(".", "");

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("dlg.aria", { name: current.event.name })}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-sm rounded-[32px] bg-[#F7F7F9] px-7 pb-8 pt-10 text-[#1C1C1E]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="absolute left-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-black/60 transition hover:bg-black/5"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        {current.event.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.event.coverImage}
            alt=""
            className="absolute right-5 top-5 h-[54px] w-[54px] rounded-[10px] border border-black/10 object-cover"
          />
        ) : null}

        <dl className="mt-6 space-y-6">
          <div>
            <dt className="text-[13px] uppercase tracking-wide text-[#8E8E93]">
              {t("dlg.date")}
            </dt>
            <dd className="mt-1.5 text-xl font-semibold uppercase">
              {dateLabel}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] uppercase tracking-wide text-[#8E8E93]">
              {t("dlg.time")}
            </dt>
            <dd className="mt-1.5 text-xl font-semibold">
              {timeLabel(current.event.date) ?? "--:--"}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] uppercase tracking-wide text-[#8E8E93]">
              {t("dlg.event")}
            </dt>
            <dd className="mt-1.5 text-xl font-semibold leading-snug">
              {current.event.name}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-black/10 pt-5">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">
              {typeLabel(current, t)}
            </p>
            <p className="mt-0.5 truncate text-[13px] text-[#8E8E93]">
              {current.id.slice(0, 13).toUpperCase()}
            </p>
            {current.quantity > 1 ? (
              <p className="mt-1.5 text-[13px] font-semibold">
                x{current.quantity}
              </p>
            ) : null}
          </div>
          <div className="flex h-[132px] w-[132px] shrink-0 items-center justify-center">
            {value ? (
              <QrCode value={value} size={132} label={t("ticket.qrAria")} />
            ) : (
              <p className="text-center text-[13px] font-medium text-[#8E8E93]">
                {qrUnavailableReason(current, now, t)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
