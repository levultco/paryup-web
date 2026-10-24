"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export function Party({
  emoji,
  className = "",
  delay = 0,
}: {
  emoji: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span
      className={`v2-party ${className}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden
    >
      {emoji}
    </span>
  );
}

export function Stars({ count = 90 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dots = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.1,
      v: 0.00002 + Math.random() * 0.00006,
      p: Math.random() * Math.PI * 2,
    }));
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const y = (((d.y - time * d.v) % 1) + 1) % 1;
        const a = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(time / 1100 + d.p));
        ctx.fillStyle = `rgba(235,235,245,${a})`;
        ctx.beginPath();
        ctx.arc(d.x * w, y * h, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!still && visible) raf = requestAnimationFrame(draw);
    };
    resize();
    draw(0);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !still) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={ref} className="v2-stars" aria-hidden />;
}

// Globo de puntos que gira. Los "continentes" salen de ruido, no de un mapa real.
export function Globe() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = 1500;
    const pts: { x: number; y: number; z: number; land: boolean }[] = [];
    const g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = g * i;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const n =
        Math.sin(x * 3.1 + 1.3) * Math.cos(z * 2.7 - 0.4) +
        Math.sin(y * 4.2 + x * 1.7) * 0.6 +
        Math.cos(z * 5.1 + y * 2.3) * 0.35;
      pts.push({ x, y, z, land: n > 0.15 });
    }
    let size = 0;
    let raf = 0;
    let visible = true;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (t: number) => {
      ctx.clearRect(0, 0, size, size);
      const R = size * 0.46;
      const c = size / 2;
      const rot = t * 0.00012;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      // esfera
      const grad = ctx.createRadialGradient(
        c - R * 0.3,
        c - R * 0.35,
        R * 0.1,
        c,
        c,
        R,
      );
      grad.addColorStop(0, "#5a5b69");
      grad.addColorStop(0.55, "#2c2d38");
      grad.addColorStop(1, "#101117");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.fill();
      for (const p of pts) {
        const x = p.x * cr + p.z * sr;
        const z = -p.x * sr + p.z * cr;
        if (z < 0) continue;
        ctx.fillStyle = p.land
          ? `rgba(255,255,255,${0.35 + z * 0.65})`
          : `rgba(255,255,255,${0.06 + z * 0.12})`;
        ctx.beginPath();
        ctx.arc(c + x * R, c + p.y * R, p.land ? 1.9 : 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!still && visible) raf = requestAnimationFrame(draw);
    };
    resize();
    draw(0);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !still) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="v2-globe" aria-hidden />;
}

function Pill({
  title,
  text,
  tone,
  delay,
}: {
  title: string;
  text: string;
  tone: "check" | "ring" | "heart";
  delay: number;
}) {
  return (
    <div className="v2-pill-item" style={{ animationDelay: `${delay}s` }}>
      <span className="v2-pill-ico" data-tone={tone} />
      <span className="v2-pill-txt">
        <small>{title}</small>
        <b>{text}</b>
      </span>
      <span className="v2-pill-end" data-tone={tone} />
    </div>
  );
}

// Interfaz del móvil dibujada en HTML: las animaciones del scroll la recorren.
export function PhoneUI() {
  return (
    <div className="v2-ui">
      <div className="ui-status">
        <span>9:41</span>
        <span className="ui-status-ico" />
      </div>
      <div className="ui-head">
        <span className="ui-back">‹</span>
        <Image
          src="/home/cards/noche-3.webp"
          alt=""
          width={64}
          height={64}
          className="ui-avatar"
        />
        <b>Lucía</b>
      </div>
      <div className="ui-chat">
        <p className="ui-msg in">
          ¿Vamos el sábado al Downtown? Pinchan The Vibe.
        </p>
        <p className="ui-msg out">Dale, saco las entradas ahora.</p>
        <p className="ui-msg in">Perfecto, nos vemos en la puerta.</p>
      </div>
      <div className="ui-composer">
        <span className="ui-plus">+</span>
        <span className="ui-input">Escribe un mensaje</span>
        <span className="ui-send" />
      </div>

      <div className="ui-sheet">
        <div className="ui-sheet-head">
          <Image
            src="/home/cards/noche-4.webp"
            alt=""
            width={80}
            height={100}
            className="ui-thumb"
          />
          <span>
            <b>The Vibe Saturday</b>
            <small>Downtown · 14 marzo</small>
          </span>
        </div>
        <p className="ui-big">2 entradas</p>
        <p className="ui-row">
          <span>Tipo</span>
          <b>General</b>
        </p>
        <p className="ui-row">
          <span>Nota</span>
          <b>Para el grupo</b>
        </p>
        <div className="ui-btns">
          <span className="ghost">Pedir</span>
          <span className="pay">Comprar</span>
        </div>
      </div>

      <div className="ui-ticket">
        <p className="ui-ticket-top">
          <b>Entrada</b>
          <em>Confirmada</em>
        </p>
        <p className="ui-row">
          <span>Evento</span>
          <b>The Vibe</b>
        </p>
        <p className="ui-row">
          <span>Cuándo</span>
          <b>Sáb 14 · 00:00</b>
        </p>
      </div>
      <i className="ui-home" />
    </div>
  );
}

export function IslandPills() {
  return (
    <div className="v2-pill">
      <Pill title="¡Listo!" text="Entrada confirmada" tone="check" delay={0} />
      <Pill
        title="Pagando entrada…"
        text="Procesando"
        tone="ring"
        delay={3.2}
      />
      <Pill
        title="Nuevo match"
        text="Ana quiere hablar"
        tone="heart"
        delay={6.4}
      />
    </div>
  );
}
