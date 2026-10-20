import React from "react";

import { ZapIcon } from "@/public/icons/icons";
import { Lock, ShieldAlert, Users } from "lucide-react";
import BorderBeam from "../borderBeam";

export interface EventFlyerItem {
  image: string;
  title: string;
  handle?: string;
  date?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
  badges?: string[];
}

type EventFlyerCardProps = {
  item: EventFlyerItem;
  className?: string;
  style?: React.CSSProperties;
  disableGlassEffects?: boolean;
  tabIndex?: number;
  role?: React.AriaRole;
  ariaLabel?: string;
  onMouseMove?: React.MouseEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
};

export const EventFlyerCard = ({
  item,
  className = "",
  style,
  disableGlassEffects = false,
  tabIndex,
  role,
  ariaLabel,
  onMouseMove,
  onClick,
  onKeyDown,
}: EventFlyerCardProps) => {
  return (
    <article
      onMouseMove={onMouseMove}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      role={role}
      aria-label={ariaLabel}
      className={`group relative flex min-h-[23rem] cursor-pointer flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#0f1113] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bcf6e]/60 ${className}`}
      style={
        {
          "--card-border": item.borderColor || "transparent",
          "--spotlight-color": "rgba(255,255,255,0.09)",
          ...style,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 "
        style={{
          background:
            item.gradient ||
            "linear-gradient(135deg, rgba(139,207,110,0.2), rgba(18,18,18,0.96))",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/70" />

      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 "
        style={{
          background:
            "radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)",
        }}
      />

      {item.badges?.length ? (
        <div className="absolute left-5 top-5 z-30 flex max-w-[62%] flex-wrap gap-2 sm:left-4 sm:top-5">
          {item.badges.map((badge) => (
            // <BorderBeam
            //   key={badge}
            //   size="line"
            //   colorVariant="colorful"
            //   brightness={1}
            //   strength={2}
            //   saturation={1}
            // >
              <span
                key={badge}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.13em] border border-[#ff6f00]/5 bg-[#ff6f00]/5 text-[#dcfce7] ${disableGlassEffects ? "" : "backdrop-blur-xl"}`}
              >
              {badge.toLowerCase().includes("privado") ? (
                <Lock className="h-3 w-3" />
              ) : badge.toLowerCase().includes("solo") ? (
                <Users className="h-3 w-3" />
              ) : (
                <ShieldAlert className="h-3 w-3" />
              )}
              {badge}
            </span>
            // </BorderBeam>
          ))}
        </div>
      ) : null}

      <div className="relative z-10 flex-1 p-2 sm:p-2">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="h-full w-full rounded-[18px] object-cover"
        />
      </div>

      <header className="absolute right-3 top-3 z-30 font-sans sm:right-4 sm:top-4">
        <div className="rounded-2xl border border-black/10 bg-white px-2 py-2 text-black shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
          {item.date && (
            <div className="flex  flex-col items-center text-black">
              <span className="text-[1.05rem] font-semibold leading-tight">
                {item.date.split(" ")[0] || ""}
              </span>
              <span className="text-[0.92rem] leading-tight text-black/75">
                {item.date.split(" ")[1] || ""}
              </span>
            </div>
          )}
        </div>
      </header>

      <footer className="absolute bottom-0 z-20 w-full p-5 text-white sm:p-6">
        <div className="top-mask-fade absolute bottom-0 left-0 right-0" />

        <div className="relative z-20 mb-2 flex items-center">
          <ZapIcon className="mr-2 h-4 w-4 text-[#c0de79]" />
          {item.handle && (
            <span className="text-[0.9rem] font-semibold tracking-wide text-[#c0de79]">
              {item.handle}
            </span>
          )}
        </div>

        <h3 className="relative z-20 m-0 max-w-[24ch] text-[1.35rem] font-semibold leading-tight text-white">
          {item.title}
        </h3>
      </footer>
    </article>
  );
};
