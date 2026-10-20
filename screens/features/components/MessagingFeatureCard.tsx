import Image from "next/image";
import { FeatureCard } from "./FeatureCard";

type MessagingFeatureCardProps = {
  className?: string;
};

export function MessagingFeatureCard({ className }: MessagingFeatureCardProps) {
  return (
    <FeatureCard
      className={className}
      variant="vertical"
      textPosition="bottom"
      title="Chat social"
      description="Grupos y mensajes directos para hablar con tu gente."
      imageSlotClassName="h-[280px] md:h-[320px] lg:h-full"
      isRelative={false}
      // textClassName="mx-auto text-center text-xs"
    >
      <div className="absolute -top-30 -right-40 h-[520px] w-[520px]">
        <Image
          src="/features/message.png"
          alt=""
          fill
          loading="lazy"
          sizes="(max-width: 768px) 90vw, 520px"
          className="object-contain"
        />
      </div>
    </FeatureCard>
  );
}
