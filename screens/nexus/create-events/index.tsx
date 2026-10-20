import NexusReveal from "@/components/common/nexusReveal";
import { NexusChapter, NexusShell } from "@/components/nexus";
import Image from "next/image";

const ticketTypes = [
  ["General", "18€"],
  ["VIP", "120€"],
  ["Lista", "hasta 01:00"],
];

export const CreateEvents = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 md:py-36 lg:py-44">
      <div className="relative mx-auto flex w-full max-w-[1240px] flex-col gap-12">
        <NexusChapter
          align="center"
          eyebrow="Eventos"
          title={
            <>
              Crea eventos que se entienden <span className="text-white/42">y se venden</span>
            </>
          }
          description="Publica una noche completa con entradas, horarios, salas y detalles listos para convertir visitas en compras. Lo que crea el club acaba siendo una experiencia visible y comprable."
          titleClassName="max-w-[15ch]"
        />

        <NexusReveal y={52}>
          <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
            <NexusShell innerClassName="p-5 sm:p-7 min-h-full">
              <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-6">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/36">
                    Event builder
                  </p>
                  <h3 className="mt-4 max-w-[10ch] text-5xl font-semibold leading-[0.9] tracking-[-0.08em] text-white md:text-6xl">
                    Midnight Affairs
                  </h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-black">
                  visible
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/34">Fecha</p>
                  <p className="mt-1 font-semibold text-white/78">Vie 14 jun</p>
                </div>
                <div>
                  <p className="text-white/34">Sala</p>
                  <p className="mt-1 font-semibold text-white/78">Bruma Club</p>
                </div>
                <div>
                  <p className="text-white/34">Apertura</p>
                  <p className="mt-1 font-semibold text-white/78">23:30</p>
                </div>
                <div>
                  <p className="text-white/34">Estado</p>
                  <p className="mt-1 font-semibold text-white/78">venta anticipada</p>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                {ticketTypes.map(([name, value]) => (
                  <div key={name} className="flex items-center justify-between border-t border-white/10 pt-3">
                    <p className="font-semibold text-white/70">{name}</p>
                    <p className="font-mono text-white/58">{value}</p>
                  </div>
                ))}
              </div>
            </NexusShell>

            <div className="relative min-h-[34rem] overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#070708] p-4 sm:p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.12),transparent_34%)]" />
              <div className="relative mx-auto max-w-[22rem] rounded-[2rem] border border-white/12 bg-black p-3">
                <div className="relative min-h-[27rem] overflow-hidden rounded-[1.45rem]">
                  <Image src="/hero/8.jpg" alt="Preview nocturna del evento" fill sizes="360px" className="object-cover opacity-80 grayscale" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/18 to-black/78" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-white/52">
                      Bruma Club
                    </p>
                    <h4 className="mt-3 max-w-[9ch] text-5xl font-semibold leading-[0.86] tracking-[-0.08em] text-white">
                      Midnight Affairs
                    </h4>
                    <button className="mt-5 w-full rounded-full bg-white px-5 py-3 font-semibold text-black">
                      Comprar entrada
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </NexusReveal>
      </div>
    </section>
  );
};

export default CreateEvents;
