import type { Metadata } from "next";

import { EventsList } from "@/components/organizations/EventsList";

export const instant = false;
export const metadata: Metadata = { title: "Eventos" };

export default function Page() {
  return <EventsList />;
}
