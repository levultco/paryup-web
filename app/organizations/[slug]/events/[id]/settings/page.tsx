import type { Metadata } from "next";

import { EventEditor } from "@/components/organizations/EventEditor";

export const instant = false;
export const metadata: Metadata = { title: "Ajustes del evento" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventEditor eventId={id} />;
}
