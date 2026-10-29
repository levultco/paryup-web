import type { Metadata } from "next";
import { EventTemplateEditor } from "@/components/organizations/EventTemplateEditor";

export const instant = false;
export const metadata: Metadata = { title: "Editar plantilla de evento" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventTemplateEditor templateId={id} />;
}
