import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/screens/header";
import { OrganizationsHub } from "@/components/organizations/OrganizationsHub";

export const metadata: Metadata = { title: "Organizaciones" };

export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto w-full max-w-[1800px] px-[clamp(1.25rem,3vw,3.5rem)] pb-28 pt-32 md:pt-40">
        <Suspense fallback={null}>
          <OrganizationsHub />
        </Suspense>
      </main>
    </>
  );
}
