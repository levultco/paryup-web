"use client";

import AnimatedGradientBackground from "@/components/common/gradientBackground";
import Floating, {
  FloatingElement,
} from "@/components/common/parallaxFloating";
import { MoonIcon, StarOIcon } from "@/public/icons/icons";
import { motion } from "framer-motion";

export const HomeScreen = () => {
  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 bottom-0 ">
        <AnimatedGradientBackground
          type="ocean"
          containerClassName="rotate-180 opacity-60"
        />
      </div>
      <div className="absolute inset-0 z-1 bg-black/0 backdrop-blur-3xl" />

      {/* <div className="pointer-events-none absolute inset-0 z-2 hidden md:block">
        <Floating sensitivity={1.05} easingFactor={0.04}>
          {heroCards.map((card, index) => (
            <FloatingElement
              key={card.title}
              depth={0.72 + index * 0.2}
              className={cardPosition[index]}
            >
              <ProductProofCard card={card} />
            </FloatingElement>
          ))}
        </Floating>
      </div> */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 text-center"
      >
        <h1
          style={{
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: 1.06,
            color: "#fff",
            fontSize: "clamp(3.2rem, 7vw, 6.5rem)",
          }}
        >
          <span
            style={{
              backgroundImage:
                "linear-gradient(90deg, #999999 0%, #878787 50%, #999999 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "block",
              lineHeight: 1.1,
              marginBottom: "-0.12em",
            }}
          >
            Llena todo tu club
          </span>
          <span
            className="flex flex-wrap items-center justify-center gap-3 "
            style={{ color: "#fff" }}
          >
            <span className="block text-white">cada</span>
            <StarOIcon className="size-10" />
            <span className="block text-white">finde</span>
          </span>
        </h1>

        <p
          className="mt-4 max-w-xl px-2 text-center"
          style={{
            fontSize: "clamp(0.95rem, 2.2vw, 1.2rem)",
            color: "#888",
            lineHeight: 1.4,
            fontWeight: 400,
          }}
        >
          Eventos, accesos, equipo y datos conectados para que tu club funcione
          sin friccion.
        </p>

        <button
          type="button"
          className="mt-6 rounded-3xl bg-white px-6 py-3 text-lg font-semibold text-black transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
        >
          Dar de alta mi club
        </button>
      </motion.div>

      <div className="hero-down-m-mask absolute bottom-0 left-0 z-2 w-full" />
    </section>
  );
};
