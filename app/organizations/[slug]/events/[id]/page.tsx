import type { Metadata } from "next";

import { EventDetail } from "@/components/organizations/EventDetail";

export const instant = false;
export const metadata: Metadata = { title: "Evento" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetail eventId={id} />;
}
