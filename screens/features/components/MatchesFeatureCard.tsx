import Image from "next/image";
import { Heart } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

type MatchesFeatureCardProps = {
  className?: string;
};

const matches = [
  { name: "Sofía", detail: "Neon Night · hace 2 h", src: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Daniel", detail: "After Club · ayer", src: "https://randomuser.me/api/portraits/men/32.jpg" },
];

export function MatchesFeatureCard({ className }: MatchesFeatureCardProps) {
  return (
    <FeatureCard
      className={className}
      variant="vertical"
      textPosition="top"
      title="Tus matches"
      description="Personas con las que coincidiste en el evento."
      imageSlotClassName="h-[240px] md:h-[260px] lg:h-full"
      textClassName="text-center mx-auto"
      isRelative={false}
    >
      <div className="pointer-events-none absolute inset-x-3 bottom-3 space-y-2">
        {matches.map((match) => (
          <div
            key={match.name}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-2.5"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={match.src}
                alt={match.name}
                fill
                sizes="40px"
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-white">
                {match.name}
              </p>
              <p className="truncate text-[11px] text-white/50">
                {match.detail}
              </p>
            </div>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#ff4d8d] to-[#fa3d1d] text-white">
              <Heart size={14} fill="currentColor" aria-hidden />
            </span>
          </div>
        ))}
      </div>
    </FeatureCard>
  );
}
