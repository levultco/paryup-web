import React, { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { EventFlyerCard, type EventFlyerItem } from "@/components/common/eventFlyerCard";

export type ChromaItem = EventFlyerItem;

export interface ChromaGridProps {
  items?: ChromaItem[];
  className?: string;
  radius?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
}

type SetterFn = (v: number | string) => void;

const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  className = "",
  radius = 300,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<SetterFn | null>(null);
  const setY = useRef<SetterFn | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const isPointerActive = useRef(false);
  const motionTweenRef = useRef<gsap.core.Tween | null>(null);
  const idleLoopRef = useRef<(() => void) | null>(null);

  const data = items || [];
  const idleBaseDelay = Math.max(700, fadeOut * 1000 + 500);

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

  const stopIdleLoop = useCallback(() => {
    idleLoopRef.current = null;
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, "--x", "px") as SetterFn;
    setY.current = gsap.quickSetter(el, "--y", "px") as SetterFn;
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);

    const runIdleLoop = () => {
      if (isPointerActive.current || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const nextX = Math.random() * rect.width;
      const nextY = Math.random() * rect.height;

      motionTweenRef.current?.kill();
      motionTweenRef.current = gsap.to(pos.current, {
        x: nextX,
        y: nextY,
        duration: Math.max(1.2, 0.9 + Math.random() * 0.6),
        ease: "sine.inOut",
        onUpdate: () => {
          setX.current?.(pos.current.x);
          setY.current?.(pos.current.y);
        },
        onComplete: () => {
          idleLoopRef.current?.();
        },
        overwrite: true,
      });

      gsap.to(fadeRef.current, {
        opacity: 0.18,
        duration: 0.45,
        overwrite: true,
      });
    };

    idleLoopRef.current = runIdleLoop;
    runIdleLoop();

    return () => {
      stopIdleLoop();
      motionTweenRef.current?.kill();
    };
  }, [idleBaseDelay, moveTo, stopIdleLoop]);

  const handleMove = (e: React.PointerEvent) => {
    isPointerActive.current = true;
    stopIdleLoop();
    const r = rootRef.current!.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handlePointerEnter = () => {
    isPointerActive.current = true;
    stopIdleLoop();
  };

  const handleLeave = () => {
    isPointerActive.current = false;
    gsap.to(fadeRef.current, {
      opacity: 0.18,
      duration: 0.35,
      overwrite: true,
    });
    idleLoopRef.current = () => {
      if (isPointerActive.current || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const nextX = Math.random() * rect.width;
      const nextY = Math.random() * rect.height;

      motionTweenRef.current?.kill();
      motionTweenRef.current = gsap.to(pos.current, {
        x: nextX,
        y: nextY,
        duration: Math.max(1.2, 0.9 + Math.random() * 1.6),
        ease: "sine.inOut",
        onUpdate: () => {
          setX.current?.(pos.current.x);
          setY.current?.(pos.current.y);
        },
        onComplete: () => {
          idleLoopRef.current?.();
        },
        overwrite: true,
      });
    };
    idleLoopRef.current();
  };

  const handleCardClick = (url?: string) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, url?: string) => {
    if (!url) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(url);
    }
  };

  const handleCardMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const c = e.currentTarget as HTMLElement;
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
      className={`relative grid h-auto w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 ${className}`}
      style={
        {
          "--r": `${radius}px`,
          "--x": "50%",
          "--y": "50%",
        } as React.CSSProperties
      }
    >
      {data.map((c, i) => (
        <EventFlyerCard
          key={i}
          item={c}
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(c.url)}
          onKeyDown={(e) => handleKeyDown(e, c.url)}
          tabIndex={c.url ? 0 : -1}
          role={c.url ? "button" : undefined}
          ariaLabel={c.url ? `Abrir evento ${c.title}` : undefined}
        />
      ))}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          backdropFilter: "grayscale(1) brightness(0.78)",
          WebkitBackdropFilter: "grayscale(1) brightness(0.78)",
          //   background: "rgba(10, 10, 10, 0.001)",
          maskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(10, 10, 10,0.10) 30%,rgba(10, 10, 10,0.22)45%,rgba(10, 10, 10,0.35)60%,rgba(10, 10, 10,0.50)75%,rgba(10, 10, 10,0.68)88%,white 100%)",
          WebkitMaskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(10, 10, 10,0.10) 30%,rgba(10, 10, 10,0.22)45%,rgba(10, 10, 10,0.35)60%,rgba(10, 10, 10,0.50)75%,rgba(10, 10, 10,0.68)88%,white 100%)",
        }}
      />
      <div
        ref={fadeRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-[250ms] z-40"
        style={{
          backdropFilter: "grayscale(1) brightness(0.78)",
          WebkitBackdropFilter: "grayscale(1) brightness(0.78)",
          //   background: "rgba(10, 10, 10,0.001)",
          maskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)",
          opacity: 1,
        }}
      />
    </div>
  );
};

export default ChromaGrid;
