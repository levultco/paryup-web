import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Header } from "@/screens/header";
import {
  EventDetail,
  EventLoadError,
  LoadingText,
} from "@/components/events/EventDetail";
import { getPublicEvent } from "@/lib/discovery-server";
import { discoveryQuery, nightKey } from "@/lib/discovery";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ ref?: string | string[] }>;

// Código de promotor (Crockford base32, 8 caracteres). Solo se muestra si tiene exactamente ese formato.
const PROMOTER_CODE = /^[0-9A-HJKMNP-TV-Z]{8}$/;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getPublicEvent(id).catch(() => null);
  if (!event) return { title: "Evento" };
  const description =
    event.description?.slice(0, 160) ??
    `${event.name}${event.location ? ` en ${event.location}` : ""}. Consigue tu entrada en la app de ParyUp.`;
  return {
    title: event.name,
    description,
    alternates: { canonical: `/events/${event.id}` },
    openGraph: {
      title: event.name,
      description,
      type: "website",
      images: event.coverImage ? [event.coverImage] : undefined,
    },
  };
}

async function Detail({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const rawRef = (await searchParams).ref;
  const ref = (Array.isArray(rawRef) ? rawRef[0] : rawRef)?.toUpperCase();
  const promoterCode = ref && PROMOTER_CODE.test(ref) ? ref : null;
  await connection(); // el día de "volver" depende de la hora actual
  const event = await getPublicEvent(id).catch(() => undefined);

  if (event === undefined) return <EventLoadError />;
  if (event === null) notFound();

  const year = Number(nightKey().slice(0, 4));
  // La "noche" del evento (antes de las 10:00 cuenta como la anterior) para volver a su día.
  const backDate = nightKey(new Date(event.date));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate: event.date,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(event.coverImage ? { image: [event.coverImage] } : {}),
    ...(event.description ? { description: event.description } : {}),
    ...(event.location
      ? {
          location: {
            "@type": "Place",
            name: event.location,
            ...(event.address ? { address: event.address } : {}),
          },
        }
      : {}),
    ...(event.organization
      ? {
          organizer: { "@type": "Organization", name: event.organization.name },
        }
      : {}),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {promoterCode ? (
        <aside className="mb-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Te han invitado a este evento</p>
            <p className="text-sm opacity-70">
              Abre ParyUp para comprar. Si te lo piden, tu código es{" "}
              <span className="font-mono font-bold tracking-widest">
                {promoterCode.slice(0, 4)}-{promoterCode.slice(4)}
              </span>
            </p>
          </div>
          <a
            href={`paryup://events/${encodeURIComponent(id)}?ref=${promoterCode}`}
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black"
          >
            Abrir en ParyUp
          </a>
        </aside>
      ) : null}
      <EventDetail
        event={event}
        backHref={`/events${discoveryQuery({ area: "barcelona", date: backDate, price: "any" }, nightKey())}`}
        year={year}
      />
    </article>
  );
}

export default function EventPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto w-full max-w-[1400px] px-[clamp(1.25rem,3vw,3.5rem)] pb-28 pt-32 md:pt-40">
        <Suspense fallback={<LoadingText />}>
          <Detail params={params} searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
