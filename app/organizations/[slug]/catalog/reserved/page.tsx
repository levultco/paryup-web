import type { Metadata } from "next";
import { ReservedCatalog } from "@/components/organizations/ReservedCatalog";

export const instant = false;
export const metadata: Metadata = { title: "Reservados" };

export default function Page() {
  return <ReservedCatalog />;
}
