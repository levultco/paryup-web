import NexusReveal from "@/components/common/nexusReveal";
import { NexusChapter } from "@/components/nexus";

const roles = [
  ["Puerta", "valida accesos"],
  ["Caja", "controla ventas"],
  ["Promotor", "ve sus resultados"],
  ["Manager", "coordina la noche"],
  ["Fotógrafo", "sube álbumes"],
  ["Admin", "control general"],
];

export const Team = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 md:py-32 lg:py-44">
      <div className="relative mx-auto grid w-full max-w-[1220px] gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <NexusChapter
          eyebrow="Equipo"
          title={
            <>
              Cada persona ve <span className="text-white/42">lo que necesita</span>
            </>
          }
          description="Puerta valida accesos. Caja controla ventas. Promotores ven sus resultados. El equipo trabaja sin cruzarse ni romper el flujo."
        />

        <NexusReveal y={52}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map(([role, task], index) => (
              <article key={role} className="min-h-[12rem] rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5">
                <p className="font-mono text-xs text-white/30">0{index + 1}</p>
                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.05em] text-white">
                  {role}
                </h3>
                <p className="mt-2 text-sm text-white/44">{task}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-[52ch] border-t border-white/10 pt-5 text-sm leading-relaxed text-white/46">
            La clave no es crear perfiles por crear. Es que cada punto de la noche tenga acceso a su tarea concreta, desde puerta hasta fotos, sin mezclar operación.
          </p>
        </NexusReveal>
      </div>
    </section>
  );
};

export default Team;
