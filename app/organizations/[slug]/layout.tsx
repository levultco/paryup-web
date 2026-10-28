import { Suspense } from "react";
import type { ReactNode } from "react";
import { Header } from "@/screens/header";
import { OrgShell } from "@/components/organizations/OrgShell";

// Panel con sesión y datos cargados en cliente: no hay shell estático que validar.
export const instant = false;

export const metadata = {
  title: "Panel de organización",
  robots: { index: false },
};

// `params` es dato de runtime: se lee dentro de Suspense para no bloquear el prerender.
async function Shell({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}) {
  const { slug } = await params;
  return <OrgShell slug={slug}>{children}</OrgShell>;
}

export default function OrganizationLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto w-full max-w-[1400px] px-[clamp(1.25rem,3vw,3.5rem)] pb-28 pt-28 md:pt-36">
        <Suspense fallback={null}>
          <Shell params={params}>{children}</Shell>
        </Suspense>
      </main>
    </>
  );
}
