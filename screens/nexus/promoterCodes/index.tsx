import NexusReveal from "@/components/common/nexusReveal";
import NexusSectionHeader from "@/components/common/nexusSectionHeader";

const flowSteps = [
  {
    number: "01",
    title: "Promotor comparte código",
    detail: "MARTA24 y link propio del evento",
  },
  {
    number: "02",
    title: "Usuario compra entrada",
    detail: "la venta queda conectada al código",
  },
  {
    number: "03",
    title: "Usuario gana puntos",
    detail: "el código también es ventaja en la app",
  },
  {
    number: "04",
    title: "Club mide ventas",
    detail: "evento, tramo, entrada y asistencia real",
  },
  {
    number: "05",
    title: "Promotor ve resultados",
    detail: "ranking, objetivo, recompensa o comisión",
  },
];

export const PromoterCodes = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 md:py-32 lg:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,176,5,0.07),transparent_30%),radial-gradient(circle_at_88%_76%,rgba(145,255,244,0.055),transparent_27%)]" />

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-14">
        <NexusSectionHeader
          align="center"
          eyebrow="Promoter codes"
          title={
            <>
              Promotores medibles, <span className="text-white/42">no listas perdidas</span>
            </>
          }
          description="Cada código deja rastro: quién vendió, quién compró y qué usuario ganó puntos por entrar desde ese promotor. El boca a boca se convierte en una línea de negocio medible."
          titleClassName="max-w-[13ch]"
        />

        <NexusReveal y={58}>
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.025] p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-x-8 top-[9.5rem] hidden h-px bg-gradient-to-r from-transparent via-white/18 to-transparent lg:block" />
            <div className="grid gap-4 lg:grid-cols-5">
              {flowSteps.map((step, index) => (
                <article
                  key={step.number}
                  className="relative min-h-[18rem] rounded-[1.6rem] border border-white/10 bg-background/70 p-5"
                >
                  <p className="font-mono text-sm font-semibold text-white/32">
                    {step.number}
                  </p>
                  <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-white/[0.045] font-mono text-sm text-white/58">
                    {index + 1}
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold leading-[0.98] tracking-[-0.05em] text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/44">
                    {step.detail}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr_0.8fr]">
              <div className="rounded-[1.6rem] border border-white/10 bg-black/32 p-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/36">
                  código activo
                </p>
                <p className="mt-4 font-mono text-4xl font-semibold tracking-[-0.08em] text-white">
                  MARTA24
                </p>
                <p className="mt-2 text-sm text-white/42">link propio + código propio</p>
              </div>
              <div className="rounded-[1.6rem] border border-emerald-300/16 bg-emerald-300/[0.065] p-5 text-center">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-emerald-50/50">
                  incentivo usuario
                </p>
                <p className="mt-4 font-mono text-5xl font-semibold tracking-[-0.1em] text-white">
                  +120 puntos
                </p>
                <p className="mx-auto mt-2 max-w-[34ch] text-sm text-white/50">
                  comprar con código crea una ventaja para el usuario y una señal
                  atribuible para el club.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-black/32 p-5 text-right lg:text-left">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/36">
                  atribuido
                </p>
                <p className="mt-4 font-mono text-4xl font-semibold tracking-[-0.08em] text-white">
                  9.4k€
                </p>
                <p className="mt-2 text-sm text-white/42">ventas por evento trazadas</p>
              </div>
            </div>
          </div>
        </NexusReveal>
      </div>
    </section>
  );
};

export default PromoterCodes;
