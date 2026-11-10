import type { Metadata } from "next";
import { Suspense } from "react";
import { ActivationView } from "@/components/backstage/ActivationView";

export const metadata: Metadata = {
  title: "Activar Backstage",
  robots: { index: false },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ActivationView />
    </Suspense>
  );
}
