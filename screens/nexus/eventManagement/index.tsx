import NexusProductFrame from "@/components/common/nexusProductFrame";
import NexusReveal from "@/components/common/nexusReveal";
import NexusSectionHeader from "@/components/common/nexusSectionHeader";

const ticketRows = [
  { name: "General anticipada", price: "18€", capacity: "360", sold: "312" },
  { name: "VIP + mesa", price: "120€", capacity: "24", sold: "18" },
  { name: "Lista hasta 01:00", price: "0€", capacity: "180", sold: "148" },
];

export const EventManagement = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 md:py-32 lg:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_14%,rgba(255,127,17,0.07),transparent_28%)]" />

      <div className="relative mx-auto flex w-full max-w-[1240px] flex-col gap-12">
        <NexusSectionHeader
          align="center"
          eyebrow="Event management"
          title={
            <>
              Crea eventos que <span className="text-white/42">se venden solos</span>
            </>
          }
          description="Monta la noche con horarios, aforo, entradas, listas y publicación conectada con la app de usuarios. La venta empieza antes de que subas la persiana."
          titleClassName="max-w-[12.5ch]"
        />

        <NexusReveal y={54}>
          <NexusProductFrame
            title="Editor de evento"
            subtitle="Sala Bruma / publicación conectada a ParyUp"
            status="Borrador listo"
            bodyClassName="p-0"
          >
            <div className="grid min-h-[42rem] overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
              <div className="border-b border-white/10 p-5 sm:p-7 lg:border-b-0 lg:border-r">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/36">
                      Evento principal
                    </p>
                    <h3 className="mt-4 max-w-[10ch] text-5xl font-semibold leading-[0.9] tracking-[-0.08em] text-white md:text-7xl">
                      Midnight Affairs
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div>
                      <p className="text-white/32">Fecha</p>
                      <p className="mt-1 font-semibold text-white/82">Vie 14 jun</p>
                    </div>
                    <div>
                      <p className="text-white/32">Apertura</p>
                      <p className="mt-1 font-semibold text-white/82">23:30</p>
                    </div>
                    <div>
                      <p className="text-white/32">Aforo</p>
                      <p className="mt-1 font-semibold text-white/82">620 pax</p>
                    </div>
                    <div>
                      <p className="text-white/32">Estado</p>
                      <p className="mt-1 font-semibold text-emerald-100/82">venta activa</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-white/10 pb-3 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white/34">
                    <span>Entrada</span>
                    <span className="text-right">Precio</span>
                    <span className="text-right">Cupo</span>
                    <span className="text-right">Vendidas</span>
                  </div>
                  <div className="divide-y divide-white/10">
                    {ticketRows.map((ticket) => (
                      <div
                        key={ticket.name}
                        className="grid grid-cols-[1fr_auto_auto_auto] gap-3 py-4 text-sm"
                      >
                        <span className="font-semibold text-white/82">{ticket.name}</span>
                        <span className="font-mono text-white/72">{ticket.price}</span>
                        <span className="font-mono text-white/46">{ticket.capacity}</span>
                        <span className="font-mono text-white">{ticket.sold}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/42">
                  <span className="rounded-full border border-white/10 px-3 py-2">VIP</span>
                  <span className="rounded-full border border-white/10 px-3 py-2">lista</span>
                  <span className="rounded-full border border-white/10 px-3 py-2">venta anticipada</span>
                  <span className="rounded-full border border-white/10 px-3 py-2">QR generado</span>
                </div>
              </div>

              <div className="relative flex items-center justify-center overflow-hidden bg-[#080809] p-6 sm:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.14),transparent_34%)]" />
                <div className="relative w-full max-w-[20rem] rounded-[2rem] border border-white/12 bg-black p-3 shadow-[0_24px_90px_rgba(0,0,0,0.42)]">
                  <div className="min-h-[25rem] overflow-hidden rounded-[1.45rem] bg-[linear-gradient(135deg,#3a332f,#090909_44%,#5a271d)] p-5">
                    <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-white/46">
                      Bruma Club
                    </p>
                    <h4 className="mt-28 max-w-[8ch] text-5xl font-semibold leading-[0.86] tracking-[-0.08em] text-white">
                      Midnight Affairs
                    </h4>
                    <p className="mt-4 text-sm text-white/62">Vie 14 jun · 23:30</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3 text-center">
                    <div className="rounded-[1rem] bg-white/[0.055] p-3">
                      <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/34">
                        desde
                      </p>
                      <p className="mt-1 font-mono text-2xl font-semibold tracking-[-0.08em] text-white">
                        18€
                      </p>
                    </div>
                    <div className="rounded-[1rem] bg-white/[0.055] p-3">
                      <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/34">
                        aforo
                      </p>
                      <p className="mt-1 font-mono text-2xl font-semibold tracking-[-0.08em] text-white">
                        620
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </NexusProductFrame>
        </NexusReveal>
      </div>
    </section>
  );
};

export default EventManagement;
