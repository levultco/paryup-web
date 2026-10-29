import type { Metadata } from "next";
import { EventTemplatesList } from "@/components/organizations/EventTemplatesList";

export const instant = false;
export const metadata: Metadata = { title: "Plantillas de evento" };

export default function Page() {
  return <EventTemplatesList />;
}
