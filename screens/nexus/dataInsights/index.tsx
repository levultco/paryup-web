import NexusReveal from "@/components/common/nexusReveal";
import NexusSectionHeader from "@/components/common/nexusSectionHeader";

const metrics = [
  {
    label: "Ocupación real",
    value: "82%",
    detail: "media de asistencia frente a entradas vendidas",
  },
  {
    label: "Mejor hora de venta",
    value: "19:40",
    detail: "pico de compra anticipada antes del evento",
  },
  {
    label: "Usuarios recurrentes",
    value: "42%",
    detail: "asistentes que vuelven a comprar o entrar",
  },
];

const decisions = [
  "Sube el segundo tramo antes de las 21:00.",
  "Refuerza a promotores que traen asistencia real, no solo clicks.",
  "Separa VIP, lista y general por conversión y hora de entrada.",
];

export const DataInsights = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 md:py-32 lg:py-44">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto grid w-full max-w-[1220px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <NexusSectionHeader
          eyebrow="Data insights"
          title={
            <>
              Datos que sirven <span className="text-white/42">para decidir</span>
            </>
          }
          description="No mires números por mirar. Entiende qué evento funciona, qué promotor trae gente y cuándo se vende mejor. Ventas, ocupación, conversión y asistencia real en pocas señales accionables."
        />

        <NexusReveal y={48}>
          <div className="grid gap-8">
            <div className="grid gap-6 sm:grid-cols-3">
              {metrics.map((metric) => (
                <article key={metric.label} className="border-t border-white/10 pt-5">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-white/36">
                    {metric.label}
                  </p>
                  <p className="mt-5 font-mono text-6xl font-semibold leading-none tracking-[-0.1em] text-white md:text-7xl">
                    {metric.value}
                  </p>
                  <p className="mt-4 max-w-[23ch] text-sm leading-relaxed text-white/44">
                    {metric.detail}
                  </p>
                </article>
              ))}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
              <p className="text-sm font-semibold text-white/82">
                Decisiones que salen de esos datos
              </p>
              <div className="mt-5 divide-y divide-white/10">
                {decisions.map((decision, index) => (
                  <div key={decision} className="grid grid-cols-[2rem_1fr] gap-4 py-4">
                    <p className="font-mono text-sm text-white/32">0{index + 1}</p>
                    <p className="text-base leading-relaxed text-white/62">{decision}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </NexusReveal>
      </div>
    </section>
  );
};

export default DataInsights;
