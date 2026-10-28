import type { Metadata } from "next";
import { Suspense } from "react";
import { LegalView } from "@/components/legal/LegalView";
import { Header } from "@/screens/header";

export const metadata: Metadata = { title: "Política de cookies" };

export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main>
        <LegalView id="cookies" />
      </main>
    </>
  );
}
