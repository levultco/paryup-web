import { Header } from "@/screens/header";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import BottomBlur from "@/components/BottomBlur";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <Features />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>
      {/* Desenfoque progresivo fijo en el borde de abajo de toda la pantalla */}
      <BottomBlur />
    </>
  );
}
