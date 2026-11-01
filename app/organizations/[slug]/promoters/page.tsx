import type { Metadata } from "next";
import { PromotersView } from "@/components/organizations/PromotersView";

// Panel con sesión y datos cargados en cliente: no hay shell estático que validar.
export const instant = false;

export const metadata: Metadata = { title: "Promotores" };

export default function Page() {
  return <PromotersView />;
}
