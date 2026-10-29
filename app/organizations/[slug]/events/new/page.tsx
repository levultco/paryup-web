import type { Metadata } from "next";

import { EventEditor } from "@/components/organizations/EventEditor";

export const instant = false;
export const metadata: Metadata = { title: "Nuevo evento" };

export default function Page() {
  return <EventEditor />;
}
