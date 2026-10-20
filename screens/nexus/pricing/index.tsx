import NexusReveal from "@/components/common/nexusReveal";
import { NexusChapter } from "@/components/nexus";

const planFeatures = [
  "eventos y entradas",
  "roles de equipo",
  "promotores y códigos",
  "check-in QR",
  "estadísticas",
  "álbumes de fotos",
  "soporte",
];

export const Pricing = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 md:py-36 lg:py-48">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.065),transparent_34%)]" />

      <div className="relative mx-auto grid w-full max-w-[1120px] gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <NexusChapter
          eyebrow="Modelo"
          title={
            <>
              Empieza con <span className="text-white/42">tu club</span>
            </>
          }
          description="Modelo flexible según volumen, eventos y necesidades. Lo importante es entender cómo opera tu sala y montar Nexus alrededor de tu noche real."
        />

        <NexusReveal y={52}>
          <article className="rounded-[2.35rem] border border-white/10 bg-white/[0.035] p-2">
            <div className="rounded-[1.9rem] bg-[#080809] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-8 md:p-10">
              <div className="flex flex-col gap-10 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/38">
                    Acceso para organizaciones
                  </p>
                  <p className="mt-6 max-w-[9ch] text-5xl font-semibold leading-[0.92] tracking-[-0.08em] text-white md:text-6xl">
                    Hablemos de tu club
                  </p>
                  <p className="mt-4 max-w-[32ch] text-sm leading-relaxed text-white/46">
                    Eventos, entradas, accesos, equipo, promotores, álbumes y datos en un único flujo.
                  </p>
                </div>
                <p className="max-w-[17rem] text-sm leading-relaxed text-white/48">
                  Sin planes inventados ni columnas vacías. Definimos el modelo según volumen y operación.
                </p>
              </div>

              <div className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {planFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                    <span className="text-sm font-semibold text-white/68">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-[42ch] text-sm leading-relaxed text-white/38">
                  Comisiones por entrada o módulos avanzados pueden variar según volumen.
                </p>
                <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.98]">
                  Solicitar acceso
                </button>
              </div>
            </div>
          </article>
        </NexusReveal>
      </div>
    </section>
  );
};

export default Pricing;
