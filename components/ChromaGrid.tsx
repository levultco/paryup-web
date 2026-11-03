"use client";

import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { Zap } from "lucide-react";

export type ChromaItem = {
  image: string;
  title: string;
  handle?: string;
  /** Día de la semana y número, p. ej. "Vie 6". */
  date?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
  /** Se oculta en móvil (menos de 768 px). */
  hideOnMobile?: boolean;
};

type SetterFn = (v: number | string) => void;

const MASK_CLEAR =
  "radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(10,10,10,0.10) 30%,rgba(10,10,10,0.22) 45%,rgba(10,10,10,0.35) 60%,rgba(10,10,10,0.50) 75%,rgba(10,10,10,0.68) 88%,white 100%)";
const DIM = "grayscale(1) brightness(0.78)";

/**
 * Cards de evento con el efecto "foco": toda la rejilla se apaga en gris y un círculo con
 * color sigue al cursor. Sin cursor, el foco pasea solo. Es el mismo comportamiento del
 * ChromaGrid de la otra web.
 */
export default function ChromaGrid({
  items,
  className = "",
  radius = 300,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
}: {
  items: ChromaItem[];
  className?: string;
  radius?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const setX = useRef<SetterFn | null>(null);
  const setY = useRef<SetterFn | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const isPointerActive = useRef(false);
  const isVisible = useRef(false);
  const motionTweenRef = useRef<gsap.core.Tween | null>(null);
  const idleLoopRef = useRef<(() => void) | null>(null);

  const moveTo = useCallback(
    (x: number, y: number, duration = damping) => {
      motionTweenRef.current?.kill();
      motionTweenRef.current = gsap.to(pos.current, {
        x,
        y,
        duration,
        ease,
        onUpdate: () => {
          setX.current?.(pos.current.x);
          setY.current?.(pos.current.y);
        },
        overwrite: true,
      });
    },
    [damping, ease],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, "--x", "px") as SetterFn;
    setY.current = gsap.quickSetter(el, "--y", "px") as SetterFn;
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Sin cursor, el foco recorre la rejilla por su cuenta
    const runIdleLoop = () => {
      if (isPointerActive.current || !isVisible.current || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      motionTweenRef.current?.kill();
      motionTweenRef.current = gsap.to(pos.current, {
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        duration: Math.max(1.6, 1.2 + Math.random() * 1.6),
        ease: "sine.inOut",
        onUpdate: () => {
          setX.current?.(pos.current.x);
          setY.current?.(pos.current.y);
        },
        onComplete: () => idleLoopRef.current?.(),
        overwrite: true,
      });
    };

    let io: IntersectionObserver | undefined;
    if (!reduced) {
      idleLoopRef.current = runIdleLoop;
      io = new IntersectionObserver(([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (entry.isIntersecting) runIdleLoop();
        else motionTweenRef.current?.kill();
      });
      io.observe(el);
    }
    return () => {
      io?.disconnect();
      idleLoopRef.current = null;
      motionTweenRef.current?.kill();
    };
  }, [fadeOut]);

  const handlePointerEnter = () => {
    isPointerActive.current = true;
    idleLoopRef.current = null;
  };

  const handleMove = (e: React.PointerEvent) => {
    isPointerActive.current = true;
    idleLoopRef.current = null;
    const r = rootRef.current!.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
  };

  const handleLeave = () => {
    isPointerActive.current = false;
    const loop = () => {
      if (isPointerActive.current || !isVisible.current || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      motionTweenRef.current?.kill();
      motionTweenRef.current = gsap.to(pos.current, {
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        duration: Math.max(1.2, 0.9 + Math.random() * 1.6),
        ease: "sine.inOut",
        onUpdate: () => {
          setX.current?.(pos.current.x);
          setY.current?.(pos.current.y);
        },
        onComplete: () => idleLoopRef.current?.(),
        overwrite: true,
      });
    };
    idleLoopRef.current = loop;
    loop();
  };

  const open = (url?: string) => {
    if (url) router.push(url);
  };

  const handleCardMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const c = e.currentTarget;
    const rect = c.getBoundingClientRect();
    c.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    c.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={rootRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`relative grid h-auto w-full grid-cols-1 gap-[clamp(1rem,1.4vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3 ${className}`}
      style={{ "--r": `${radius}px`, "--x": "50%", "--y": "50%" } as CSSProperties}
    >
      {items.map((item) => (
        <article
          key={item.image}
          data-event-card
          onMouseMove={handleCardMove}
          onClick={() => open(item.url)}
          onKeyDown={(e) => {
            if (item.url && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              open(item.url);
            }
          }}
          tabIndex={item.url ? 0 : -1}
          role={item.url ? "link" : undefined}
          aria-label={item.title}
          className={`group relative flex aspect-[4/5] cursor-pointer flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#0f1113] transition-[translate,border-color] duration-300 hover:-translate-y-0.5 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:translate-y-[1px] ${item.hideOnMobile ? "max-md:hidden" : ""}`}
          style={{ "--card-border": item.borderColor || "transparent" } as CSSProperties}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                item.gradient ||
                "linear-gradient(135deg, rgba(139,207,110,0.2), rgba(18,18,18,0.96))",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/70" />

          <div className="relative z-10 min-h-0 flex-1 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="h-full w-full rounded-[18px] object-cover"
            />
          </div>

          {item.date ? (
            <header className="absolute right-3 top-3 z-30 sm:right-4 sm:top-4">
              <div className="rounded-2xl border border-black/10 bg-white px-2 py-2 text-black shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
                <div className="flex flex-col items-center">
                  <span className="text-[1.05rem] font-semibold leading-tight">
                    {item.date.split(" ")[0]}
                  </span>
                  <span className="text-[0.92rem] leading-tight text-black/75">
                    {item.date.split(" ")[1]}
                  </span>
                </div>
              </div>
            </header>
          ) : null}

          <footer className="absolute bottom-0 z-20 w-full p-5 text-white sm:p-6">
            <div className="event-card-fade" />
            <div className="relative z-20 mb-2 flex items-center">
              <Zap aria-hidden className="mr-2 h-4 w-4 fill-current text-[#c0de79]" />
              {item.handle ? (
                <span className="text-[0.9rem] font-semibold tracking-wide text-[#c0de79]">
                  {item.handle}
                </span>
              ) : null}
            </div>
            <h3 className="relative z-20 m-0 max-w-[24ch] text-[1.35rem] font-semibold leading-tight text-white">
              {item.title}
            </h3>
          </footer>
        </article>
      ))}

      {/* Capa gris con un agujero (el foco) que sigue al cursor */}
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          backdropFilter: DIM,
          WebkitBackdropFilter: DIM,
          maskImage: MASK_CLEAR,
          WebkitMaskImage: MASK_CLEAR,
        }}
      />
    </div>
  );
}
