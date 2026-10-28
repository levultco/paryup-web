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

async function Detail({ params }: { params: Params }) {
  const { id } = await params;
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
      <EventDetail
        event={event}
        backHref={`/events${discoveryQuery({ area: "barcelona", date: backDate, price: "any" }, nightKey())}`}
        year={year}
      />
    </article>
  );
}

export default function EventPage({ params }: { params: Params }) {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto w-full max-w-[1400px] px-[clamp(1.25rem,3vw,3.5rem)] pb-28 pt-32 md:pt-40">
        <Suspense fallback={<LoadingText />}>
          <Detail params={params} />
        </Suspense>
      </main>
    </>
  );
}
