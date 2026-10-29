import type { Metadata } from "next";
import { TicketTemplateEditor } from "@/components/organizations/TicketTemplateEditor";

export const instant = false;
export const metadata: Metadata = { title: "Nueva plantilla de entrada" };

export default function Page() {
  return <TicketTemplateEditor />;
}
