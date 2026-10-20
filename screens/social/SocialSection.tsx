"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import useIsMobile from "@/hooks/useIsMobile";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BounceInText from "@/components/common/bounceText";
import { cn } from "@/lib/utils";
import { GroupIcon } from "@/public/icons/icons";

const avatars = [
  {
    name: "Ana",
    image: "https://i.pravatar.cc/240?img=32",
  },
  {
    name: "Carlos",
    image: "https://i.pravatar.cc/240?img=12",
  },
  {
    name: "Marta",
    image: "https://i.pravatar.cc/240?img=5",
  },
  {
    name: "Diego",
    image: "https://i.pravatar.cc/240?img=15",
  },
];

const chips = [
  {
    text: "3 matches nuevos",
    className: "right-16 top-20 md:right-32 md:top-24",
    delay: 0.3,
    float: 5,
  },
  {
    text: "Neon Night · Sáb 10 oct",
    className: "left-16 top-[42%] md:left-28 md:top-[40%]",
    delay: 0.42,
    float: 7,
    icon: true,
  },
  {
    text: "Marta te ha seguido",
    className: "right-14 top-[52%] md:right-28 md:top-[48%]",
    delay: 0.54,
    float: 6,
    dotClassName: "bg-[#ebc034]",
  },
  {
    text: "Ana: ¿nos vemos fuera?",
    className: "bottom-20 left-[34%] md:bottom-20 md:left-[40%]",
    delay: 0.66,
    float: 4,
  },
];

function IntelligenceGlowRing({
  disableAnimation = false,
}: {
  disableAnimation?: boolean;
}) {
  return (
    <div
      className={cn(
        "social-glow pointer-events-none absolute -inset-20 -z-10 blur-md md:blur-2xl",
        !disableAnimation && "opacity-0",
      )}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(198,121,196,0.34) 16%, rgba(250,61,29,0.24) 32%, rgba(255,176,5,0.18) 46%, rgba(225,225,254,0.16) 58%, rgba(3,88,247,0.12) 68%, transparent 78%)",
          filter: "blur(26px)",
        }}
      />
      <div
        className="absolute inset-5 rounded-full opacity-80"
        style={{
          background:
            "conic-gradient(from 18deg, rgba(198,121,196,0.45), rgba(250,61,29,0.34), rgba(255,176,5,0.3), rgba(225,225,254,0.3), rgba(3,88,247,0.34), rgba(198,121,196,0.45))",
          filter: "blur(18px)",
          WebkitMaskImage:
            "radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 36%, rgba(0,0,0,0.38) 58%, transparent 78%)",
          maskImage:
            "radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 36%, rgba(0,0,0,0.38) 58%, transparent 78%)",
        }}
      />
      <div
        className="absolute inset-14 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.16), rgba(225,225,254,0.2) 22%, rgba(198,121,196,0.24) 36%, rgba(250,61,29,0.16) 52%, rgba(3,88,247,0.12) 66%, transparent 76%)",
          filter: "blur(14px)",
        }}
      />
    </div>
  );
}

type AvatarGroupProps = {
  className?: string;
  size?: "sm" | "lg";
  extraCount?: number;
  disableAnimation?: boolean;
};

