import NexusReveal from "@/components/common/nexusReveal";
import { NexusChapter, NexusLine } from "@/components/nexus";

const nodes = [
  { label: "Crear evento", detail: "la noche oficial" },
  { label: "Vender entradas", detail: "anticipada y tipos" },
  { label: "Controlar acceso", detail: "QR en puerta" },
  { label: "Coordinar equipo", detail: "cada persona a lo suyo" },
  { label: "Ver datos", detail: "qué funcionó" },
  { label: "Activar comunidad", detail: "después del cierre" },
];

export const OperationalLayer = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-28 sm:px-6 md:py-40 lg:py-48">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.035] blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-[1240px] gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <NexusChapter
          eyebrow="Nexus"
          title={
            <>
              La capa operativa <span className="text-white/42">de tu noche</span>
            </>
          }
          description="Eventos, entradas, accesos, equipo y público conectados en un solo flujo. Nexus no es otro panel: es la infraestructura que une lo que pasa antes, durante y después del evento."
        />

        <NexusReveal y={48}>
          <div className="relative mx-auto aspect-square w-full max-w-[36rem]">
            <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
            <div className="absolute inset-[13%] rounded-full border border-white/[0.08]" />
            <div className="absolute inset-[27%] rounded-full border border-white/10" />
            <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/12 bg-white/[0.045] text-center">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-white/36">
                flujo único
              </p>
              <p className="mt-2 max-w-[9ch] text-2xl font-semibold leading-none tracking-[-0.05em] text-white">
                club conectado
              </p>
            </div>
            <NexusLine className="absolute left-[18%] right-[18%] top-1/2" />
            <span className="absolute bottom-[18%] top-[18%] left-1/2 w-px bg-gradient-to-b from-transparent via-white/14 to-transparent" />

            {nodes.map((node, index) => {
              const positions = [
                "left-[2%] top-[18%]",
                "left-[38%] top-[1%]",
                "right-[2%] top-[18%]",
                "right-[0%] bottom-[18%]",
                "left-[38%] bottom-[1%]",
                "left-[0%] bottom-[18%]",
              ];

              return (
                <article
                  key={node.label}
                  className={`absolute ${positions[index]} w-[10.5rem] rounded-[1.35rem] border border-white/10 bg-background/85 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.3)]`}
                >
                  <p className="text-sm font-semibold text-white/82">{node.label}</p>
                  <p className="mt-1 text-xs leading-snug text-white/40">{node.detail}</p>
                </article>
              );
            })}
          </div>
        </NexusReveal>
      </div>
    </section>
  );
};

export default OperationalLayer;
