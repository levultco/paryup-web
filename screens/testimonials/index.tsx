"use client";

import useIsMobile from "@/hooks/useIsMobile";
import React from "react";
import { motion } from "framer-motion";
import BounceInText from "@/components/common/bounceText";
import { useEffect, useState } from "react";

// --- Types ---
interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

// --- Data ---
const testimonials: Testimonial[] = [
  {
    text: "Con el mapa veo qué hay cerca y decido en dos minutos. Compro la entrada y listo.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Laura Gómez",
    role: "Universitaria",
  },
  {
    text: "Los grupos y los mensajes directos me ahorran mil chats. Todo el plan está en la app.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Carlos Ruiz",
    role: "Freelance",
  },
  {
    text: "He descubierto sitios nuevos solo mirando el mapa de eventos.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Marta Sánchez",
    role: "Marketing",
  },
  {
    text: "Hice match con gente que conocí en el evento y seguimos hablando.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Álvaro Torres",
    role: "Emprendedor",
  },
  {
    text: "Me encanta ver en mi perfil todas las fiestas a las que he ido.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Lucía Navarro",
    role: "Diseñadora",
  },
  {
    text: "Una vez no pude ir y vendí mi entrada desde la app sin complicaciones.",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Javier Martín",
    role: "Ingeniero",
  },
  {
    text: "El recap del día es lo mejor: vuelvo a ver cómo fue la noche.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Sergio Vidal",
    role: "Fotógrafo",
  },
  {
    text: "Seguir a la gente que conozco en las fiestas hace que salir sea más social.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Andrea López",
    role: "Estudiante",
  },
  {
    text: "Compro la entrada, quedo con mi grupo y entro con el QR. No vuelvo a salir sin esto.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Diego Herrera",
    role: "Consultor",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const MobileTestimonialsSection = () => {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative w-full overflow-hidden bg-transparent py-4"
    >
      <div className="container z-10 mx-auto px-4">
        <div className="mx-auto mb-16 flex w-full flex-col items-center justify-center">
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
              <span className="block leading-[1.1] text-white">No es la app.</span>
              <span className="block leading-[1.1] text-white">Es la gente.</span>
              <p className="mx-auto mt-4 max-w-[680px] text-pretty text-sm leading-relaxed text-white/65 md:text-lg">
                Y todo lo que pasa cuando chateas, haces match y compartes la noche.
              </p>
            </div>
          </h1>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-[28rem]">
            <TestimonialsColumn testimonials={testimonials} disableMotion />
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Sub-Components ---
const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
  disableMotion?: boolean;
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={props.disableMotion ? undefined : { translateY: "-50%" }}
        transition={
          props.disableMotion
            ? undefined
            : {
                duration: props.duration || 10,
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop",
              }
        }
        className="flex flex-col gap-6 pb-6 bg-transparent transition-colors duration-300 list-none m-0 p-0"
      >
        {[
          ...new Array(props.disableMotion ? 1 : 2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name }, i) => (
                <motion.li
                  key={`${index}-${i}`}
                  aria-hidden={index === 1 ? "true" : "false"}
                  tabIndex={index === 1 ? -1 : 0}
                   whileHover={
                     props.disableMotion
                       ? undefined
                       : {
                           scale: 1.03,
                           y: -8,
                           boxShadow:
                             "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                           transition: {
                             type: "spring",
                             stiffness: 400,
                             damping: 17,
                           },
                         }
                   }
                   whileFocus={
                     props.disableMotion
                       ? undefined
                       : {
                           scale: 1.03,
                           y: -8,
                           boxShadow:
                             "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                           transition: {
                             type: "spring",
                             stiffness: 400,
                             damping: 17,
                           },
                         }
                   }
                  className="p-10 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-lg shadow-black/5  w-full bg-white dark:bg-neutral-900 transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <blockquote className="m-0 p-0">
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal m-0 transition-colors duration-300">
                      {text}
                    </p>
                    <footer className="flex items-center gap-3 mt-6">
                      <img
                        width={40}
                        height={40}
                        src={image}
                        alt={`Avatar of ${name}`}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-800 group-hover:ring-primary/30 transition-all duration-300 ease-in-out"
                      />
                      <div className="flex flex-col">
                        <cite className="font-semibold not-italic tracking-tight leading-5 text-neutral-900 dark:text-white transition-colors duration-300">
                          {name}
                        </cite>
                        {/* <span className="text-sm leading-5 tracking-tight text-neutral-500 dark:text-neutral-500 mt-0.5 transition-colors duration-300">
                          {role}
                        </span> */}
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

export const TestimonialsSection = () => {
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);
  const disableMotion = !hasMounted || isMobile;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (hasMounted && isMobile) {
    return <MobileTestimonialsSection />;
  }

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="bg-transparent py-4 relative overflow-hidden w-full"
    >
      <div className="container px-4 z-10 mx-auto">
        <div className="flex flex-col items-center justify-center w-full mx-auto mb-16">
          {/* <div className="flex justify-center w-full">
            <div className="border border-neutral-300 dark:border-neutral-700 py-1 px-4 rounded-full text-xs font-semibold tracking-wide uppercase text-neutral-600 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/50 transition-colors">
              Testimonials
            </div>
          </div> */}

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
              {disableMotion ? (
                <>
                  <span className="block leading-[1.1] text-white">
                    No es la app.
                  </span>
                  <span className="block leading-[1.1] text-white">
                    Es la gente.
                  </span>
                </>
              ) : (
                <>
                  <BounceInText
                    as="span"
                    text="No es la app."
                    triggerOnView
                    once={false}
                    className="block leading-[1.1] text-white"
                  />
                  <BounceInText
                    as="span"
                    text="Es la gente."
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
                  disableMotion ? false : { y: 34, scale: 0.8, filter: "blur(10px)" }
                }
                whileInView={
                  disableMotion
                    ? undefined
                    : { y: 0, scale: 1, filter: "blur(0px)" }
                }
                viewport={disableMotion ? undefined : { once: false, amount: 0.4 }}
                transition={
                  disableMotion
                    ? undefined
                    : { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }
                }
                className="mx-auto mt-4 max-w-[680px] text-pretty text-sm leading-relaxed text-white/65 md:text-lg"
              >
                Y todo lo que pasa cuando chateas, haces match y compartes la noche.
              </motion.p>
            </div>
          </h1>
        </div>

        <div
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden w-full "
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <motion.div
            animate={
              disableMotion
                ? { y: 0, x: 0, rotate: 0, scale: 1, clipPath: "inset(0% 0 0% 0 round 28px)" }
                : undefined
            }
            initial={
              disableMotion
                ? false
                : {
                    y: 86,
                    x: -18,
                    rotate: -3.5,
                    scale: 0.8,
                    clipPath: "inset(16% 0 16% 0 round 28px)",
                    filter: "blur(10px)",
                  }
            }
            whileInView={
              disableMotion
                ? undefined
                : {
                    y: 0,
                    x: 0,
                    rotate: 0,
                    scale: 1,
                    clipPath: "inset(0% 0 0% 0 round 28px)",
                    filter: "blur(0px)",
                  }
            }
            viewport={disableMotion ? undefined : { once: false, amount: 0.22 }}
            transition={
              disableMotion
                ? undefined
                : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <TestimonialsColumn
              testimonials={firstColumn}
              duration={15}
              disableMotion={disableMotion}
            />
          </motion.div>
          <motion.div
            animate={
              disableMotion
                ? { y: 0, scale: 1, clipPath: "inset(0% 0 0% 0 round 28px)" }
                : undefined
            }
            initial={
              disableMotion
                ? false
                : {
                    y: 68,
                    scale: 0.8,
                    clipPath: "inset(14% 0 14% 0 round 28px)",
                    filter: "blur(10px)",
                  }
            }
            whileInView={
              disableMotion
                ? undefined
                : {
                    y: 0,
                    scale: 1,
                    clipPath: "inset(0% 0 0% 0 round 28px)",
                    filter: "blur(0px)",
                  }
            }
            viewport={disableMotion ? undefined : { once: false, amount: 0.22 }}
            transition={
              disableMotion
                ? undefined
                : { duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: 0.06 }
            }
            className="hidden md:block"
          >
            <TestimonialsColumn
              testimonials={secondColumn}
              duration={19}
              disableMotion={disableMotion}
            />
          </motion.div>
          <motion.div
            animate={
              disableMotion
                ? { y: 0, x: 0, rotate: 0, scale: 1, clipPath: "inset(0% 0 0% 0 round 28px)" }
                : undefined
            }
            initial={
              disableMotion
                ? false
                : {
                    y: 86,
                    x: 18,
                    rotate: 3.5,
                    scale: 0.8,
                    clipPath: "inset(16% 0 16% 0 round 28px)",
                    filter: "blur(10px)",
                  }
            }
            whileInView={
              disableMotion
                ? undefined
                : {
                    y: 0,
                    x: 0,
                    rotate: 0,
                    scale: 1,
                    clipPath: "inset(0% 0 0% 0 round 28px)",
                    filter: "blur(0px)",
                  }
            }
            viewport={disableMotion ? undefined : { once: false, amount: 0.22 }}
            transition={
              disableMotion
                ? undefined
                : { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }
            }
            className="hidden lg:block"
          >
            <TestimonialsColumn
              testimonials={thirdColumn}
              duration={17}
              disableMotion={disableMotion}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
