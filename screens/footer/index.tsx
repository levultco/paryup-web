"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./footer.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type FooterLink = { label: string; href: string; external?: boolean };

const LINKS: FooterLink[] = [
  { label: "App Store", href: "#" },
  { label: "Google Play", href: "#" },
  { label: "Eventos", href: "#eventos" },
  { label: "Soporte", href: "#" },
  { label: "Privacidad", href: "#" },
  { label: "Términos", href: "#" },
];

const SOCIALS: FooterLink[] = [
  { label: "TikTok", href: "https://tiktok.com", external: true },
  { label: "Instagram", href: "https://instagram.com", external: true },
  { label: "X", href: "https://twitter.com", external: true },
  { label: "LinkedIn", href: "https://linkedin.com", external: true },
];

// La noche "empieza" a las 23:00 y dura hasta las 06:00.
function nightLine(now: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const hour = now.getHours();

  if (hour >= 23 || hour < 6) {
    return `Son las ${clock} y la noche ya ha empezado.`;
  }

  const start = new Date(now);
  start.setHours(23, 0, 0, 0);
  const minutes = Math.round((start.getTime() - now.getTime()) / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const left = h > 0 ? `${h} h ${m} min` : `${m} min`;

  return `Son las ${clock}. La noche empieza en ${left}.`;
}

function useNightLine() {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setLine(nightLine(new Date()));
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return line;
}

function FooterLinkItem({ link }: { link: FooterLink }) {
  return (
    <li>
      <Link
        href={link.href}
        className="footer-link"
        {...(link.external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {link.label}
      </Link>
    </li>
  );
}

export const FooterScreen = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const signRef = useRef<HTMLDivElement>(null);
  const nightLineText = useNightLine();

  useEffect(() => {
    if (!wrapperRef.current) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    // Atado al scroll mientras el telón (CTAScreen) se levanta. Solo se mueve:
    // nada queda oculto aunque el disparador se calcule pronto.
    const ctx = gsap.context(() => {
      const scroll = {
        trigger: wrapperRef.current,
        start: "top 85%",
        end: "bottom bottom",
        scrub: 0.6,
      };

      gsap.fromTo(
        signRef.current,
        { yPercent: 18, scale: 0.94 },
        {
          yPercent: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: scroll,
        },
      );
      gsap.fromTo(
        "[data-footer-rise]",
        { y: 40 },
        {
          y: 0,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { ...scroll, start: "top 70%" },
        },
      );
    }, wrapperRef);

    // El footer está al final: si la página crece después de montar (imágenes,
    // secciones que cambian de alto), hay que recalcular dónde empieza.
    let timer = 0;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(document.body);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative h-svh w-full"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <footer className="paryup-footer fixed bottom-0 left-0 flex h-svh w-full flex-col justify-end overflow-hidden">
        <div className="footer-frame">
          <div
            data-footer-rise
            className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <h2 className="footer-title">¿Salimos hoy?</h2>
            <p className="footer-lead">
              {nightLineText ?? "La noche empieza a las 23:00."} Descarga
              ParyUp y entra con tu gente.
            </p>
          </div>
        </div>

        {/* El vídeo de la noche solo se ve a través de las letras: la capa
            negra con el texto en blanco se multiplica sobre el vídeo. */}
        <div ref={signRef} className="footer-sign" aria-hidden>
          <video
            className="footer-sign-video"
            src="/video/fest.mp4"
            poster="/album/club-selfie-2.jpg"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
          <div className="footer-sign-lift" />
          <div className="footer-sign-mask">
            <span>PARYUP</span>
          </div>
        </div>

        <div className="footer-frame footer-bottom">
          <div
            data-footer-rise
            className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
          >
            <nav aria-label="Pie de página">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {LINKS.map((link) => (
                  <FooterLinkItem key={link.label} link={link} />
                ))}
              </ul>
            </nav>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {SOCIALS.map((link) => (
                  <FooterLinkItem key={link.label} link={link} />
                ))}
              </ul>
              <p className="footer-legal">
                © {new Date().getFullYear()} ParyUp
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
