import { FooterScreen } from "@/screens/footer";
import { AccessControl } from "@/screens/nexus/access-control";
import { Albums } from "@/screens/nexus/albums";
import { CreateEvents } from "@/screens/nexus/create-events";
import { EventSourceScreen } from "@/screens/nexus/eventSource";
import { FinalCta } from "@/screens/nexus/final-cta";
import { FlowScreen } from "@/screens/nexus/flow";
import { HomeScreen } from "@/screens/nexus/home";
import { Insights } from "@/screens/nexus/insights";
import { OperationalLayer } from "@/screens/nexus/operational-layer";
import { Pricing } from "@/screens/nexus/pricing";
import { Promoters } from "@/screens/nexus/promoters";
import { Team } from "@/screens/nexus/team";

export default function NexusPage() {
  return (
    <div className="relative">
      <HomeScreen />
      <FlowScreen />
      <EventSourceScreen />
      <OperationalLayer />
      <CreateEvents />
      <AccessControl />
      <Promoters />
      <Team />
      <Insights />
      <Albums />
      <Pricing />
      <FinalCta />
      <div className="w-full overflow-hidden">
        <FooterScreen />
      </div>
    </div>
  );
}
