"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { QrCode } from "@/components/tickets/QrCode";
import { intlLocale } from "@/lib/i18n";
import {
  bookingStateLabel,
  listStateLabel,
  registrationCopy,
  visibleBookingQr,
  visibleListQr,
  type ExternalBooking,
  type ExternalListEntry,
} from "@/lib/external-registrations";

/**
 * Historial del usuario en Fourvenues dentro de «Mis entradas» (solo lectura): listas y solicitudes
 * de reserva. Son registros externos, aparte de las entradas nativas. No se muestra nada si no hay
 * ninguno ni si la consulta falla.
 */
export function ExternalRegistrations() {
  const { locale } = useI18n();
  const [data, setData] = useState<{ lists: ExternalListEntry[]; bookings: ExternalBooking[] } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/external/fourvenues")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => active && json && setData(json))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (!data || data.lists.length + data.bookings.length === 0) return null;
  const copy = registrationCopy(locale);
  const day = new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "short" });

  return (
    <section className="mb-10" aria-labelledby="fv-registrations">
      <h2 id="fv-registrations" className="font-display text-lg font-semibold text-white">
        {copy.title}
      </h2>
      <p className="mb-4 text-sm text-white/50">{copy.hint}</p>
      <ul className="flex flex-col gap-3">
        {data.lists.map((entry) => {
          const qr = visibleListQr(entry);
          return (
            <li key={`l-${entry.id}`} className="rounded-[22px] bg-raised p-4 ring-1 ring-white/[0.08]">
              <span className="block font-medium text-white">{entry.event?.name ?? copy.list}</span>
              <span className="block text-sm text-white/60">
                {copy.list} · {copy.people.replace("{n}", String(entry.partySize))} · {listStateLabel(entry, locale)}
              </span>
              {entry.state === "CONFIRMED" ? (
                qr ? (
                  <div className="mt-3 flex flex-col items-start gap-1">
                    <QrCode value={qr} size={132} label={copy.qr} />
                  </div>
                ) : (
                  <span className="mt-2 block text-xs text-white/45">{copy.qrPending}</span>
                )
              ) : null}
            </li>
          );
        })}
        {data.bookings.map((booking) => {
          const qr = visibleBookingQr(booking);
          return (
            <li key={`b-${booking.id}`} className="rounded-[22px] bg-raised p-4 ring-1 ring-white/[0.08]">
              <span className="block font-medium text-white">{booking.event?.name ?? copy.booking}</span>
              <span className="block text-sm text-white/60">
                {copy.booking} · {copy.people.replace("{n}", String(booking.quantity))} ·{" "}
                {bookingStateLabel(booking.outcome, locale)}
              </span>
              <time dateTime={booking.createdAt} className="mt-1 block text-xs text-white/40">
                {day.format(new Date(booking.createdAt))}
              </time>
              {qr ? (
                <div className="mt-3">
                  <QrCode value={qr} size={132} label={copy.qr} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
