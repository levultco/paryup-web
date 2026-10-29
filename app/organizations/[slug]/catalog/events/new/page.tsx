import type { Metadata } from "next";
import { EventTemplateEditor } from "@/components/organizations/EventTemplateEditor";

export const instant = false;
export const metadata: Metadata = { title: "Nueva plantilla de evento" };

export default function Page() {
  return <EventTemplateEditor />;
}
