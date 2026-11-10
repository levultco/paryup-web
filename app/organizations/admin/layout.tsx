import { Suspense } from "react";
import { Header } from "@/screens/header";
import { AdminNav } from "@/components/admin/AdminNav";

/** Layout compartido: las pestañas permanecen montadas al cambiar de sección. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="mx-auto w-full max-w-[1100px] px-[clamp(1.25rem,3vw,3.5rem)] pb-28 pt-28 md:pt-36">
        <Suspense fallback={null}>
          <AdminNav />
        </Suspense>
        {children}
      </main>
    </>
  );
}
