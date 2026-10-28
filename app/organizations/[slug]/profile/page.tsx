import type { Metadata } from "next";
import { ProfileEditor } from "@/components/organizations/ProfileEditor";

// Panel con sesión y datos cargados en cliente: no hay shell estático que validar.
export const instant = false;

export const metadata: Metadata = { title: "Perfil de la organización" };

export default function Page() {
  return <ProfileEditor />;
}
