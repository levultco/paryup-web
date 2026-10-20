"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type FlyerEvent = {
  id: string;
  title: string;
  venue: string;
  dateLabel: string;
  startTime: string;
  startsIn: string;
  distance: string;
  image: string;
  attendeesLabel: string;
  avatars: Array<{ name: string; color: string }>;
};

const TODAY_EVENTS: FlyerEvent[] = [
  {
    id: "pulse-of-friday",
    title: "PULSE\nOF\nFRIDAY",
    venue: "DOWNTOWN",
    dateLabel: "03 ABRIL",
    startTime: "00:00",
    startsIn: "Empieza en 1h",
    distance: "1 km · Pulse of Friday",
    image:
      "https://fourvenues.com/cdn-cgi/imagedelivery/kWuoTchaMsk7Xnc_FNem7A/8d6071c0-366f-4b3b-a5aa-2d742d94f000/w=1350",
    attendeesLabel: "4 amigos van",
    avatars: [
      { name: "AL", color: "from-violet-500 to-fuchsia-500" },
      { name: "NM", color: "from-cyan-500 to-blue-500" },
      { name: "CD", color: "from-emerald-500 to-lime-500" },
      { name: "PS", color: "from-orange-500 to-rose-500" },
      { name: "LR", color: "from-indigo-500 to-purple-500" },
    ],
  },
  {
    id: "the-vibe",
    title: "THE\nVIBE",
    venue: "DOWNTOWN",
    dateLabel: "04 ABRIL",
    startTime: "00:00",
    startsIn: "Empieza en 2h",
    distance: "2 km · The Vibe",
    image:
      "https://fourvenues.com/cdn-cgi/imagedelivery/kWuoTchaMsk7Xnc_FNem7A/83202dbf-0003-48ec-9f43-d8dbf61aec00/w=1350",
    attendeesLabel: "6 amigos van",
    avatars: [
      { name: "MG", color: "from-pink-500 to-orange-500" },
      { name: "DV", color: "from-sky-500 to-cyan-500" },
      { name: "RT", color: "from-blue-500 to-indigo-500" },
      { name: "KA", color: "from-emerald-500 to-teal-500" },
      { name: "JL", color: "from-fuchsia-500 to-violet-500" },
    ],
  },
  {
    id: "opium-spot",
    title: "OPIUM\nFRIDAY",
    venue: "OPIUM",
    dateLabel: "27 MAR",
    startTime: "23:30",
    startsIn: "Empieza en 30m",
    distance: "3 km · OPIUM Barcelona",
    image:
      "https://fourvenues.com/cdn-cgi/imagedelivery/kWuoTchaMsk7Xnc_FNem7A/6a5b9b81-02cc-483b-8d80-7d128b254e00/w=1350",
    attendeesLabel: "8 amigos van",
    avatars: [
      { name: "SV", color: "from-rose-500 to-fuchsia-500" },
      { name: "BL", color: "from-amber-500 to-orange-500" },
      { name: "TG", color: "from-cyan-500 to-sky-500" },
      { name: "MV", color: "from-emerald-500 to-green-500" },
      { name: "CN", color: "from-violet-500 to-purple-500" },
    ],
  },
];

function AvatarsRow({
  avatars,
  className,
}: {
  avatars: FlyerEvent["avatars"];
  className?: string;
}) {
  return (
    <div className={cn("flex -space-x-1.5", className)}>
      {avatars.map((avatar, index) => (
        <div
          key={`${avatar.name}-${index}`}
          className={cn(
            "grid h-5 w-5 place-content-center rounded-full border border-black/55 bg-gradient-to-br text-[9px] font-semibold text-white/95 shadow-[0_6px_14px_rgba(0,0,0,0.45)] md:h-6 md:w-6 md:text-[10px]",
            avatar.color,
          )}
        >
          {avatar.name}
        </div>
      ))}
    </div>
  );
}

