"use client";

import { AppStoreButton, PlayStoreButton } from "@/components/common/store";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import "./home.css";

// Cinco fotos de noche en abanico: la del centro es la mayor y las demás se
// inclinan hacia fuera y quedan detrás.
const CARDS = [
  {
    src: "/home/cards/noche-1.webp",
    alt: "Chica de pelo rojo bailando en un club",
    o: -2,
  },
  {
    src: "/home/cards/noche-2.webp",
    alt: "Gente bailando entre luces naranjas",
    o: -1,
  },
  {
    src: "/home/cards/noche-3.webp",
    alt: "Chica riéndose en una fiesta",
    o: 0,
  },
  {
    src: "/home/cards/noche-4.webp",
    alt: "Pareja bailando bajo bolas de espejos",
    o: 1,
  },
  {
    src: "/home/cards/noche-5.webp",
    alt: "Amigas haciéndose un selfie en la pista",
    o: 2,
  },
] as const;

export default function FanHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  // Al bajar, cada capa sube a distinta velocidad: la profundidad sale del scroll.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const objectsY = useTransform(scrollYProgress, [0, 1], [0, -150]);

  // Las animaciones infinitas se pausan cuando la portada sale de pantalla.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(([entry]) => {
      frame.toggleAttribute("data-off", !entry.isIntersecting);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="inicio" className="hh-hero">
      <div ref={frameRef} className="hh-frame">
        {/* Esquina de una sala en perspectiva: dos paredes de rejilla. */}
        <div className="hh-glow" aria-hidden />

        <motion.div style={{ y: copyY }} className="hh-copy">
          <h1 className="hh-title">
            <span className="hh-line hh-rise">Toda tu noche.</span>
            <span
              className="hh-line hh-rise"
              style={{ "--d": "90ms" } as CSSProperties}
            >
              Sin dar vueltas.
            </span>
          </h1>
          <p
            className="hh-sub hh-rise"
            style={{ "--d": "220ms" } as CSSProperties}
          >
            Compra y vende entradas, chatea con tu gente, haz match en los
            eventos y revive cada noche.
          </p>
          <div
            className="hh-actions hh-rise"
            style={{ "--d": "320ms" } as CSSProperties}
          >
            <AppStoreButton className="px-3 sm:px-8" />
            <PlayStoreButton className="px-3 sm:px-8" />
          </div>
        </motion.div>

        <motion.div style={{ y: objectsY }} className="hh-layer" aria-hidden>
          <div className="hh-layer">
            <Image
              src="/home/objects/ticket-color.webp"
              alt=""
              width={760}
              height={298}
              sizes="(max-width: 767px) 120px, 15vw"
              className="hh-object hh-object-color"
              priority
            />
            <Image
              src="/home/objects/ticket-holo.webp"
              alt=""
              width={560}
              height={479}
              sizes="(max-width: 767px) 90px, 11vw"
              className="hh-object hh-object-holo"
              priority
            />
          </div>
        </motion.div>

        <div className="hh-layer hh-layer-fan">
          <div className="hh-layer">
            <div
              className="hh-fan"
              role="group"
              aria-label="Próximos eventos en ParyUp"
            >
              {CARDS.map((card) => (
                <div
                  key={card.src}
                  className="hh-card"
                  data-o={card.o}
                  style={
                    {
                      "--o": card.o,
                      "--abs": Math.abs(card.o),
                      "--d": `${700 + Math.abs(card.o) * 110}ms`,
                    } as CSSProperties
                  }
                >
                  <span className="hh-card-rise">
                    <span className="hh-card-face">
                      <Image
                        src={card.src}
                        alt={card.alt}
                        width={640}
                        height={800}
                        sizes="(max-width: 767px) 74vw, 27vw"
                        quality={75}
                        priority={card.o === 0}
                      />
                      <span className="hh-card-shade" />
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
