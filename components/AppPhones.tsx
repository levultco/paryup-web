import Image from "next/image";
import PhoneFrame from "@/components/PhoneFrame";

type Layout = { wrap: string; phones: string[] };

// Cada card coloca sus móviles de una forma distinta. Las clases van literales para que
// Tailwind las detecte; `--pr` es el redondeo del marco según el tamaño del móvil.
const LAYOUTS = {
  center: {
    wrap: "items-start justify-center",
    phones: ["w-[min(380px,72%)] [--pr:66px]"],
  },
  wide: {
    wrap: "items-start justify-center",
    phones: ["w-[min(360px,84%)] [--pr:64px]"],
  },
  right: {
    wrap: "items-start justify-end pr-[6%]",
    phones: ["w-[min(400px,74%)] rotate-[3deg] translate-y-4 [--pr:68px]"],
  },
  tiltLeft: {
    wrap: "items-start justify-center",
    phones: ["w-[min(380px,72%)] -rotate-[3deg] translate-y-4 [--pr:66px]"],
  },
  tiltRight: {
    wrap: "items-start justify-center",
    phones: ["w-[min(380px,72%)] rotate-[3deg] translate-y-4 [--pr:66px]"],
  },
  left: {
    wrap: "items-start justify-start pl-[6%]",
    phones: ["w-[min(380px,72%)] -rotate-[2deg] translate-y-4 [--pr:66px]"],
  },
  floatLeft: {
    wrap: "items-start justify-center",
    phones: [
      "w-[min(380px,72%)] [transform:perspective(1400px)_rotateY(-12deg)_translateY(12px)] [--pr:58px]",
    ],
  },
  floatRight: {
    wrap: "items-start justify-center",
    phones: [
      "w-[min(380px,72%)] [transform:perspective(1400px)_rotateY(12deg)_translateY(12px)] [--pr:58px]",
    ],
  },
  bleedRight: {
    wrap: "items-start justify-end -mr-10",
    phones: ["w-[min(380px,72%)] rotate-[3deg] translate-y-4 [--pr:66px]"],
  },
  low: {
    wrap: "items-start justify-center",
    phones: ["w-[min(250px,52%)] translate-y-24 [--pr:48px]"],
  },
  // Tres móviles
  fan: {
    wrap: "items-start justify-center gap-0",
    phones: [
      "w-[330px] -rotate-[12deg] translate-y-14 -mr-44 [--pr:58px]",
      "w-[330px] z-10 translate-y-2 [--pr:58px]",
      "w-[330px] rotate-[12deg] translate-y-14 -ml-44 [--pr:58px]",
    ],
  },
  // El central al frente y los dos laterales simétricos (mismo ancho y misma altura) detrás.
  steps: {
    wrap: "items-start justify-center gap-0",
    phones: [
      "w-[330px] -rotate-[6deg] translate-y-16 -mr-44 [--pr:58px]",
      "w-[330px] z-10 translate-y-6 [--pr:58px]",
      "w-[330px] rotate-[6deg] translate-y-16 -ml-44 [--pr:58px]",
    ],
  },
} satisfies Record<string, Layout>;

export type PhoneVariant = keyof typeof LAYOUTS;

/** Capturas reales de la app dentro del marco de iPhone de la home, cortadas por abajo. */
export default function AppPhones({
  screens,
  alt,
  variant = "center",
}: {
  screens: string[];
  alt: string;
  variant?: PhoneVariant;
}) {
  const layout: Layout = LAYOUTS[variant];
  // Los móviles sueltos se estiran hasta el fondo de la card; los de varios van pegados abajo.
  const fill = layout.wrap.includes("items-start");
  return (
    <div data-phones className={`flex h-full w-full gap-4 md:gap-6 ${layout.wrap}`}>
      {screens.map((src, i) => (
        <PhoneFrame
          key={src}
          glow={false}
          fill={fill}
          className={`shrink-0 ${fill ? "self-stretch" : ""} ${layout.phones[i] ?? layout.phones[0]}`}
        >
          {fill ? (
            <>
              <Image
                src={src}
                alt={alt}
                fill
                sizes="400px"
                className="object-cover object-top"
              />
            </>
          ) : (
            <Image
              src={src}
              alt={alt}
              width={920}
              height={2000}
              sizes="300px"
              className="h-auto w-full"
            />
          )}
        </PhoneFrame>
      ))}
    </div>
  );
}
