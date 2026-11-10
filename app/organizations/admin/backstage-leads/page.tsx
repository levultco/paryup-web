import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { backendFetch } from "@/lib/backend";
import { sessionToken } from "@/lib/organizations-server";
import { BackstageLeadsView } from "@/components/admin/BackstageLeadsView";

// Lee la sesión en cada petición: no hay shell estático que validar.
export const instant = false;

export const metadata: Metadata = {
  title: "Solicitudes de Backstage",
  robots: { index: false },
};

/** Solo administradores de ParyUp; al resto la ruta no existe. El backend lo vuelve a exigir. */
async function AdminGate() {
  await connection();
  const token = await sessionToken();
  if (!token) redirect("/login");
  const res = await backendFetch("/authz/bootstrap", { token }).catch(
    () => null,
  );
  if (res?.status === 401) redirect("/login");
  const data = res?.ok ? await res.json().catch(() => null) : null;
  if (data?.user?.globalRole !== "ADMIN") notFound();
  return <BackstageLeadsView />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminGate />
    </Suspense>
  );
}
