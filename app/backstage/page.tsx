import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/screens/header";
import SmoothScroll from "@/components/SmoothScroll";
import BackstageLanding from "@/components/BackstageLanding";
import BottomBlur from "@/components/BottomBlur";

export const metadata: Metadata = {
  title: "Backstage",
  description:
    "ParyUp Backstage: eventos, entradas, equipo y promotores de tu sala, todo desde un mismo lugar.",
};

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <BackstageLanding />
      <BottomBlur />
    </>
  );
}