function EventFlyer({
  event,
  mode,
  className,
  delay,
}: {
  event: FlyerEvent;
  mode: "main" | "secondary";
  className?: string;
  delay: number;
}) {
  const isMain = mode === "main";
  const [distanceLabelRaw, distanceNameRaw] = event.distance
    .split("·")
    .map((value) => value.trim());
  const distanceLabel = distanceLabelRaw ?? event.distance;
  const distanceName = distanceNameRaw ?? event.title.replace(/\n/g, " ");

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 46, scale: 1 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1], delay }}
        // whileHover={isMain ? { y: -6, scale: 1.01 } : undefined}
        className={cn(
          "group absolute overflow-hidden rounded-[20px]   text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] md:rounded-3xl border-4 border-white/20",
          className,
        )}
      >
        <img
          src={event.image}
          alt={`${event.title.replace(/\n/g, " ")} flyer`}
          className={`absolute inset-0 h-full w-full object-cover saturate-[1.02] transition-transform duration-500 `}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_7%,rgba(255,255,255,0.2),transparent_34%),linear-gradient(180deg,rgba(4,4,6,0.22)_0%,rgba(5,5,7,0.82)_63%,rgba(5,5,7,0.95)_100%)]" />

        <div
          className={cn(
            "relative z-10 flex h-full flex-col justify-between p-4 md:p-5 md:px-10 md:py-6",
          )}
        >
          <div className="relative h-full">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex  min-w-[250px] flex-col items-center text-center">
              <p className="text-[48px] leading-none font-black text-white md:text-[124px]">
                {event.startTime}
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/62 md:mt-2 md:text-[24px] md:tracking-[0.1em]">
                START TIME
              </p>
              <p className="mt-3 text-xs font-medium text-white/88 md:mt-10 md:text-[28px]">
                {event.attendeesLabel}
              </p>
              <AvatarsRow
                avatars={event.avatars}
                className="mt-1 justify-center md:mt-3"
              />
              <div className="mt-2 rounded-full border border-orange-200/30 bg-gradient-to-r from-orange-400/85 to-fuchsia-500/85 px-2.5 py-1 text-[11px] font-medium text-white shadow-[0_10px_24px_rgba(255,106,52,0.33)] backdrop-blur-md md:mt-4 md:px-5 md:py-2 md:text-[24px]">
                {event.startsIn}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 space-y-1 md:bottom-1 md:space-y-2">
              <p className="text-xs tracking-[0.01em] text-white/72 md:text-[24px]">
                ⚡ {distanceLabel}
              </p>
              <p className="text-lg font-medium text-white/88 md:text-[38px]">
                {distanceName}
              </p>
            </div>
          </div>
        </div>
      </motion.article>
      <img
        src={event.image}
        alt={`${event.title.replace(/\n/g, " ")} flyer`}
        className={`absolute inset-0 h-full w-full object-cover saturate-[1.02] transition-transform duration-500 blur-xl ${className} !z-0`}
      />
    </>
  );
}

export function TodayNearYouSection() {
  return (
    <section className="relative w-full overflow-hidden pb-20 md:pb-24 lg:pb-30 flex items-center justify-center mx-auto">
      <div className="mx-auto w-full max-w-[1480px]">
        <div className="relative mx-auto h-137.5 w-full max-w-60 md:mt-16 md:h-160 md:max-w-none md:mx-auto">
          <EventFlyer
            event={TODAY_EVENTS[1]}
            mode="secondary"
            delay={0.14}
            className="left-1/2 top-[16%] z-10 h-[338px] w-[230px] -translate-x-[106%] -rotate-[3.3deg] opacity-[0.94] md:left-[45%] md:top-[96px] md:h-[572px] md:w-[820px] md:translate-x-0 md:-rotate-[3.9deg]"
          />

          <EventFlyer
            event={TODAY_EVENTS[2]}
            mode="secondary"
            delay={0.22}
            className="left-1/2 top-[19%] z-10 h-[334px] w-[228px] -translate-x-[3%] rotate-[3.5deg]  md:left-[25%] md:top-[96px] md:h-[572px] md:w-[820px] md:translate-x-0 md:-rotate-[-3.2deg]"
          />

          <EventFlyer
            event={TODAY_EVENTS[0]}
            mode="main"
            delay={0.06}
            className="left-1/2 top-[10%] z-20 h-[412px] w-[282px] -translate-x-[55%] -rotate-[1deg] md:left-[0%] md:top-[96px] md:h-[572px] md:w-[820px] md:translate-x-0 md:-rotate-[1.2deg]"
          />
        </div>
      </div>
    </section>
  );
}
