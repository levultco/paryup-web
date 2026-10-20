import NexusReveal from "@/components/common/nexusReveal";

const operatingLayers = [
  "eventos",
  "entradas",
  "puerta",
  "equipo",
  "promotores",
  "datos",
  "álbumes",
  "comunidad",
];

export const NexusIntro = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-28 sm:px-6 md:py-40 lg:py-48">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.035] blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-[1260px] gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <NexusReveal className="max-w-[58rem]">
          <p className="mb-6 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/42">
            Nexus para clubs
          </p>
          <h2
            className="max-w-[11ch] text-balance font-semibold leading-[0.9] tracking-[-0.06em] text-white"
            style={{ fontSize: "clamp(3.6rem, 9vw, 8.4rem)" }}
          >
            La capa operativa de la noche.
          </h2>
          <p className="mt-8 max-w-[47ch] text-pretty text-lg leading-relaxed text-white/58 md:text-xl">
            Nexus conecta eventos, entradas, equipo, accesos, datos y comunidad
            para que el club funcione como una organización real, no como una
            colección de chats, listas y capturas.
          </p>
        </NexusReveal>

        <NexusReveal delay={0.08} y={46}>
          <div className="relative mx-auto aspect-square w-full max-w-[35rem]">
            <div className="absolute inset-0 rounded-full border border-white/[0.055]" />
            <div className="absolute inset-[12%] rounded-full border border-white/[0.075]" />
            <div className="absolute inset-[24%] rounded-full border border-white/10" />

            <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/12 bg-white/[0.045] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-white/38">
                Nexus
              </p>
              <p className="mt-2 max-w-[10ch] text-2xl font-semibold leading-none tracking-[-0.05em] text-white">
                club layer
              </p>
            </div>

            {operatingLayers.map((layer, index) => {
              const positions = [
                "left-[8%] top-[16%]",
                "left-[43%] top-[3%]",
                "right-[8%] top-[17%]",
                "right-[1%] top-[47%]",
                "right-[13%] bottom-[10%]",
                "left-[43%] bottom-[1%]",
                "left-[9%] bottom-[11%]",
                "left-[1%] top-[47%]",
              ];

              return (
                <div
                  key={layer}
                  className={`absolute ${positions[index]} rounded-full border border-white/10 bg-background/80 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/56 shadow-[0_18px_60px_rgba(0,0,0,0.24)]`}
                >
                  {layer}
                </div>
              );
            })}

            <div className="absolute inset-x-[18%] top-1/2 h-px bg-gradient-to-r from-transparent via-white/16 to-transparent" />
            <div className="absolute inset-y-[18%] left-1/2 w-px bg-gradient-to-b from-transparent via-white/16 to-transparent" />
          </div>
        </NexusReveal>
      </div>
    </section>
  );
};

export default NexusIntro;
