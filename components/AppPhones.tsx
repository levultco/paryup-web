import Image from "next/image";
import PhoneFrame from "@/components/PhoneFrame";

type Layout = { wrap: string; phones: string[] };

// Cada card coloca sus móviles de una forma distinta. Las clases van literales para que
// Tailwind las detecte; `--pr` es el redondeo del marco según el tamaño del móvil.
const LAYOUTS = {
  center: {
    wrap: "justify-center",
    phones: ["w-[min(320px,64%)] [--pr:60px]"],
  },
  right: {
    wrap: "justify-end pr-[6%]",
    phones: ["w-[min(340px,66%)] rotate-[5deg] translate-y-6 [--pr:62px]"],
  },
  tiltLeft: {
    wrap: "justify-center",
    phones: ["w-[min(300px,62%)] -rotate-[7deg] translate-y-4 [--pr:58px]"],
  },
  tiltRight: {
    wrap: "justify-center",
    phones: ["w-[min(300px,62%)] rotate-[7deg] translate-y-4 [--pr:58px]"],
  },
  left: {
    wrap: "justify-start pl-[6%]",
    phones: ["w-[min(300px,60%)] -rotate-[3deg] translate-y-10 [--pr:58px]"],
  },
  floatLeft: {
    wrap: "justify-center",
    phones: [
      "w-[min(300px,60%)] [transform:perspective(1100px)_rotateY(-18deg)_rotateX(4deg)] [--pr:58px]",
    ],
  },
  floatRight: {
    wrap: "justify-center",
    phones: [
      "w-[min(300px,60%)] [transform:perspective(1100px)_rotateY(18deg)_rotateX(4deg)] [--pr:58px]",
    ],
  },
  bleedRight: {
    wrap: "justify-end -mr-10",
    phones: ["w-[min(320px,64%)] rotate-[6deg] translate-y-8 [--pr:60px]"],
  },
  low: {
    wrap: "justify-center",
    phones: ["w-[min(250px,52%)] translate-y-24 [--pr:48px]"],
  },
  // Tres móviles
  fan: {
    wrap: "justify-center",
    phones: [
      "w-[min(290px,31%)] -rotate-[8deg] translate-y-12 -mr-[3%] [--pr:54px]",
      "w-[min(290px,31%)] z-10 translate-y-2 [--pr:54px]",
      "w-[min(290px,31%)] rotate-[8deg] translate-y-12 -ml-[3%] [--pr:54px]",
    ],
  },
  // Sin solapar: el central al frente y arriba, los laterales más abajo a cada lado.
  steps: {
    wrap: "justify-center gap-5 md:gap-8",
    phones: [
      "w-[min(280px,31%)] translate-y-24 [--pr:54px]",
      "w-[min(280px,31%)] z-10 [--pr:54px]",
      "w-[min(280px,31%)] translate-y-12 [--pr:54px]",
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
  return (
    <div className={`flex h-full w-full items-start gap-4 md:gap-6 ${layout.wrap}`}>
      {screens.map((src, i) => (
        <PhoneFrame
          key={src}
          glow={false}
          className={`shrink-0 ${layout.phones[i] ?? layout.phones[0]}`}
        >
          <Image
            src={src}
            alt={alt}
            width={920}
            height={2000}
            sizes="300px"
            className="h-auto w-full"
          />
        </PhoneFrame>
      ))}
    </div>
  );
}
