import { Header } from "@/screens/header";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Features from "@/components/Features";
import Posters from "@/components/Posters";
import Faq from "@/components/Faq";
import ClubsCta from "@/components/ClubsCta";
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
        <Posters />
        <ClubsCta />
        <Faq />
        <FinalCta />
      </main>
      {/* Desenfoque progresivo fijo en el borde de abajo de toda la pantalla */}
      <BottomBlur />
    </>
  );
}
