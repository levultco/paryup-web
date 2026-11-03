"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarIcon } from "@/components/icons/solar";
import ChromaGrid from "@/components/ChromaGrid";
import BorderBeam from "@/components/common/borderBeam";
import { useI18n } from "@/components/i18n/LocaleProvider";

gsap.registerPlugin(ScrollTrigger);

// Datos de ejemplo para representar la página /events: ni salas ni fechas reales.
const EVENTS = [
  { src: "/events/neon-techno.jpg", name: "Neon Techno Rave", handle: "@sala.techno", dow: ["Vie", "Fri"], day: 6, color: "#3B82F6" },
  { src: "/events/latin-night.jpg", name: "Latin Night", handle: "@club.latino", dow: ["Sáb", "Sat"], day: 7, color: "#EC4899" },
  { src: "/events/unvrs-opening.jpg", name: "Opening Night", handle: "@sala.lujo", dow: ["Mié", "Wed"], day: 11, color: "#A78BFA" },
  { src: "/events/hiphop-allstars.jpg", name: "Hip Hop All Stars", handle: "@hiphop.club", dow: ["Jue", "Thu"], day: 12, color: "#F59E0B" },
  { src: "/events/afrohouse.jpg", name: "Afro House Special", handle: "@casa.afro", dow: ["Vie", "Fri"], day: 13, color: "#F97316" },
  { src: "/events/underground.jpg", name: "Underground Session", handle: "@warehouse", dow: ["Sáb", "Sat"], day: 14, color: "#10B981" },
];

/** Una muestra de la página /events: cards de evento con fecha, sala y nombre. */
export default function Posters() {
  const { t, locale } = useI18n();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const head = gsap.utils.toArray<HTMLElement>("[data-poster-head] > *");
        const cards = gsap.utils.toArray<HTMLElement>("[data-event-card]");
        // La línea de tiempo espera quieta; la lanza el scroll o, si el disparador no llega a
        // activarse, un respaldo cuando la sección ya lleva un momento en pantalla.
        const tl = gsap.timeline({ paused: true });
        tl.from(head, { y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.1 });
        tl.from(
          cards,
          { y: 90, opacity: 0, duration: 1.3, ease: "expo.out", stagger: 0.09 },
          0.3,
        );
        const play = () => tl.play();
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 85%",
          once: true,
          onEnter: play,
        });
        let timer: ReturnType<typeof setTimeout> | undefined;
        const io = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              timer = setTimeout(play, 900);
              io.disconnect();
            }
          },
          { threshold: 0.05 },
        );
        io.observe(root.current!);
        // Las medidas cambian al cargar fuentes e imágenes: recalcular el disparador
        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener("load", refresh);
        document.fonts?.ready.then(refresh);
        return () => {
          io.disconnect();
          clearTimeout(timer);
          window.removeEventListener("load", refresh);
        };
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const i = locale === "en" ? 1 : 0;

  return (
    <section
      ref={root}
      className="mx-auto w-full max-w-[calc(1220px+2*clamp(1.25rem,3vw,3.5rem))] px-[clamp(1.25rem,3vw,3.5rem)] pb-[clamp(5rem,10vw,10rem)] pt-[clamp(3rem,7vw,7rem)]"
    >
      <div
        data-poster-head
        className="mx-auto mb-[clamp(2.5rem,4.5vw,4.5rem)] flex max-w-5xl flex-col items-center text-center"
      >
        <h2 className="font-display text-[clamp(2.75rem,6.5vw,6.5rem)] font-bold leading-[0.9]">
          <span className="block">{t("posters.title1")}</span>
          <span className="block">{t("posters.title2")}</span>
        </h2>
        <p className="mt-6 max-w-[52ch] text-lg text-muted md:text-xl lg:text-2xl">
          {t("posters.sub")}
        </p>
        <div className="mt-8">
          <BorderBeam size="md" colorVariant="pary" duration={2.4} strength={0.7}>
            <Link
              href="/events"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white bg-white/80 px-6 text-sm font-semibold text-black ring-1 ring-white/10 transition-colors hover:bg-white"
            >
              <CalendarIcon aria-hidden className="h-4 w-4" />
              {t("posters.discover")}
            </Link>
          </BorderBeam>
        </div>
      </div>

      <ChromaGrid
        className="w-full"
        items={EVENTS.map((e, n) => ({
          image: e.src,
          title: e.name,
          handle: e.handle,
          date: `${e.dow[i]} ${e.day}`,
          borderColor: e.color,
          gradient: `linear-gradient(145deg, ${e.color}, #000)`,
          url: "/events",
          hideOnMobile: n >= 3,
        }))}
      />
    </section>
  );
}
