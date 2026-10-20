import { FeatureCard } from "./FeatureCard";

type DiscoverFeatureCardProps = {
  className?: string;
};

export function DiscoverFeatureCard({ className }: DiscoverFeatureCardProps) {
  return (
    <FeatureCard
      className={className}
      variant="horizontal"
      textPosition="left"
      title="Previsualiza los eventos en el mapa"
      description="Mira en el mapa qué eventos hay cerca de ti, échales un vistazo antes de ir y decide en segundos."
      imageSlotClassName="h-[280px] md:h-[340px]"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 bottom-[-8%] h-[58%] bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.14),transparent_62%)] blur-3xl" />

        <div className="absolute left-[18%] top-[52%] z-10 h-[68%] w-[31%] -translate-y-1/2 -rotate-[10deg] rounded-[24px] border border-white/10 bg-[#17181f] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.28)] saturate-[0.82]">
          <img
            src="https://fourvenues.com/cdn-cgi/imagedelivery/kWuoTchaMsk7Xnc_FNem7A/8d6071c0-366f-4b3b-a5aa-2d742d94f000/w=1350"
            alt=""
            className="h-full w-full rounded-[18px] object-cover"
          />
        </div>

        <div className="absolute right-[18%] top-[48%] z-10 h-[68%] w-[31%] -translate-y-1/2 rotate-[10deg] rounded-[24px] border border-white/10 bg-[#171821] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.28)] saturate-[0.82]">
          <img
            src="https://fourvenues.com/cdn-cgi/imagedelivery/kWuoTchaMsk7Xnc_FNem7A/6a5b9b81-02cc-483b-8d80-7d128b254e00/w=1350"
            alt=""
            className="h-full w-full rounded-[18px] object-cover"
          />
        </div>

        <div className="absolute left-1/2 top-1/2 z-20 h-[88%] w-[48%] md:w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/12 bg-[#1b1b22] p-2.5 shadow-[0_34px_100px_rgba(0,0,0,0.42)]">
          <img
            src="https://fourvenues.com/cdn-cgi/imagedelivery/kWuoTchaMsk7Xnc_FNem7A/83202dbf-0003-48ec-9f43-d8dbf61aec00/w=1350"
            alt=""
            className="h-full w-full rounded-[22px] object-cover"
          />
        </div>
      </div>
    </FeatureCard>
  );
}
