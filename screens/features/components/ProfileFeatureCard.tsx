import Image from "next/image";
import { FeatureCard } from "./FeatureCard";

type ProfileFeatureCardProps = {
  className?: string;
};

const stats = [
  { label: "Fiestas", value: "24" },
  { label: "Seguidores", value: "312" },
  { label: "Siguiendo", value: "184" },
];

const parties = [
  { image: "/album/club-selfie-1.jpg", title: "Neon Night" },
  { image: "/album/club-selfie-2.jpg", title: "After Club" },
  { image: "/album/club-selfie-3.jpg", title: "Beach Session" },
];

export function ProfileFeatureCard({ className }: ProfileFeatureCardProps) {
  return (
    <FeatureCard
      className={className}
      variant="horizontal"
      textPosition="left"
      title="Tu perfil"
      description="Las fiestas a las que has ido, la gente que sigues y quien te sigue, todo en un mismo sitio."
      textClassName="lg:w-[17rem] lg:max-w-none px-2 lg:px-6"
      imageSlotClassName="h-[340px] lg:h-full"
    >
      <div className="absolute inset-0 flex items-center justify-center p-2 md:p-4">
        <div className="w-full max-w-[420px] rounded-[26px] border border-white/10 bg-[#0e0e11] p-3.5 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/15">
              <Image
                src="/features/profile.png"
                alt="Foto de perfil"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="leading-tight">
              <p className="text-base font-semibold text-white">Tu nombre</p>
              <p className="text-xs text-white/45">@tuusuario</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white/[0.05] py-2 text-center"
              >
                <p className="text-lg font-semibold leading-none text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <p className="mb-1.5 mt-3 text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
            Fiestas asistidas
          </p>
          <div className="grid grid-cols-3 gap-2">
            {parties.map((party) => (
              <div
                key={party.title}
                className="relative aspect-[2/1] overflow-hidden rounded-xl border border-white/10"
              >
                <Image
                  src={party.image}
                  alt={party.title}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <p className="absolute inset-x-2 bottom-1.5 truncate text-[10px] font-medium text-white">
                  {party.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FeatureCard>
  );
}
