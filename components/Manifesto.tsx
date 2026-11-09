"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "@/components/i18n/LocaleProvider";

gsap.registerPlugin(ScrollTrigger);

// Las palabras marcadas con * van en negrita (el texto está en lib/i18n).

// Mismos colores que el degradado del botón "Mis Entradas" (paleta pary).
// --g (0 → 1) los mezcla con blanco: a 0 la palabra se ve igual que las demás, a 1 muestra el degradado completo.
const GRADIENT = `linear-gradient(90deg, ${[
  "rgb(255,176,5)",
  "rgb(250,61,29)",
  "rgb(198,121,196)",
  "rgb(70,138,255)",
]
  .map((c) => `color-mix(in srgb, ${c} calc(var(--g) * 100%), white)`)
  .join(", ")})`;

// Chapa por palabra resaltada, en orden: plan, entrada, gente, cruzas, vivirla.
// Glifos rellenos (viewBox 48) en blanco sobre un degradado propio de cada uno.
const TIPS: { bg: string; glyph: ReactNode }[] = [
  {
    bg: "linear-gradient(135deg,#FFB005,#FA3D1D)",
    glyph: (
      <>
        <path d="M14 6a2 2 0 0 1 2 2v3h16V8a2 2 0 1 1 4 0v3.1c3.4.5 6 3.4 6 6.9v16a7 7 0 0 1-7 7H11a7 7 0 0 1-7-7V18c0-3.5 2.6-6.4 6-6.9V8a2 2 0 0 1 2-2h2Z" />
        <path fill="rgba(0,0,0,.28)" d="M8 19h32v1H8z" />
        <path fill="rgba(0,0,0,.35)" d="m24 23 2.4 5 5.4.7-4 3.7 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.7 5.4-.7z" />
      </>
    ),
  },
  {
    bg: "linear-gradient(135deg,#C679C4,#FA3D1D)",
    glyph: (
      <>
        <path d="M7 10h34a3 3 0 0 1 3 3v5a6 6 0 0 0 0 12v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a6 6 0 0 0 0-12v-5a3 3 0 0 1 3-3Z" />
        <path
          fill="none"
          stroke="rgba(0,0,0,.3)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 5"
          d="M31 14v20"
        />
        <path fill="rgba(0,0,0,.3)" d="M12 19h12v3H12zM12 26h8v3h-8z" />
      </>
    ),
  },
  {
    bg: "linear-gradient(135deg,#468AFF,#C679C4)",
    glyph: (
      <>
        <circle cx="17" cy="15" r="7" />
        <path d="M17 25c-7 0-12 4-12 9 0 3 2 5 5 5h14c3 0 5-2 5-5 0-5-5-9-12-9Z" />
        <circle cx="34" cy="17" r="6" opacity=".75" />
        <path opacity=".75" d="M34 26.5c-1.2 0-2.3.2-3.3.5 3.3 2 5.3 5 5.3 8.5 0 1.3-.3 2.5-.9 3.5H40c3 0 5-2 5-5 0-4.5-4.5-7.5-11-7.5Z" />
      </>
    ),
  },
  {
    bg: "linear-gradient(135deg,#FF5C8A,#FFB005)",
    glyph: (
      <path d="M24 42S5 31 5 17.5C5 11.7 9.400 8 14.500 8c3.700 0 7 2 9.500 5.500C26.500 10 29.800 8 33.500 8 38.600 8 43 11.700 43 17.500 43 31 24 42 24 42Z" />
    ),
  },
  {
    bg: "linear-gradient(135deg,#468AFF,#FA3D1D)",
    glyph: (
      <>
        <path d="M24 5a19 19 0 1 1-17.500 26.400 2.200 2.200 0 0 1 4.100-1.700A14.600 14.600 0 1 0 14 14.300l3.400 1.300a1.400 1.400 0 0 1-.4 2.700l-9-1.100a1.400 1.400 0 0 1-1.200-1.600l1.200-8.800a1.400 1.400 0 0 1 2.700-.3l.6 3.200A19 19 0 0 1 24 5Z" />
        <path d="m20 17.500 12 6.500-12 6.500z" />
      </>
    ),
  },
];

