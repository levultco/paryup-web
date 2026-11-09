import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/screens/header";
import { backendFetch } from "@/lib/backend";
import { sessionToken } from "@/lib/organizations-server";
import { FourvenuesAdminView } from "@/components/admin/FourvenuesAdminView";

// Lee la sesión en cada petición: no hay shell estático que validar.
export const instant = false;

export const metadata: Metadata = {
  title: "Vinculaciones Fourvenues",
  robots: { index: false },
};

/** Solo administradores de ParyUp; al resto la ruta no existe. El backend lo vuelve a exigir. */
async function AdminGate() {
  // Fuerza render en petición: la vista cliente usa Date.now() (framer-motion).
  await connection();
  const token = await sessionToken();
  if (!token) redirect("/login");
  const res = await backendFetch("/authz/bootstrap", { token }).catch(
    () => null,
  );
  if (res?.status === 401) redirect("/login");
  const data = res?.ok ? await res.json().catch(() => null) : null;
  if (data?.user?.globalRole !== "ADMIN") notFound();
  return <FourvenuesAdminView />;
}

export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto w-full max-w-[1100px] px-[clamp(1.25rem,3vw,3.5rem)] pb-28 pt-28 md:pt-36">
        <Suspense fallback={null}>
          <AdminGate />
        </Suspense>
      </main>
    </>
  );
}