export function AvatarGroup({
  className,
  size = "lg",
  extraCount = 12,
  disableAnimation = false,
}: AvatarGroupProps) {
  const avatarSize = size === "lg" ? "h-16 w-16 md:h-20 md:w-20" : "h-9 w-9";
  const overlap = size === "lg" ? "-space-x-5 md:-space-x-6" : "-space-x-3";
  const textSize = size === "lg" ? "text-xl md:text-2xl" : "text-sm";

  return (
    <div className={cn("flex items-center", overlap, className)}>
      {avatars.map((avatar, index) => (
        <div
          key={avatar.name}
          className={cn(
            "social-avatar relative shrink-0 rounded-full border-5 border-secondary/50",
            !disableAnimation && "opacity-0",
            avatarSize,
          )}
          style={{ zIndex: avatars.length - index }}
          aria-label={avatar.name}
        >
          <div
            className="absolute inset-0 bg-cover bg-center overflow-hidden rounded-full"
            style={{ backgroundImage: `url(${avatar.image})` }}
          />
          <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-secondary bg-[#44d68d] " />
        </div>
      ))}

      <div
        className={cn(
          "social-avatar relative flex shrink-0 items-center justify-center rounded-full border-5 border-secondary/50 bg-white/[0.11] text-white backdrop-blur-md",
          !disableAnimation && "opacity-0",
          avatarSize,
        )}
      >
        <span className={cn("font-bold tracking-normal", textSize)}>
          +{extraCount}
        </span>
      </div>
    </div>
  );
}

type SocialChipProps = {
  text: string;
  className?: string;
  float?: number;
  icon?: boolean;
  dotClassName?: string;
  disableAnimation?: boolean;
  staticLayout?: boolean;
};

export function SocialChip({
  text,
  className,
  float = 5,
  icon = false,
  dotClassName,
  disableAnimation = false,
  staticLayout = false,
}: SocialChipProps) {
  return (
    <div
      className={cn(
        "social-chip rounded-full will-change-transform",
        !staticLayout && "absolute",
        !disableAnimation && "opacity-0",
        className,
      )}
    >
      <div
        data-float={float}
        className={cn(
          "social-chip-float flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.065] px-3.5 py-2 text-sm font-medium text-white/90 backdrop-blur-xl will-change-transform [filter:blur(var(--chip-enter-blur,0px))] md:px-4 md:py-2.5 md:text-base",
          staticLayout && "justify-center",
        )}
        style={
          {
            "--chip-enter-blur": disableAnimation ? "0px" : "50px",
          } as CSSProperties
        }
      >
        {icon ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#45db91]/20 text-[#45db91]">
            <GroupIcon className="h-4 w-4 stroke-1.5" />
          </span>
        ) : null}
        <span className="whitespace-nowrap">{text}</span>
        <span
          className={cn(
            "h-2 w-2 rounded-full bg-[#45db91] shadow-[0_0_14px_rgba(69,219,145,0.7)]",
            dotClassName,
          )}
        />
      </div>
    </div>
  );
}

