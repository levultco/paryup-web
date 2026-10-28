import type { Metadata } from "next";
import { Suspense } from "react";
import NotFoundView from "@/components/NotFoundView";
import { Header } from "@/screens/header";

export const metadata: Metadata = { title: "404" };

export default function NotFound() {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <NotFoundView />
    </>
  );
}
