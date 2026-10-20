"use client";

import useIsMobile from "@/hooks/useIsMobile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import BounceInText from "@/components/common/bounceText";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type FaqItem = {
  value: string;
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    value: "item-1",
    question: "¿Qué es ParyUp?",
    answer:
      "ParyUp es una app para comprar y vender entradas, chatear con tu gente, hacer match con quienes conoces en los eventos y revivir cada noche en tu perfil.",
  },
  {
    value: "item-2",
    question: "¿Cómo encuentro eventos?",
    answer:
      "Abre el mapa para previsualizar los eventos de tu zona y entrar al detalle de cada uno antes de comprar la entrada.",
  },
  {
    value: "item-3",
    question: "¿Puedo hablar con mis amigos?",
    answer:
      "Sí. Tienes chats de grupo y mensajes directos dentro de la app, además de matches con las personas que te cruzas en cada evento.",
  },
  {
    value: "item-4",
    question: "¿Puedo vender mi entrada?",
    answer:
      "Sí. Si no puedes ir a un evento, puedes poner tu entrada a la venta desde la app.",
  },
  {
    value: "item-5",
    question: "¿Qué veo en mi perfil?",
    answer:
      "Las fiestas a las que has asistido, las personas que sigues y las que te siguen.",
  },
];

const MobileFaqsScreen = () => {
  return (
    <section className="relative z-10 mx-auto w-full bg-background py-16 md:py-20">
      <div className="container mx-auto w-full rounded-4xl p-6 sm:p-8 md:p-10">
        <div className="mx-auto text-center">
          <h1
            id="testimonials-heading"
            className="pointer-events-none z-20 mt-6 text-center font-semibold leading-none tracking-normal text-white"
            style={{
              fontWeight: 600,
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              color: "#fff",
              fontSize: "clamp(2.2rem, 7vw, 6.5rem)",
            }}
          >
            <div className="flex flex-col items-center justify-center">
              <span className="block leading-[1.1] text-white">Resolvemos</span>
              <span className="block leading-[1.1] text-white">tus dudas</span>
              <p className="mx-auto mt-4 max-w-[680px] text-pretty text-sm leading-relaxed text-white/65 md:text-lg">
                Todo lo importante para entender cómo funciona ParyUp antes de
                salir.
              </p>
            </div>
          </h1>
        </div>

        <div className="mt-8 md:mt-10">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="border-b border-white/12"
              >
                <div>
                  <AccordionTrigger className="py-5 text-base font-semibold text-white hover:no-underline md:text-lg">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-white/68 md:text-base">
                    {item.answer}
                  </AccordionContent>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export const FaqsScreen = () => {
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);
  const disableMotion = !hasMounted || isMobile;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (hasMounted && isMobile) {
    return <MobileFaqsScreen />;
  }

  return (
    <section className="relative z-10 mx-auto w-full  py-16  md:py-20 bg-background">
      <motion.div
        animate={disableMotion ? { y: 0, scale: 1, rotateX: 0 } : undefined}
        initial={
          disableMotion
            ? false
            : { y: 40, scale: 0.8, rotateX: 10, filter: "blur(10px)" }
        }
        whileInView={
          disableMotion
            ? undefined
            : { y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" }
        }
        viewport={disableMotion ? undefined : { once: false, amount: 0.2 }}
        transition={
          disableMotion
            ? undefined
            : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
        }
        className="container mx-auto w-full  rounded-4xl  p-6 backdrop-blur-xl sm:p-8 md:p-10"
      >
        <div className="mx-auto  text-center">
          <h1
            className="pointer-events-none z-20 text-center font-semibold leading-none tracking-normal text-white"
            style={{
              fontWeight: 600,
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              color: "#fff",
              fontSize: "clamp(2.2rem, 7vw, 6.5rem)",
            }}
          >
            <div className="flex flex-col items-center justify-center">
              {disableMotion ? (
                <>
                  <span className="block leading-[1.1] text-white">
                    Resolvemos
                  </span>
                  <span className="block leading-[1.1] text-white">
                    tus dudas
                  </span>
                </>
              ) : (
                <>
                  <BounceInText
                    as="span"
                    text="Resolvemos"
                    triggerOnView
                    once={false}
                    className="block leading-[1.1] text-white"
                  />
                  <BounceInText
                    as="span"
                    text="tus dudas"
                    triggerOnView
                    once={false}
                    delay={0.2}
                    className="block leading-[1.1] text-white"
                  />
                </>
              )}
                <motion.p
                  animate={disableMotion ? { y: 0, scale: 1 } : undefined}
                  initial={
                    disableMotion
                      ? false
                      : { y: 32, scale: 0.8, filter: "blur(10px)" }
                  }
                  whileInView={
                    disableMotion
                      ? undefined
                      : { y: 0, scale: 1, filter: "blur(0px)" }
                  }
                  viewport={disableMotion ? undefined : { once: false, amount: 0.45 }}
                  transition={
                    disableMotion
                      ? undefined
                      : {
                          duration: 0.62,
                          ease: [0.22, 1, 0.36, 1],
                          delay: 0.08,
                        }
                  }
                  className="mx-auto mt-4 max-w-[680px] text-pretty text-sm leading-relaxed text-white/65 md:text-lg"
                >
                  Todo lo importante para entender cómo funciona ParyUp antes de
                  salir.
                </motion.p>
              </div>
            </h1>
          </div>

        <div className="mt-8 md:mt-10">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="border-b border-white/12"
              >
                <motion.div
                  animate={disableMotion ? { x: 0, y: 0, scale: 1 } : undefined}
                  initial={
                    disableMotion
                      ? false
                      : {
                          x: index % 2 === 0 ? -22 : 22,
                          y: 18,
                          scale: 0.8,
                          filter: "blur(8px)",
                        }
                  }
                  whileInView={
                    disableMotion
                      ? undefined
                      : { x: 0, y: 0, scale: 1, filter: "blur(0px)" }
                  }
                  viewport={disableMotion ? undefined : { once: false, amount: 0.55 }}
                  transition={
                    disableMotion
                      ? undefined
                      : {
                          duration: 0.56,
                          ease: [0.22, 1, 0.36, 1],
                          delay: index * 0.05,
                        }
                  }
                >
                  <AccordionTrigger className="py-5 text-base font-semibold text-white hover:no-underline md:text-lg">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-white/68 md:text-base">
                    {item.answer}
                  </AccordionContent>
                </motion.div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.div>
    </section>
  );
};
