import type { ReactNode } from "react";

// Mismos tonos que la pantalla "Mis entradas" de la app.
export type TicketTone = "light" | "dark" | "muted";

export const TONES: Record<
  TicketTone,
  { bg: string; text: string; sub: string; dash: string; stubBg: string }
> = {
  light: {
    bg: "#FFF3EA",
    text: "#161616",
    sub: "rgba(0,0,0,0.55)",
    dash: "rgba(0,0,0,0.28)",
    stubBg: "#161616",
  },
  dark: {
    bg: "#1B1B1E",
    text: "#FFFFFF",
    sub: "rgba(255,255,255,0.6)",
    dash: "rgba(255,255,255,0.22)",
    stubBg: "rgba(255,255,255,0.1)",
  },
  muted: {
    bg: "#121214",
    text: "rgba(255,255,255,0.88)",
    sub: "rgba(255,255,255,0.5)",
    dash: "rgba(255,255,255,0.14)",
    stubBg: "rgba(255,255,255,0.06)",
  },
};

const NOTCH = 20;
const STUB_WIDTH = 92;

// Las muescas son huecos reales (máscara), no círculos negros encima: así no
// tapan a la entrada de al lado ni dependen del color del fondo.
const notch = (y: "0" | "100%") =>
  `radial-gradient(circle ${NOTCH / 2}px at calc(100% - ${STUB_WIDTH}px) ${y}, #0000 98%, #000)`;
const NOTCH_MASK = {
  WebkitMask: `${notch("0")} top / 100% 51% no-repeat, ${notch("100%")} bottom / 100% 51% no-repeat`,
  mask: `${notch("0")} top / 100% 51% no-repeat, ${notch("100%")} bottom / 100% 51% no-repeat`,
} as const;
const DASHES = 9;

/** Entrada con talón: cuerpo a la izquierda, línea de puntos y muescas. */
export function TicketShape({
  tone,
  height,
  main,
  stub,
  onClick,
  label,
}: {
  tone: TicketTone;
  height: number;
  main: ReactNode;
  stub: ReactNode;
  onClick?: () => void;
  label?: string;
}) {
  const palette = TONES[tone];
  const Root = onClick ? "button" : "div";

  return (
    <Root
      {...(onClick
        ? { type: "button" as const, onClick, "aria-label": label }
        : {})}
      style={{ height, backgroundColor: palette.bg, ...NOTCH_MASK }}
      className={`relative flex w-full rounded-[22px] text-left ${
        onClick
          ? "cursor-pointer transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-white/60 active:opacity-80"
          : ""
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3.5 p-3.5">
        {main}
      </div>
      <div
        style={{ width: STUB_WIDTH }}
        className="flex shrink-0 flex-col items-center justify-center gap-1.5 px-2"
      >
        {stub}
      </div>

      <div
        aria-hidden
        style={{
          right: STUB_WIDTH - 1,
          top: NOTCH,
          bottom: NOTCH,
        }}
        className="pointer-events-none absolute flex w-0.5 flex-col items-center justify-between"
      >
        {Array.from({ length: DASHES }, (_, index) => (
          <span
            key={index}
            style={{ backgroundColor: palette.dash }}
            className="h-[5px] w-0.5 rounded-[1px]"
          />
        ))}
      </div>
    </Root>
  );
}