export function SocialSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);
  const disableMotion = !hasMounted || isMobile;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const headingY = useTransform(
    scrollYProgress,
    [0, 0.22, 0.82, 1],
    [54, 0, 0, -34],
  );
  const headingScale = useTransform(
    scrollYProgress,
    [0, 0.22, 0.82, 1],
    [0.95, 1, 1, 0.97],
  );
  const stageY = useTransform(
    scrollYProgress,
    [0, 0.24, 0.82, 1],
    [72, 10, 0, -58],
  );
  const stageScale = useTransform(
    scrollYProgress,
    [0, 0.24, 0.82, 1],
    [0.9, 1, 1, 0.93],
  );
  const stageRotate = useTransform(
    scrollYProgress,
    [0, 0.24, 0.82, 1],
    [2.2, 0, 0, -1.6],
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (disableMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 82%",
          once: true,
        },
      });

      gsap.set(
        [
          ".social-eyebrow",
          ".social-title-line",
          ".social-subtitle",
          ".social-cluster",
          ".social-cluster-label",
          ".social-avatar",
        ],
        { autoAlpha: 0 },
      );

      gsap.set(".social-eyebrow", { y: 12 });
      gsap.set(".social-title-line", { y: 22 });
      gsap.set(".social-subtitle", { y: 12 });
      gsap.set(".social-cluster", { y: 18, scale: 0.96 });
      gsap.set(".social-cluster-label", { y: 6 });
      gsap.set(".social-avatar", { y: 10, scale: 0.82 });
      gsap.set(".social-chip", {
        opacity: 0,
        y: 90,
        scale: 0.36,
        rotate: (index) => (index % 2 === 0 ? -0.8 : 0.8),
        transformOrigin: "50% 50%",
      });
      gsap.set(".social-chip-float", { x: 0, y: 0, rotate: 0 });
      gsap.set(".social-chip-float", { "--chip-enter-blur": "20px" });
      gsap.set(".social-glow", { autoAlpha: 0, scale: 1.18, rotate: 0 });

      const chipFloatLoops = gsap.utils
        .toArray<HTMLElement>(".social-chip-float")
        .map((chip, index) => {
          const float = Number(chip.dataset.float || 5);
          const drift = index % 2 === 0 ? 2 : -2;
          const rotate = index % 2 === 0 ? 0.45 : -0.45;
          const duration = 2.7 + float * 0.16 + index * 0.12;

          return gsap
            .timeline({
              repeat: -1,
              paused: true,
              delay: index * 0.22,
              defaults: { ease: "sine.inOut" },
            })
            .to(chip, {
              y: -float,
              x: drift,
              rotate,
              force3D: true,
              duration,
            })
            .to(chip, {
              y: float * 0.42,
              x: -drift * 0.6,
              rotate: -rotate * 0.7,
              force3D: true,
              duration: duration * 1.05,
            })
            .to(chip, {
              y: 0,
              x: 0,
              rotate: 0,
              force3D: true,
              duration: duration * 0.72,
            });
        });

      const avatarLoops = gsap.utils
        .toArray<HTMLElement>(".social-avatar")
        .map((avatar, index) => {
          const rise = index % 2 === 0 ? -4.6 : -6.4;
          const drift = index % 2 === 0 ? 0.18 : -0.18;

          return gsap
            .timeline({
              repeat: -1,
              paused: true,
              delay: index * 0.16,
              defaults: { ease: "sine.inOut" },
            })
            .to(avatar, {
              y: rise,
              rotate: drift,
              duration: 2.4 + index * 0.18,
              force3D: true,
            })
            .to(avatar, {
              y: rise * 0.42,
              rotate: -drift * 0.55,
              duration: 2 + index * 0.14,
              force3D: true,
            })
            .to(avatar, {
              y: 0,
              rotate: 0,
              duration: 1.9 + index * 0.12,
              force3D: true,
            });
        });

      const loops = [
        gsap
          .timeline({
            repeat: -1,
            paused: true,
            defaults: { ease: "sine.inOut" },
          })
          .to(".social-glow", {
            rotate: 12,
            scale: 1.14,
            duration: 3.8,
            force3D: true,
          })
          .to(".social-glow", {
            rotate: -6,
            scale: 1.09,
            duration: 3.4,
            force3D: true,
          })
          .to(".social-glow", {
            rotate: 0,
            scale: 1.12,
            duration: 3.1,
            force3D: true,
          }),
        gsap
          .timeline({
            repeat: -1,
            paused: true,
            defaults: { ease: "sine.inOut" },
          })
          .to(".social-cluster", {
            y: -6.2,
            duration: 2.9,
            force3D: true,
          })
          .to(".social-cluster", {
            y: -2.1,
            duration: 2.5,
            force3D: true,
          })
          .to(".social-cluster", {
            y: 0,
            duration: 2.2,
            force3D: true,
          }),
        ...avatarLoops,
        ...chipFloatLoops,
      ];

      tl.to(".social-eyebrow", {
        autoAlpha: 1,
        y: 0,
        duration: 0.32,
      })
        .to(
          ".social-title-line",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.045,
          },
          "-=0.18",
        )
        .to(
          ".social-subtitle",
          { autoAlpha: 1, y: 0, duration: 0.42 },
          "-=0.34",
        )
        .to(
          ".social-glow",
          { autoAlpha: 0.95, scale: 1.08, rotate: 0, duration: 0.62 },
          "-=0.42",
        )
        .to(
          ".social-cluster",
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.44 },
          "-=0.58",
        )
        .to(
          ".social-avatar",
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.42,
            stagger: 0.04,
          },
          "-=0.38",
        )
        .to(
          ".social-cluster-label",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.32,
            ease: "power2.out",
          },
          "-=0.12",
        )
        .to(
          ".social-chip",
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 0.34,
            stagger: 0.04,
            ease: "power2.out",
          },
          ">-0.3",
        )
        .to(
          ".social-chip-float",
          {
            "--chip-enter-blur": "0px",
            duration: 0.62,
            stagger: 0.04,
            ease: "power2.out",
          },
          "<",
        )
        .add(() => {
          loops.forEach((loop) => loop.play());
        }, ">-0.02");
    }, sectionRef);

    return () => ctx.revert();
  }, [disableMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden px-5 py-16 sm:px-8 md:px-10 md:py-20"
    >
      <div className="relative mx-auto flex w-full max-w-[1220px] flex-col gap-10 md:gap-12">
        <motion.div
          style={
            disableMotion ? undefined : { y: headingY, scale: headingScale }
          }
          className="mx-auto w-full max-w-[900px] text-center"
        >
          <p
            className={cn(
              "social-eyebrow mb-5 text-sm font-bold uppercase tracking-[0.12em] text-white/40",
              !disableMotion && "opacity-0",
            )}
          >
            Noches mejores, juntos
          </p>
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
                  <span className="social-title-line block leading-[1.1] text-white">
                    Haz match
                  </span>
                  <span className="social-title-line block leading-[1.1] text-white">
                    en el evento
                  </span>
                  <p className="social-subtitle mx-auto mt-4 max-w-[680px] text-pretty text-sm leading-relaxed text-white/65 md:text-lg">
                    Las personas con las que coincides en la fiesta se guardan en
                    tus matches. Escríbeles cuando quieras.
                  </p>
                </>
              ) : (
                <>
                  <BounceInText
                    as="span"
                    text="Haz match "
                    triggerOnView
                    once={false}
                    className="social-title-line block leading-[1.1] text-white opacity-0"
                  />
                  <BounceInText
                    as="span"
                    text="en el evento"
                    triggerOnView
                    once={false}
                    delay={0.2}
                    className="social-title-line block leading-[1.1] text-white opacity-0"
                  />
                  <p className="social-subtitle mx-auto mt-4 max-w-[680px] text-pretty text-sm leading-relaxed text-white/65 opacity-0 md:text-lg">
                    Las personas con las que coincides en la fiesta se guardan en
                    tus matches. Escríbeles cuando quieras.
                  </p>
                </>
              )}
            </div>
          </h1>
        </motion.div>

        <motion.div
          style={
            disableMotion
              ? undefined
              : { y: stageY, scale: stageScale, rotate: stageRotate }
          }
          className={cn(
            "relative w-full [transform-style:preserve-3d]",
            disableMotion
              ? "flex flex-col items-center gap-6 px-2 pb-4"
              : "min-h-[27rem] sm:min-h-[31rem] lg:min-h-[36rem]",
          )}
        >
          <div
            className={cn(
              disableMotion
                ? "relative flex w-full justify-center"
                : "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            )}
          >
            <div className="flex flex-col items-center">
              <IntelligenceGlowRing disableAnimation={disableMotion} />
              <div
                className={cn(
                  "social-cluster rounded-full border border-white/10 bg-white/[0.045] px-7 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_30px_90px_rgba(93,35,174,0.22)] backdrop-blur-xl",
                  !disableMotion && "opacity-0",
                )}
              >
                <AvatarGroup disableAnimation={disableMotion} />
              </div>
              <p
                className={cn(
                  "social-cluster-label mt-5 text-center text-lg font-medium text-white/68 md:text-2xl",
                  !disableMotion && "opacity-0",
                )}
              >
                Ana, Carlos y <span className="font-bold text-white">+12</span>{" "}
                coincidieron contigo en Neon Night
              </p>
            </div>
          </div>

          {disableMotion ? (
            <div className="flex w-full flex-col items-center gap-3 px-4">
              {chips.map((chip) => (
                <SocialChip
                  key={chip.text}
                  {...chip}
                  className="w-full max-w-[18rem]"
                  disableAnimation
                  staticLayout
                />
              ))}
            </div>
          ) : (
            chips.map((chip) => (
              <SocialChip
                key={chip.text}
                {...chip}
                disableAnimation={disableMotion}
              />
            ))
          )}
        </motion.div>
      </div>
    </section>
  );
}
