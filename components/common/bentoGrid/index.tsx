"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import PixelScanTextReveal from "../pixelScanTextReveal";
import { ItemUsers } from "./cicularGallery/constants";
import { useRef } from "react";
import { PhoneMock } from "../phone/mock";
import { ChatCard } from "./chat";
import { PlanCard } from "./Plan";
import { CircularGallery } from "./cicularGallery";

const CARD_STYLES = {
  hero: " radial-accent border border-white/8 shadow-[0_8px_24px_rgba(0,0,0,0.28)] rounded-[28px]",
  timeline:
    " radial-accent border border-white/6 shadow-[0_6px_18px_rgba(0,0,0,0.18)] rounded-[28px]",
  chat: " radial-accent border border-white/6 shadow-[0_6px_18px_rgba(0,0,0,0.18)] rounded-[26px]",
  subtle:
    " radial-accent border border-white/5 shadow-[0_6px_18px_rgba(0,0,0,0.18)] rounded-[26px]",
} as const;

const cardReveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45 },
} as const;

export const BentoGrid = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const titleScale = useTransform(scrollYProgress, [0, 1], [0.7, 1.5]);
  const bentoScale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);

  return (
    <section
      ref={sectionRef}
      className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-6 md:py-10 lg:px-8"
    >
      <motion.div
        className="mb-3 flex flex-col items-center justify-center md:mb-4"
        style={{ scale: titleScale }}
      >
        <PixelScanTextReveal
          text="Organiza, entra y conecta "
          className="text-center text-4xl font-bold text-white md:text-6xl z-10 pb-0"
          fontFamily="Satoshi, system-ui, sans-serif"
          fontSize={64}
          fontWeight={700}
          color="#ffffff"
          align="center"
          mode={0}
          layers={3}
          speed={0.75}
          delay={0}
          width={0.2}
          threshold={0.9}
        />

        <PixelScanTextReveal
          text="desde una sola app."
          className="text-center text-4xl font-bold text-white md:text-6xl z-10 pb-0"
          fontFamily="Satoshi, system-ui, sans-serif"
          fontSize={64}
          fontWeight={700}
          color="#ffffff"
          align="center"
          mode={0}
          layers={3}
          speed={0.75}
          delay={0.2}
          width={0.2}
          threshold={0.9}
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-3 md:h-[780px] md:grid-cols-[32fr_68fr] md:grid-rows-[52fr_48fr] md:gap-3.5"
        style={{ scale: bentoScale }}
      >
        <motion.article
          className={`relative overflow-hidden md:row-span-2 min-h-[110vh] ${CARD_STYLES.hero}`}
          {...cardReveal}
        >
          <div className="relative h-full px-6 pt-7 pb-0">
            <div className="relative z-20 max-w-[260px]">
              <h3 className="text-[34px] leading-[0.95] font-semibold tracking-[-0.03em] text-white">
                ¿No sabes
                <br />
                dónde ir
                <br />
                hoy?
              </h3>
              <p className="mt-3 max-w-[220px] text-[16px] leading-[1.4] text-white/55">
                Mira qué está pasando cerca y decide en segundos.
              </p>
            </div>

            <PhoneMock
              width={448}
              height={930}
              rotate={5}
              className="pointer-events-none !absolute -bottom-[300px] left-1/2 !w-[110%] !max-w-none -translate-x-[56%] !overflow-visible drop-shadow-[0_18px_30px_rgba(0,0,0,0.42)]"
            />
          </div>
        </motion.article>

        <motion.article
          className={`relative overflow-hidden ${CARD_STYLES.timeline}`}
          {...cardReveal}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="grid h-full grid-cols-[42%_58%] gap-6 px-8 py-8">
            <div className="flex h-full items-center">
              <div className="max-w-[360px]">
                <h3 className="max-w-[360px] text-[30px] leading-[1.02] font-semibold tracking-[-0.03em] text-white">
                  Tu noche, paso a paso
                </h3>
                <p className="mt-4 max-w-[340px] text-[17px] leading-[1.4] text-white/50">
                  Eventos, rutas y transporte en un solo lugar.
                </p>
              </div>
            </div>
            <div className="flex h-full items-center justify-end">
              <div className="h-[320px] w-full max-w-[420px]">
                <PlanCard className="h-full w-full" />
              </div>
            </div>
          </div>
        </motion.article>

        <div className="grid h-full grid-cols-1 gap-3.5 md:grid-cols-2">
          <motion.article
            className={`relative overflow-hidden ${CARD_STYLES.chat}`}
            {...cardReveal}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div className="flex h-full flex-col px-6 pt-5 pb-5">
              <div className="min-h-0 flex-1">
                <ChatCard />
              </div>

              <div className="mt-6">
                <h3 className="max-w-[320px] text-[22px] leading-[1.05] font-semibold tracking-[-0.02em] text-white">
                  Habla y decide en el momento
                </h3>
                <p className="mt-3 max-w-[310px] text-[16px] leading-[1.45] text-white/50">
                  Coordina el plan con tu grupo, por directo o con tu discoteca.
                </p>
              </div>
            </div>
          </motion.article>

          <div className="grid h-full grid-rows-2 gap-3.5">
            <motion.article
              className={`relative overflow-hidden ${CARD_STYLES.subtle}`}
              {...cardReveal}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              <div className="relative h-full px-6 py-6">
                <div className="relative z-20 max-w-[210px]">
                  <h3 className="max-w-[210px] text-[22px] leading-[1.02] font-semibold tracking-[-0.02em] text-white">
                    Tu círculo, tu espacio
                  </h3>
                  <p className="mt-3 max-w-[210px] text-[16px] leading-[1.4] text-white/50">
                    Comparte solo con quien tú quieras.
                  </p>
                </div>

                <div className="pointer-events-none absolute inset-0 -right-[90%] -rotate-90">
                  <CircularGallery orbitItems={ItemUsers}></CircularGallery>
                </div>
              </div>
            </motion.article>

            <motion.article
              className={`relative overflow-hidden min-h-[26vh] ${CARD_STYLES.subtle}`}
              {...cardReveal}
              transition={{ duration: 0.45, delay: 0.25 }}
            >
              <div className="relative h-full px-6 pt-6 pb-0">
                <div className="relative z-20">
                  <h3 className="text-[22px] leading-[1.05] font-semibold tracking-[-0.02em] text-white">
                    Revive la noche
                  </h3>
                  <p className="mt-3 max-w-[260px] text-[16px] leading-[1.4] text-white/50">
                    Fotos públicas y privadas de cada fiesta.
                  </p>
                </div>

                <div className="pointer-events-none absolute inset-x-3 bottom-0 h-[50%]">
                  <div className="relative h-full w-full overflow-hidden rounded-t-[18px] border border-white/8">
                    <Image
                      src="/album/image1.png"
                      alt="Fotos de la noche"
                      fill
                      sizes="(max-width: 768px) 100vw, 420px"
                      className="object-cover object-center"
                    />
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
