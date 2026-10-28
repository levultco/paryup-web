import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Header } from "@/screens/header";
import { DiscoveryView } from "@/components/discovery/DiscoveryView";
import { EventTileSkeleton } from "@/components/discovery/EventTile";
import { getNightEvents, searchUpcoming } from "@/lib/discovery-server";
import {
  areaLabel,
  longDateLabel,
  nightKey,
  parseDiscoveryParams,
} from "@/lib/discovery";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const raw = await searchParams;
  await connection(); // "hoy" depende de la hora actual
  const params = parseDiscoveryParams(raw, nightKey());
  const city = areaLabel(params.area);
  return {
    title: `Eventos en ${city}`,
    description: `Fiestas y planes en ${city} para el ${longDateLabel(params.date)}. Mira qué pasa y llévalo a la app.`,
    alternates: {
      canonical:
        params.area === "barcelona"
          ? "/events"
          : `/events?ciudad=${params.area}`,
    },
  };
}

const gridClass =
  "grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

async function Discovery({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  await connection(); // "hoy" depende de la hora actual

  const today = nightKey();
  const params = parseDiscoveryParams(raw, today);
  // La primera pintura ya trae los eventos en el HTML (también para buscadores).
  const [events, searchEvents] = await Promise.all([
    getNightEvents(params.area, params.date, params.price).catch(() => null),
    params.q
      ? searchUpcoming(params.q).catch(() => null)
      : Promise.resolve(null),
  ]);

  return <DiscoveryView initial={{ ...params, today, events, searchEvents }} />;
}

export default function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto w-full max-w-[1800px] px-[clamp(1.25rem,3vw,3.5rem)] pb-28 pt-32 md:pt-40">
        <Suspense
          fallback={
            <div className={gridClass}>
              {Array.from({ length: 5 }, (_, i) => (
                <EventTileSkeleton key={i} />
              ))}
            </div>
          }
        >
          <Discovery searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
