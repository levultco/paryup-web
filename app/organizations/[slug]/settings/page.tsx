import type { Metadata } from "next";
import { SettingsView } from "@/components/organizations/SettingsView";

// Panel con sesión y datos cargados en cliente: no hay shell estático que validar.
export const instant = false;

export const metadata: Metadata = { title: "Ajustes de la organización" };

export default function Page() {
  return <SettingsView />;
}
