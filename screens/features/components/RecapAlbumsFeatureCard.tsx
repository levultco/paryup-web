import Image from "next/image";
import { FeatureCard } from "./FeatureCard";

type RecapAlbumsFeatureCardProps = {
  className?: string;
};

const stats = [
  { label: "Asistentes", value: "312" },
  { label: "Fotos", value: "48" },
  { label: "Amigos", value: "9" },
];

const photos = [
  "/album/club-selfie-2.jpg",
  "/album/club-selfie-3.jpg",
  "/hero/3.jpg",
  "/hero/5.jpg",
];

export function RecapAlbumsFeatureCard({
  className,
}: RecapAlbumsFeatureCardProps) {
  return (
    <FeatureCard
      className={className}
      variant="vertical"
      textPosition="top"
      title="Recap del día"
      description="Un resumen del evento, o de varios, con fotos, gente y momentos para volver a verlos."
      imageSlotClassName="h-[280px] md:h-[320px] lg:h-full"
      textClassName="text-center mx-auto"
      isRelative={false}
    >
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center overflow-hidden px-4">
        <div className="relative h-[430px] w-[260px] translate-y-[14%] rounded-[2.4rem] border border-white/15 bg-black p-2 shadow-[0_30px_80px_rgba(0,0,0,0.5),inset_0_0_0_4px_rgb(40,36,50)]">
          <div className="relative h-full overflow-hidden rounded-[1.9rem] bg-[#0b0b0f] p-3">
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              Recap del día
            </p>
            <div className="relative mt-2 h-32 overflow-hidden rounded-2xl">
              <Image
                src="/album/club-selfie-1.jpg"
                alt="Neon Night"
                fill
                sizes="240px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
              <div className="absolute inset-x-3 bottom-2.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/60">
                  Sáb 10 oct
                </p>
                <p className="text-base font-semibold text-white">Neon Night</p>
              </div>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-1.5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-white/[0.06] py-2 text-center"
                >
                  <p className="text-sm font-semibold leading-none text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[8px] uppercase tracking-[0.1em] text-white/45">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-2.5 grid grid-cols-4 gap-1.5">
              {photos.map((src) => (
                <div
                  key={src}
                  className="relative aspect-square overflow-hidden rounded-lg"
                >
                  <Image src={src} alt="" fill sizes="60px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FeatureCard>
  );
}
