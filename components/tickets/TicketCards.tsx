"use client";

import { QrCodeIcon } from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { TONES, TicketShape } from "@/components/tickets/TicketShape";
import { dayOfMonth, weekdayShort, nightKey } from "@/lib/discovery";
import { timeLabel } from "@/lib/format";
import {
  availabilityLabel,
  temporalStatus,
  typeLabel,
  type MyTicket,
} from "@/lib/tickets";

function Poster({
  ticket,
  width,
  height,
  dim,
}: {
  ticket: MyTicket;
  width: number;
  height: number;
  dim?: boolean;
}) {
  const style = { width, height };
  if (!ticket.event.coverImage) {
    return (
      <div
        style={style}
        className="flex shrink-0 items-center justify-center rounded-xl bg-[#111]"
      >
        <span className="font-display text-xl font-bold text-white/30">
          {ticket.event.name.trim().charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ticket.event.coverImage}
      alt=""
      loading="lazy"
      decoding="async"
      style={style}
      className={`shrink-0 rounded-xl bg-[#111] object-cover ${dim ? "opacity-70" : ""}`}
    />
  );
}

const quantityLabel = (ticket: MyTicket) =>
  ticket.quantity > 1 ? `  ·  x${ticket.quantity}` : "";

/** Entrada de esta noche: tono claro, con el acceso al QR. */
export function TonightCard({
  ticket,
  now,
  onOpen,
}: {
  ticket: MyTicket;
  now: Date;
  onOpen: (ticket: MyTicket) => void;
}) {
  const { t, locale } = useI18n();
  const palette = TONES.light;
  const live = temporalStatus(ticket, now) === "ACTIVE";
  const meta = [ticket.event.location, timeLabel(ticket.event.date)]
    .filter(Boolean)
    .join("  •  ");

  return (
    <TicketShape
      tone="light"
      height={140}
      onClick={() => onOpen(ticket)}
      label={t("ticket.open", { name: ticket.event.name })}
      main={
        <>
          <Poster ticket={ticket} width={74} height={104} />
          <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: live ? "#DC2626" : "#16A34A" }}
              />
              <span
                className="text-[11px] font-extrabold tracking-[0.1em]"
                style={{ color: live ? "#DC2626" : palette.sub }}
              >
                {live ? t("ticket.live") : t("ticket.tonightTag")}
              </span>
            </div>
            <p
              className="line-clamp-2 text-lg font-extrabold leading-[1.15] tracking-tight"
              style={{ color: palette.text }}
            >
              {ticket.event.name}
            </p>
            {meta ? (
              <p
                className="truncate text-[13px] font-medium"
                style={{ color: palette.sub }}
              >
                {meta}
              </p>
            ) : null}
            <p
              className="truncate text-[11px] font-bold uppercase tracking-[0.05em]"
              style={{ color: palette.sub }}
            >
              {typeLabel(ticket, t)}
              {quantityLabel(ticket)}
            </p>
          </div>
        </>
      }
      stub={
        <>
          <span
            className="flex h-[54px] w-[54px] items-center justify-center rounded-2xl text-white"
            style={{ backgroundColor: palette.stubBg }}
          >
            <QrCodeIcon className="h-[30px] w-[30px]" />
          </span>
          <span
            className="text-[11px] font-extrabold tracking-[0.1em]"
            style={{ color: palette.text }}
          >
            {t("ticket.viewQr")}
          </span>
        </>
      }
    />
  );
}

/** Entrada de próximos días: tono oscuro con el día en el talón. */
export function UpcomingTicketCard({
  ticket,
  onOpen,
}: {
  ticket: MyTicket;
  onOpen: (ticket: MyTicket) => void;
}) {
  const { t, locale } = useI18n();
  const palette = TONES.dark;
  const key = nightKey(new Date(ticket.event.date));
  const meta = [timeLabel(ticket.event.date), ticket.event.location]
    .filter(Boolean)
    .join("  •  ");

  return (
    <TicketShape
      tone="dark"
      height={112}
      onClick={() => onOpen(ticket)}
      label={t("ticket.open", { name: ticket.event.name })}
      main={
        <>
          <Poster ticket={ticket} width={58} height={80} />
          <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <p
              className="line-clamp-2 text-lg font-extrabold leading-[1.15] tracking-tight"
              style={{ color: palette.text }}
            >
              {ticket.event.name}
            </p>
            <p
              className="truncate text-[13px] font-medium"
              style={{ color: palette.sub }}
            >
              {meta}
            </p>
            <p
              className="truncate text-[11px] font-bold uppercase tracking-[0.05em]"
              style={{ color: palette.sub }}
            >
              {typeLabel(ticket, t)}
              {quantityLabel(ticket)}
            </p>
          </div>
        </>
      }
      stub={
        <>
          <span
            className="text-xs font-extrabold uppercase tracking-[0.12em]"
            style={{ color: palette.sub }}
          >
            {weekdayShort(key, locale)}
          </span>
          <span
            className="text-[32px] font-extrabold leading-[34px] tracking-[-0.03em]"
            style={{ color: palette.text }}
          >
            {dayOfMonth(key)}
          </span>
        </>
      }
    />
  );
}

/** Entrada pasada: fila apagada con su estado. */
export function PastRow({
  ticket,
  now,
  onOpen,
}: {
  ticket: MyTicket;
  now: Date;
  onOpen: (ticket: MyTicket) => void;
}) {
  const { t, locale } = useI18n();
  const palette = TONES.muted;
  const key = nightKey(new Date(ticket.event.date));
  const meta = [
    `${weekdayShort(key, locale)} ${dayOfMonth(key)}`,
    ticket.event.location,
  ]
    .filter(Boolean)
    .join("  •  ");

  return (
    <TicketShape
      tone="muted"
      height={76}
      onClick={() => onOpen(ticket)}
      label={t("ticket.open", { name: ticket.event.name })}
      main={
        <>
          <Poster ticket={ticket} width={42} height={54} dim />
          <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <p
              className="truncate text-[15px] font-bold"
              style={{ color: palette.text }}
            >
              {ticket.event.name}
            </p>
            <p
              className="truncate text-[13px] font-medium"
              style={{ color: palette.sub }}
            >
              {meta}
            </p>
          </div>
        </>
      }
      stub={
        <span
          className="line-clamp-2 text-center text-[11px] font-bold uppercase tracking-[0.04em]"
          style={{ color: palette.sub }}
        >
          {availabilityLabel(ticket, now, t)}
        </span>
      }
    />
  );
}

export function TicketsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      {[0, 1, 2].map((index) => (
        <TicketShape
          key={index}
          tone="dark"
          height={112}
          main={
            <>
              <div className="h-20 w-[58px] shrink-0 animate-pulse rounded-xl bg-white/10" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-4/5 animate-pulse rounded-md bg-white/10" />
                <div className="h-3 w-3/5 animate-pulse rounded-md bg-white/10" />
                <div className="h-3 w-2/5 animate-pulse rounded-md bg-white/10" />
              </div>
            </>
          }
          stub={
            <>
              <div className="h-3 w-8 animate-pulse rounded-md bg-white/10" />
              <div className="h-7 w-9 animate-pulse rounded-lg bg-white/10" />
            </>
          }
        />
      ))}
    </div>
  );
}
