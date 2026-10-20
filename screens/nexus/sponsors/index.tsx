import NexusReveal from "@/components/common/nexusReveal";
import NexusSectionHeader from "@/components/common/nexusSectionHeader";
import { SPONSOR_LOGOS } from "@/constants/sponsors";
import ExistingSponsors from "@/screens/sponsors";
import Image from "next/image";

const activationTypes = [
  "bebidas",
  "moda",
  "festivales",
  "campañas",
  "activaciones",
  "monetización adicional",
];

export const NexusSponsors = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 md:py-28 lg:py-36">
      <div className="relative mx-auto flex w-full max-w-[1220px] flex-col gap-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <NexusSectionHeader
            eyebrow="Sponsors"
            title={
              <>
                Abre espacio a marcas <span className="text-white/42">y colaboraciones</span>
              </>
            }
            description="Conecta eventos con marcas, campañas y activaciones sin sacar la operación de Nexus. Sponsors de bebida, moda, festivales o experiencias dentro de la noche."
            titleClassName="max-w-[13ch]"
          />
          <NexusReveal delay={0.08} className="flex flex-wrap gap-2 lg:justify-end">
            {activationTypes.map((type) => (
              <span
                key={type}
                className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-white/42"
              >
                {type}
              </span>
            ))}
          </NexusReveal>
        </div>

        <NexusReveal y={34}>
          <div className="overflow-hidden border-y border-white/10 py-3">
            <div className="hidden md:block">
              <ExistingSponsors />
            </div>
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {SPONSOR_LOGOS.map((logo) => (
                <div
                  key={logo.description}
                  className="flex min-h-24 items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/[0.025] p-4"
                >
                  <Image
                    src={logo.image}
                    alt={logo.description}
                    width={180}
                    height={72}
                    className={logo.className}
                  />
                </div>
              ))}
            </div>
          </div>
        </NexusReveal>
      </div>
    </section>
  );
};

export default NexusSponsors;
