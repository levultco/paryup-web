import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/screens/header";
import { TicketsView } from "@/components/events/TicketsView";

export const metadata: Metadata = { title: "Mis entradas" };

export default function TicketsPage() {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto w-full max-w-[1800px] px-[clamp(1.25rem,3vw,3.5rem)] pb-28 pt-32 md:pt-40">
        <Suspense fallback={null}>
          <TicketsView />
        </Suspense>
      </main>
    </>
  );
}
