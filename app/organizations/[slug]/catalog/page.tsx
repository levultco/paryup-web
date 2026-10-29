import type { Metadata } from "next";
import { TicketTemplatesList } from "@/components/organizations/TicketTemplatesList";

export const instant = false;
export const metadata: Metadata = { title: "Catálogo" };

export default function Page() {
  return <TicketTemplatesList />;
}
