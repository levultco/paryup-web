import type { Metadata } from "next";
import { TicketTemplateEditor } from "@/components/organizations/TicketTemplateEditor";

export const instant = false;
export const metadata: Metadata = { title: "Editar plantilla de entrada" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketTemplateEditor templateId={id} />;
}
