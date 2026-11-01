"use client";

import { useState } from "react";
import BackstageAccessForm from "@/components/BackstageAccessForm";
import BackstageHero from "@/components/BackstageHero";
import BackstageModes from "@/components/BackstageModes";
import {
  StepChoose,
  StepRequest,
  StepSell,
  VisEvents,
  VisProfile,
  VisPromoters,
  VisStats,
  VisTeam,
  VisTickets,
} from "@/components/BackstageVisuals";
import Faq from "@/components/Faq";
import Features from "@/components/Features";
import FinalCta from "@/components/FinalCta";
import HowItWorks from "@/components/HowItWorks";
import Manifesto from "@/components/Manifesto";
import type { Feature } from "@/components/content";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { ArrowRightIcon } from "@/components/icons/solar";

const STEPS = [
  { n: "01", visual: <StepRequest /> },
  { n: "02", visual: <StepChoose /> },
  { n: "03", visual: <StepSell /> },
];

const FEATURES: Feature[] = [
  { id: "eventos", slot: "", span: "md:col-span-7", visual: <VisEvents /> },
  { id: "entradas", slot: "", span: "md:col-span-5", visual: <VisTickets /> },
  { id: "equipo", slot: "", span: "md:col-span-5", visual: <VisTeam /> },
  {
    id: "promotores",
    slot: "",
    span: "md:col-span-7",
    visual: <VisPromoters />,
  },
  { id: "stats", slot: "", span: "md:col-span-6", visual: <VisStats /> },
  { id: "perfil", slot: "", span: "md:col-span-6", visual: <VisProfile /> },
];

/** Landing de Backstage: hero + secciones con el mismo diseño que la portada de ParyUp. */
export default function BackstageLanding() {
  const { t } = useI18n();
  const [formOpen, setFormOpen] = useState(false);
  const request = () => setFormOpen(true);

  return (
    <main>
      <BackstageHero onRequest={request} />
      <Manifesto
        eyebrowKey="backstage.manifesto.eyebrow"
        textKey="backstage.manifesto.text"
      />
      <HowItWorks
        id="como"
        steps={STEPS}
        keys={{
          eyebrow: "backstage.how.eyebrow",
          title1: "backstage.how.title1",
          title2: "backstage.how.title2",
          step: "backstage.how.step",
          stepPrefix: "backstage.step",
        }}
      />
      <Features
        items={FEATURES}
        keys={{
          head1: "backstage.features.head1",
          head2: "backstage.features.head2",
          sub: "backstage.features.sub",
          prefix: "backstage.feature",
        }}
      />
      <BackstageModes />
      <Faq
        ids={[1, 2, 3, 4, 5]}
        keys={{
          title1: "backstage.faq.title1",
          title2: "backstage.faq.title2",
          sub: "backstage.faq.sub",
          prefix: "backstage.faq",
        }}
      />
      <FinalCta
        keys={{
          line1: "backstage.cta.line1",
          line2: "backstage.cta.line2",
          text: "backstage.cta.text",
        }}
        actions={
          <button
            type="button"
            onClick={request}
            className="relative mt-10 inline-flex h-[58px] items-center gap-3 rounded-full bg-white px-7 text-[17px] font-semibold text-black transition-[transform,translate,scale,box-shadow] duration-300 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-[0_14px_44px_-12px_rgba(255,255,255,0.55)] active:translate-y-0 active:scale-[0.97]"
          >
            {t("backstage.cta")}
            <ArrowRightIcon aria-hidden className="size-5" />
          </button>
        }
      />
      <BackstageAccessForm open={formOpen} onClose={() => setFormOpen(false)} />
    </main>
  );
}
