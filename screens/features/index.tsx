"use client";

import BounceInText from "@/components/common/bounceText";
import useIsMobile from "@/hooks/useIsMobile";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DiscoverFeatureCard } from "./components/DiscoverFeatureCard";
import { MessagingFeatureCard } from "./components/MessagingFeatureCard";
import { ProfileFeatureCard } from "./components/ProfileFeatureCard";
import { OneTapEntryFeatureCard } from "./components/OneTapEntryFeatureCard";
import { RecapAlbumsFeatureCard } from "./components/RecapAlbumsFeatureCard";
import { MatchesFeatureCard } from "./components/MatchesFeatureCard";

const viewport = { once: false, amount: 0.3 };
const revealTransition = {
  duration: 0.72,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function FeatureScreen() {
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  const enableRevealAnimation = hasMounted && !isMobile;
  const showBounceText = hasMounted && !isMobile;

  return (
    <section className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-20">
        <h1
          className="pointer-events-none  z-20 text-center font-semibold leading-none tracking-normal text-white"
          style={{
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            color: "#fff",
            fontSize: "clamp(2.2rem, 7vw, 6.5rem)",
          }}
        >
          <div className="flex flex-col items-center justify-center">
            {showBounceText ? (
              <>
                <BounceInText
                  as="span"
                  text="Todo en una app"
                  triggerOnView
                  once={false}
                  className="block  leading-[1.1] text-white"
                />
                <BounceInText
                  as="span"
                  text="para tu noche"
                  triggerOnView
                  once={false}
                  delay={0.2}
                  className="block  leading-[1.1] text-white"
                />
              </>
            ) : (
              <>
                <span className="block leading-[1.1] text-white">Todo en una app</span>
                <span className="block leading-[1.1] text-white">para tu noche</span>
              </>
            )}
            <motion.p
              initial={enableRevealAnimation ? { y: 34, scale: 0.8 } : false}
              whileInView={
                enableRevealAnimation ? { y: 0, scale: 1 } : undefined
              }
              viewport={enableRevealAnimation ? viewport : undefined}
              transition={
                enableRevealAnimation
                  ? { ...revealTransition, delay: 0.08 }
                  : undefined
              }
              className="mx-auto mt-4 max-w-[680px] text-pretty text-sm leading-relaxed text-white/65 md:text-lg"
            >
              Mapa, entradas, chat, matches, perfil y recap en un solo sitio.
            </motion.p>
          </div>
        </h1>
        <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-2">
          <motion.div
            className="lg:col-span-2"
            animate={
              enableRevealAnimation ? undefined : { y: 0, rotate: 0, scale: 1 }
            }
            initial={
              enableRevealAnimation
                ? { y: 64, rotate: -2.5, scale: 0.8 }
                : false
            }
            whileInView={
              enableRevealAnimation ? { y: 0, rotate: 0, scale: 1 } : undefined
            }
            viewport={enableRevealAnimation ? viewport : undefined}
            transition={enableRevealAnimation ? revealTransition : undefined}
          >
            <DiscoverFeatureCard />
          </motion.div>
          <motion.div
            className="lg:col-span-2"
            animate={
              enableRevealAnimation
                ? undefined
                : { x: 0, y: 0, rotate: 0, scale: 1 }
            }
            initial={
              enableRevealAnimation
                ? {
                    y: 68,
                    x: 20,
                    rotate: 3.5,
                    scale: 0.8,
                  }
                : false
            }
            whileInView={
              enableRevealAnimation
                ? {
                    y: 0,
                    x: 0,
                    rotate: 0,
                    scale: 1,
                  }
                : undefined
            }
            viewport={enableRevealAnimation ? viewport : undefined}
            transition={
              enableRevealAnimation
                ? { ...revealTransition, delay: 0.12 }
                : undefined
            }
          >
            <OneTapEntryFeatureCard />
          </motion.div>
        </div>

        <div className="space-y-10 md:space-y-12">
          {/* <div className="mx-auto max-w-[760px] text-center"> */}
          <h1
            className="pointer-events-none  z-20 text-center font-semibold leading-none tracking-normal text-white"
            style={{
              fontWeight: 600,
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              color: "#fff",
              fontSize: "clamp(2.2rem, 7vw, 6.5rem)",
            }}
          >
            <div className="flex flex-col items-center justify-center">
              {showBounceText ? (
                <>
                  <BounceInText
                    as="span"
                    text="Lo que pasa"
                    triggerOnView
                    once={false}
                    className="block  leading-[1.1] text-white"
                  />
                  <BounceInText
                    as="span"
                    text="después de la entrada"
                    triggerOnView
                    once={false}
                    delay={0.2}
                    className="block  leading-[1.1] text-white"
                  />
                </>
              ) : (
                <>
                  <span className="block leading-[1.1] text-white">Lo que pasa</span>
                  <span className="block leading-[1.1] text-white">después de la entrada</span>
                </>
              )}
              <motion.p
                initial={enableRevealAnimation ? { y: 34, scale: 0.8 } : false}
                whileInView={
                  enableRevealAnimation ? { y: 0, scale: 1 } : undefined
                }
                viewport={enableRevealAnimation ? viewport : undefined}
                transition={
                  enableRevealAnimation
                    ? { ...revealTransition, delay: 0.08 }
                    : undefined
                }
                className="mx-auto mt-4 max-w-[680px] text-pretty text-sm leading-relaxed text-white/65 md:text-lg"
              >
                ParyUp no termina cuando compras la entrada. Chatea con tu gente,
                haz match con quienes conoces en el evento y guarda cada fiesta
                en tu perfil.
              </motion.p>
            </div>
          </h1>
          {/* </div> */}

          <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-12 lg:auto-rows-[310px]">
            <motion.div
              className="min-h-[420px] md:min-h-[460px] lg:min-h-0 lg:col-span-3 lg:row-span-1"
              animate={
                enableRevealAnimation
                  ? undefined
                  : { x: 0, y: 0, rotate: 0, scale: 1 }
              }
              initial={
                enableRevealAnimation
                  ? {
                      y: 54,
                      x: -18,
                      rotate: -4,
                      scale: 0.8,
                    }
                  : false
              }
              whileInView={
                enableRevealAnimation
                  ? {
                      y: 0,
                      x: 0,
                      rotate: 0,
                      scale: 1,
                    }
                  : undefined
              }
              viewport={enableRevealAnimation ? viewport : undefined}
              transition={enableRevealAnimation ? revealTransition : undefined}
            >
              <MatchesFeatureCard />
            </motion.div>
            <motion.div
              className="min-h-[440px] md:min-h-[480px] lg:min-h-0 lg:col-span-5 lg:row-span-1"
              animate={
                enableRevealAnimation
                  ? undefined
                  : { x: 0, y: 0, rotate: 0, scale: 1 }
              }
              initial={
                enableRevealAnimation
                  ? {
                      y: 60,
                      x: 28,
                      rotate: 2.5,
                      scale: 0.8,
                    }
                  : false
              }
              whileInView={
                enableRevealAnimation
                  ? {
                      y: 0,
                      x: 0,
                      rotate: 0,
                      scale: 1,
                    }
                  : undefined
              }
              viewport={enableRevealAnimation ? viewport : undefined}
              transition={
                enableRevealAnimation
                  ? { ...revealTransition, delay: 0.05 }
                  : undefined
              }
            >
              <MessagingFeatureCard />
            </motion.div>
            <motion.div
              className="min-h-[520px] md:min-h-[620px] lg:min-h-0 lg:col-span-4 lg:row-span-2"
              animate={
                enableRevealAnimation
                  ? undefined
                  : { y: 0, rotate: 0, scale: 1 }
              }
              initial={
                enableRevealAnimation
                  ? { y: 82, scale: 0.8, rotate: 2.5 }
                  : false
              }
              whileInView={
                enableRevealAnimation
                  ? { y: 0, scale: 1, rotate: 0 }
                  : undefined
              }
              viewport={enableRevealAnimation ? viewport : undefined}
              transition={
                enableRevealAnimation
                  ? { ...revealTransition, delay: 0.08 }
                  : undefined
              }
            >
              <RecapAlbumsFeatureCard />
            </motion.div>
            <motion.div
              className="min-h-[420px] md:min-h-[460px] lg:min-h-0 lg:col-span-8 lg:row-span-1"
              animate={
                enableRevealAnimation
                  ? undefined
                  : { x: 0, y: 0, rotate: 0, scale: 1 }
              }
              initial={
                enableRevealAnimation
                  ? {
                      y: 58,
                      x: -20,
                      rotate: -2.5,
                      scale: 0.8,
                    }
                  : false
              }
              whileInView={
                enableRevealAnimation
                  ? {
                      y: 0,
                      x: 0,
                      rotate: 0,
                      scale: 1,
                    }
                  : undefined
              }
              viewport={enableRevealAnimation ? viewport : undefined}
              transition={
                enableRevealAnimation
                  ? { ...revealTransition, delay: 0.1 }
                  : undefined
              }
            >
              <ProfileFeatureCard />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
