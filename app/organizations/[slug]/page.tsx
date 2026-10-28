import { Suspense } from "react";
import { OverviewView } from "@/components/organizations/OverviewView";

// Panel con sesión y datos cargados en cliente: no hay shell estático que validar.
export const instant = false;

export default function OverviewPage() {
  return (
    <Suspense fallback={null}>
      <OverviewView />
    </Suspense>
  );
}
