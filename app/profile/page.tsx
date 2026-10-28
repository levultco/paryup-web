import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/screens/header";
import { ProfileView } from "@/components/profile/ProfileView";

export const metadata: Metadata = { title: "Mi perfil" };

export default function ProfilePage() {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main>
        <ProfileView />
      </main>
    </>
  );
}
