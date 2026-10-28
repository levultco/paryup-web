"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { MagnifierIcon } from "@/components/icons/solar";
import { useI18n } from "@/components/i18n/LocaleProvider";
import {
  PastRow,
  TicketsSkeleton,
  TonightCard,
  UpcomingTicketCard,
} from "@/components/tickets/TicketCards";
import { TicketDialog } from "@/components/tickets/TicketDialog";
import { groupTickets, type MyTicket } from "@/lib/tickets";

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="font-display mb-4 text-lg font-semibold text-white">
      {children}
    </h2>
  );
}

export function TicketsView() {
  const router = useRouter();
  const { status } = useAuth();
  const { t } = useI18n();
  const [tickets, setTickets] = useState<MyTicket[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<MyTicket | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Las secciones y el QR dependen de la hora: se refrescan cada minuto.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?next=/tickets");
      return;
    }
    if (status !== "authenticated") return;

    let active = true;
    fetch("/api/tickets")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login?next=/tickets");
          return;
        }
        if (!res.ok) throw new Error("tickets");
        const data = await res.json();
        if (active) setTickets(data.tickets);
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [status, router]);

  const groups = useMemo(
    () => (tickets ? groupTickets(tickets, now) : null),
    [tickets, now],
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">
        {t("tickets.title")}
      </h1>

      <div className="mt-10">
        {failed ? (
          <p className="py-20 text-center text-muted">{t("tickets.error")}</p>
        ) : !groups ? (
          <TicketsSkeleton />
        ) : tickets && tickets.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <p className="text-[26px] font-extrabold leading-8 tracking-tight">
              {t("tickets.emptyLead")}
              <span className="font-serif font-medium italic tracking-normal">
                {t("tickets.emptyAccent")}
              </span>
            </p>
            <p className="mt-2 max-w-sm text-base text-white/55">
              {t("tickets.emptyText")}
            </p>
            <Link
              href="/events"
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-base font-medium text-black transition hover:bg-white/90"
            >
              <MagnifierIcon className="h-5 w-5" />
              {t("tickets.explore")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {groups.tonight.length > 0 ? (
              <section>
                <SectionTitle>{t("tickets.tonight")}</SectionTitle>
                <p className="-mt-2 mb-4 text-sm text-white/50">
                  {t("tickets.tonightHint")}
                </p>
                <div className="flex flex-col gap-6">
                  {groups.tonight.map((ticket) => (
                    <TonightCard
                      key={ticket.id}
                      ticket={ticket}
                      now={now}
                      onOpen={setSelected}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {groups.upcoming.length > 0 ? (
              <section>
                <SectionTitle>{t("tickets.upcoming")}</SectionTitle>
                <div className="flex flex-col gap-6">
                  {groups.upcoming.map((ticket) => (
                    <UpcomingTicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onOpen={setSelected}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {groups.past.length > 0 ? (
              <section>
                <SectionTitle>{t("tickets.past")}</SectionTitle>
                <div className="flex flex-col gap-6">
                  {groups.past.map((ticket) => (
                    <PastRow
                      key={ticket.id}
                      ticket={ticket}
                      now={now}
                      onOpen={setSelected}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>

      {selected ? (
        <TicketDialog
          ticket={selected}
          now={now}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
