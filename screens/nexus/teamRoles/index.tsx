import NexusReveal from "@/components/common/nexusReveal";
import NexusSectionHeader from "@/components/common/nexusSectionHeader";
import { cn } from "@/lib/utils";

const roles = [
  { role: "Owner / admin", scope: "control total", lane: "Dirección" },
  { role: "Manager", scope: "coordina la noche", lane: "Operación" },
  { role: "Puerta", scope: "QR y aforo", lane: "Acceso" },
  { role: "Caja", scope: "venta en sala", lane: "Taquilla" },
  { role: "Fotógrafo", scope: "álbumes", lane: "Contenido" },
  { role: "Promotor", scope: "códigos y objetivos", lane: "Captación" },
  { role: "Staff", scope: "turnos y avisos", lane: "Soporte" },
];

const permissions = [
  { label: "Publicar evento", allowed: [0, 1] },
  { label: "Ver ventas", allowed: [0, 1, 3] },
  { label: "Validar QR", allowed: [1, 2] },
  { label: "Subir álbum", allowed: [1, 4] },
  { label: "Ver ranking", allowed: [0, 5] },
];

export const TeamRoles = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 md:py-32 lg:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_34%,rgba(198,121,196,0.07),transparent_30%)]" />

      <div className="relative mx-auto grid w-full max-w-[1220px] gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <NexusSectionHeader
            eyebrow="Team roles"
            title={
              <>
                Cada persona <span className="text-white/42">con su rol</span>
              </>
            }
            description="Owner, puerta, caja, fotógrafos y promotores trabajan dentro del mismo sistema, cada uno con los permisos que necesita. La organización deja de depender de una sola cuenta."
          />
        </div>

        <NexusReveal y={52}>
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025]">
            <div className="grid border-b border-white/10 p-4 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-white/36 sm:grid-cols-[1.2fr_0.8fr_1fr] sm:p-5">
              <span>Rol</span>
              <span className="hidden sm:block">Área</span>
              <span className="hidden sm:block">Función</span>
            </div>
            <div className="divide-y divide-white/10">
              {roles.map((role, index) => (
                <article
                  key={role.role}
                  className="grid gap-3 p-4 transition-colors duration-500 hover:bg-white/[0.035] sm:grid-cols-[1.2fr_0.8fr_1fr] sm:items-center sm:p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 font-mono text-xs text-white/42">
                      0{index + 1}
                    </span>
                    <p className="font-semibold text-white/86">{role.role}</p>
                  </div>
                  <p className="text-sm text-white/42">{role.lane}</p>
                  <p className="text-sm text-white/58">{role.scope}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-black/28 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-white/82">Mapa de permisos</p>
              <p className="text-xs uppercase tracking-[0.16em] text-white/34">
                acceso mínimo necesario
              </p>
            </div>
            <div className="space-y-3">
              {permissions.map((permission) => (
                <div
                  key={permission.label}
                  className="grid gap-3 rounded-[1.1rem] border border-white/10 bg-white/[0.025] p-3 md:grid-cols-[12rem_1fr] md:items-center"
                >
                  <p className="text-sm font-semibold text-white/70">
                    {permission.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role, index) => (
                      <span
                        key={`${permission.label}-${role.role}`}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em]",
                          permission.allowed.includes(index)
                            ? "bg-white text-black"
                            : "border border-white/10 text-white/22",
                        )}
                      >
                        {role.role.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </NexusReveal>
      </div>
    </section>
  );
};

export default TeamRoles;
