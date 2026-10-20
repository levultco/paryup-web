// import { LinePath } from "@/components/common/linePath";
import { EventsScreen } from "@/screens/events";
import FeatureScreen from "@/screens/features";
import Home from "@/screens/home";
import { IntroScreen } from "@/screens/intro";
import { RouteScreen } from "@/screens/route";
import { SocialScreen } from "@/screens/social";
import { TestimonialsSection } from "@/screens/testimonials";
import { FaqsScreen } from "@/screens/faqs";
import { CTAScreen } from "@/screens/cta";
import { FooterScreen } from "@/screens/footer";
import { HelpInteraction } from "@/components/common/helpInteraction";
import { PresentationScreen } from "@/screens/presentation";

export default function Page() {
  return (
    <div className="relative ">
      <div>
        <Home />

        <PresentationScreen />
        {/* <IntroScreen /> */}

        <FeatureScreen />
        <EventsScreen />
        <SocialScreen />
        <RouteScreen />
        <TestimonialsSection />
        <FaqsScreen />
        <HelpInteraction />
        <div className="w-full overflow-hidden">
          <CTAScreen />
          <FooterScreen />
        </div>
      </div>
    </div>
  );
}
