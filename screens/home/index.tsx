"use client";

import { AppStoreButton, PlayStoreButton } from "@/components/common/store";
import { IslandPills, Party, Stars } from "@/screens/v2/parts";
import "@/screens/v2/v2.css";
import gsap from "gsap";
import { Plus_Jakarta_Sans } from "next/font/google";
import useIsMobile from "@/hooks/useIsMobile";
import { useEffect, useRef } from "react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

// Portada para móvil: el móvil gigante de la v2 en su pose inicial, sin escena
// fijada. En escritorio la portada vive dentro de la historia (presentation).
function StaticHero() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const phone = root?.querySelector<HTMLElement>(".v2-phone");
    if (!root || !phone) return;

    // Medidas: todo sale del viewport, como en la v2.
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 768;
      const hs = mobile
        ? Math.min(vh * 0.54, vw * 1.45)
        : Math.min(vh * 0.65, vw * 0.62);
      const ws = hs * 0.487;
      const heroW = mobile ? vw * 0.97 : vw * 0.68;
      const s = heroW / ws;
      const heroTop = mobile ? vh * 0.3 : vh * 0.215;
      root.style.setProperty("--ws", `${ws}px`);
      root.style.setProperty("--hs", `${hs}px`);
      root.style.setProperty("--u", String(1 / s));
      root.style.setProperty("--ty", `${heroTop}px`);
      root.style.setProperty("--copy-top", mobile ? "27vh" : "29vh");
      phone.style.transform = `translate3d(0, ${heroTop}px, 0) scale(${s})`;
    };
    measure();
    window.addEventListener("resize", measure);

    const q = gsap.utils.selector(root);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const intro = reduced
      ? null
      : gsap
          .timeline({ delay: 1.9, defaults: { ease: "expo.out" } })
          .from(q(".v2-sky"), { opacity: 0, duration: 2 }, 0)
          .from(
            q(".v2-herocopy > *"),
            { opacity: 0, y: 30, duration: 1, stagger: 0.1 },
            0.4,
          )
          .from(
            q(".v2-coins .v2-party"),
            { opacity: 0, scale: 0.4, duration: 1.2, stagger: 0.15 },
            0.9,
          );

    return () => {
      window.removeEventListener("resize", measure);
      intro?.kill();
    };
  }, []);

  return (
    <section ref={rootRef} id="inicio" className={`v2 ${jakarta.variable}`}>
      <div className="v2-stage">
        <div className="v2-skywrap" aria-hidden>
          <div className="v2-sky" />
        </div>
        <Stars />

        <div className="v2-phone">
          <div className="v2-body">
            <div className="v2-screen">
              <div className="v2-screen-bg" />
              <IslandPills />
              <div className="v2-herocopy">
                <p className="v2-kicker">
                  Entradas, chats y matches con tu gente.
                </p>
                <h1 className="v2-title">
                  <span>Toda tu noche,</span>
                  <span className="dim">en una sola app.</span>
                </h1>
                <div className="v2-badges">
                  <AppStoreButton />
                  <PlayStoreButton />
                </div>
              </div>
            </div>
            <div className="v2-edge" aria-hidden />
          </div>
        </div>

        <div className="v2-coins" aria-hidden>
          <Party emoji="🪩" className="v2-coin-a" delay={0.4} />
          <Party emoji="🎉" className="v2-coin-b" delay={0} />
          <Party emoji="🥂" className="v2-coin-c" delay={1.2} />
          <Party emoji="🎧" className="v2-coin-d" delay={0.8} />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const isMobile = useIsMobile();
  if (!isMobile) return null;
  return <StaticHero />;
}
