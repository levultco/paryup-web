import NexusReveal from "@/components/common/nexusReveal";
import { NexusChapter } from "@/components/nexus";

const metrics = [
  ["Entradas vendidas", "1.284"],
  ["Mejor entrada", "General"],
  ["Hora de compra", "19:40"],
  ["Promotor top", "Marta"],
];

export const Insights = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 md:py-36 lg:py-48">
      <div className="relative mx-auto grid w-full max-w-[1220px] gap-14 lg:grid-cols-[1fr_1fr] lg:items-end">
        <NexusChapter
          eyebrow="Después de la noche"
          title={
            <>
              No son gráficos. <span className="text-white/42">Son decisiones.</span>
            </>
          }
          description="Entiende qué llenó la sala, qué entrada convirtió mejor y quién trajo público real. Repite mejor lo que funcionó."
        />

        <NexusReveal y={52}>
          <div className="grid gap-8 sm:grid-cols-2">
            {metrics.map(([label, value]) => (
              <article key={label} className="border-t border-white/10 pt-5">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-white/34">{label}</p>
                <p className="mt-5 font-mono text-5xl font-semibold leading-none tracking-[-0.1em] text-white md:text-6xl">{value}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
            <p className="text-sm font-semibold text-white/80">Qué repetir mejor</p>
            <p className="mt-3 text-sm leading-relaxed text-white/46">
              Ajusta horarios, precios, promotores y formatos de entrada según comportamiento real: venta, asistencia, recurrencia y conversión.
            </p>
          </div>
        </NexusReveal>
      </div>
    </section>
  );
};

export default Insights;