export default function Manifesto({
  eyebrowKey = "manifesto.eyebrow",
  textKey = "manifesto.text",
}: {
  eyebrowKey?: string;
  textKey?: string;
}) {
  const { t, locale } = useI18n();
  const text = t(textKey);
  const root = useRef<HTMLElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const [tipIcon, setTipIcon] = useState<number | null>(null);
  const sim = useRef({
    tx: 0, ty: 0, x: 0, y: 0, vx: 0, vy: 0,
    s: 0, vs: 0, show: 0, last: 0, running: false,
  });
  const raf = useRef(0);
  const hideTimer = useRef(0);
  const useTips = textKey === "manifesto.text";

  // Un solo bucle de muelles (posición, escala) que sobrevive al cambio de palabra:
  // al pasar de una a otra la chapa se desliza; solo se detiene cuando ya está oculta y quieta.
  const follow = (now: number) => {
    const el = tip.current;
    const m = sim.current;
    if (!el) return;
    const dt = Math.min((now - (m.last || now)) / 1000, 1 / 30);
    m.last = now;
    // Posición: algo de rebote. Escala: amortiguación casi crítica con ligero sobreimpulso.
    m.vx += (260 * (m.tx - m.x) - 24 * m.vx) * dt;
    m.vy += (260 * (m.ty - m.y) - 24 * m.vy) * dt;
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    m.vs += (320 * (m.show - m.s) - 24 * m.vs) * dt;
    m.s += m.vs * dt;
    const tilt = Math.max(-12, Math.min(12, m.vx * 0.01));
    const sc = Math.max(0, m.s);
    el.style.opacity = String(Math.min(1, sc * 1.6));
    el.style.transform = `translate3d(${m.x}px, ${m.y}px, 0) translate(-50%, -100%) rotate(${tilt}deg) scale(${0.4 + 0.6 * sc})`;
    const settled =
      m.show === 0 &&
      sc < 0.01 &&
      Math.abs(m.vs) < 0.05 &&
      Math.abs(m.vx) + Math.abs(m.vy) < 1;
    if (settled) {
      el.style.opacity = "0";
      m.running = false;
      return;
    }
    raf.current = requestAnimationFrame(follow);
  };
  const aim = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    // Justo encima de la palabra; en horizontal sigue al cursor dentro de ella.
    sim.current.tx = Math.max(r.left + 24, Math.min(r.right - 24, e.clientX));
    sim.current.ty = r.top - 6;
  };
  const showTip = (i: number, e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const m = sim.current;
    clearTimeout(hideTimer.current);
    aim(e);
    if (m.s < 0.05) {
      // Aparece desde un punto algo más bajo de la palabra.
      m.x = m.tx;
      m.y = m.ty + 16;
      m.vx = 0;
      m.vy = 0;
    }
    m.show = 1;
    setTipIcon(i);
    if (!m.running) {
      m.running = true;
      m.last = 0;
      raf.current = requestAnimationFrame(follow);
    }
  };
  // Pequeña tolerancia: si el cursor salta a otra palabra, la chapa viaja en vez de desaparecer.
  const hideTip = () => {
    clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      sim.current.show = 0;
    }, 90);
  };
  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(hideTimer.current);
    },
    [],
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Las palabras suben a su sitio y se encienden según pasas por la sección, sin fijarla
        gsap.fromTo(
          "[data-word]",
          { opacity: 0.12, yPercent: 35, "--g": 0 },
          {
            opacity: 1,
            yPercent: 0,
            "--g": 1,
            ease: "none",
            stagger: 0.035,
            scrollTrigger: {
              trigger: root.current,
              start: "top 85%",
              end: "center 55%",
              scrub: true,
            },
          },
        );
      });
    }, root);
    return () => ctx.revert();
  }, [locale]);

  return (
    <section
      ref={root}
      className="relative z-20 py-[clamp(6rem,14vw,12rem)]"
    >
      <div className="flex items-center">
        <div className="mx-auto w-full max-w-[1800px] px-[clamp(1.25rem,3vw,3.5rem)]">
          <p className="mb-10 text-sm font-medium uppercase tracking-[0.18em] text-muted">
            {t(eyebrowKey)}
          </p>
          <p
            data-manifesto-text
            className="font-display text-[clamp(2.1rem,4.6vw,5rem)] font-medium leading-[1.02]"
          >
            {(() => {
              let group = -1;
              let prevHl = false;
              return text.split(" ").map((w, i) => {
              const hl = w.startsWith("*");
              if (hl && !prevHl) group++;
              prevHl = hl;
              const tipIdx = useTips && hl && group < TIPS.length ? group : -1;
              const word = w.replaceAll("*", "");
              // El hueco entre palabras es un margen, no un espacio de texto: así no
              // se pierde aunque el navegador colapse los espacios entre inline-block
              // que se animan. Las resaltadas llevan relleno (para no recortar el
              // degradado) y se compensa con margen negativo a la izquierda y menos a la derecha.
              return (
                <span
                  key={`${locale}-${i}`}
                  data-word
                  onPointerEnter={
                    tipIdx >= 0 ? (e) => showTip(tipIdx, e) : undefined
                  }
                  onPointerMove={
                    tipIdx >= 0
                      ? (e) => {
                          if (e.pointerType === "mouse") aim(e);
                        }
                      : undefined
                  }
                  onPointerLeave={tipIdx >= 0 ? hideTip : undefined}
                  className={
                    hl
                      ? "-my-[0.1em] -ml-[0.1em] mr-[0.17em] inline-block bg-clip-text p-[0.1em] font-bold text-transparent"
                      : "mr-[0.27em] inline-block"
                  }
                  style={
                    hl
                      ? ({
                          backgroundImage: GRADIENT,
                          "--g": 0,
                          ...(tipIdx >= 0 ? { cursor: "var(--cursor-focus)" } : {}),
                        } as CSSProperties)
                      : undefined
                  }
                >
                  {word}
                </span>
              );
              });
            })()}
          </p>
        </div>
      </div>
      <div
        ref={tip}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-50 opacity-0 will-change-transform"
        style={{ transformOrigin: "50% 100%" }}
      >
        <div className="relative h-[84px] w-[84px] overflow-hidden rounded-[28px] shadow-[0_18px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/25">
          {TIPS.map((tp, i) => (
            <div
              key={i}
              className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                tipIcon === i
                  ? "scale-100 rotate-0 opacity-100"
                  : "scale-50 -rotate-12 opacity-0"
              }`}
              style={{ background: tp.bg }}
            >
              <svg viewBox="0 0 48 48" fill="white" className="h-12 w-12">
                {tp.glyph}
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
