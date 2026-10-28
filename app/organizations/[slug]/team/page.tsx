import type { Metadata } from "next";
import { TeamView } from "@/components/organizations/TeamView";

// Panel con sesión y datos cargados en cliente: no hay shell estático que validar.
export const instant = false;

export const metadata: Metadata = { title: "Equipo" };

export default function Page() {
  return <TeamView />;
}
