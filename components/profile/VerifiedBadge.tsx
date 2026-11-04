"use client";

import { useId } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { BadgeType } from "@/lib/social";

// Mismo escudo y colores que `VerifiedBadge` de la app: dorado = verificado, azul = pro.
const BADGES: Record<BadgeType, { color: string; labelKey: string }> = {
  verified: { color: "#FFC107", labelKey: "badge.verified" },
  pro: { color: "#1E90FF", labelKey: "badge.pro" },
};

const SHIELD =
  "M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816z";
const CHECK =
  "M9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z";

export function VerifiedBadge({
  type,
  className = "h-[22px] w-[22px]",
}: {
  type: BadgeType;
  className?: string;
}) {
  const { t } = useI18n();
  const { color, labelKey } = BADGES[type];
  const label = t(labelKey);
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 22 22"
      className={className}
    >
      <title>{label}</title>
      <path d={SHIELD} fill={color} />
      <path d={CHECK} fill="#ffffff" />
    </svg>
  );
}

/** Sello decorativo (mismo escudo que la insignia) con color propio y una pasada de brillo, para listas de beneficios. */
export function SealCheck({
  color = "#30d158",
  className = "h-6 w-6",
  delay = 0,
}: {
  color?: string;
  className?: string;
  /** Retraso (s) de la pasada de brillo, para escalonarla entre sellos. */
  delay?: number;
}) {
  const id = useId();
  return (
    <svg aria-hidden viewBox="0 0 22 22" className={className}>
      <defs>
        <clipPath id={`${id}-c`}>
          <path d={SHIELD} />
        </clipPath>
        <linearGradient id={`${id}-g`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={SHIELD} fill={color} />
      <g clipPath={`url(#${id}-c)`}>
        <g transform="rotate(20 11 11)">
          <rect
            className="seal-glint"
            x="0"
            y="-9"
            width="8"
            height="40"
            fill={`url(#${id}-g)`}
            style={{ animationDelay: `${delay}s` }}
          />
        </g>
      </g>
      <path d={CHECK} fill="#ffffff" />
    </svg>
  );
}
