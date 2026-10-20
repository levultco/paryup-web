import NexusReveal from "@/components/common/nexusReveal";
import NexusSectionHeader from "@/components/common/nexusSectionHeader";

const liveEntries = [
  { time: "00:17", label: "QR válido", detail: "General anticipada" },
  { time: "00:18", label: "VIP confirmado", detail: "Mesa Alta 04" },
  { time: "00:19", label: "Entrada usada", detail: "revisar documento" },
  { time: "00:20", label: "Lista validada", detail: "hasta 01:00" },
];

const qrCells = [
  0, 1, 2, 4, 5, 6, 8, 12, 13, 15, 16, 18, 20, 22, 24, 25, 28, 30, 32, 34,
  36, 37, 38, 40, 42, 43, 45, 46, 48,
];

const QrMark = () => (
  <div className="grid h-40 w-40 grid-cols-7 gap-1 rounded-[1.35rem] bg-white p-3 shadow-[0_28px_100px_rgba(255,255,255,0.13)]">
    {Array.from({ length: 49 }).map((_, index) => (
      <span
        key={index}
        className={
          qrCells.includes(index)
            ? "rounded-[0.22rem] bg-black"
            : "rounded-[0.22rem] bg-transparent"
        }
      />
    ))}
  </div>
);

export const AccessControl = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 md:py-32 lg:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(145,255,244,0.065),transparent_26%)]" />

      <div className="relative mx-auto grid w-full max-w-[1220px] gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <NexusSectionHeader
          eyebrow="Access control"
          title={
            <>
              Puerta, QR y aforo <span className="text-white/42">bajo control</span>
            </>
          }
          description="La puerta no puede depender de capturas ni listas rotas. Nexus valida entradas, marca incidencias y enseña el ritmo real de acceso mientras la sala se llena."
        />

        <NexusReveal y={54}>
          <div className="relative min-h-[42rem] overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#070708] p-4 sm:p-6 md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_38%,rgba(255,255,255,0.14),transparent_31%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/[0.045] to-transparent" />

            <div className="relative z-10 grid min-h-[36rem] gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col justify-between rounded-[1.7rem] border border-white/10 bg-black/40 p-5">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/38">
                    Acceso principal
                  </p>
                  <p className="mt-4 font-mono text-6xl font-semibold leading-none tracking-[-0.1em] text-white md:text-7xl">
                    413
                  </p>
                  <p className="mt-2 text-sm text-white/42">personas dentro de 620</p>
                </div>

                <div className="mt-10">
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <p className="text-sm font-semibold text-white/78">
                        Ritmo de entrada
                      </p>
                      <p className="mt-1 text-xs text-white/38">últimos 15 minutos</p>
                    </div>
                    <p className="font-mono text-4xl font-semibold tracking-[-0.08em] text-emerald-100">
                      38/min
                    </p>
                  </div>
                  <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-white/70 to-emerald-200" />
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-[1fr_0.9fr] lg:grid-cols-1">
                <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-[1.7rem] border border-white/10 bg-white/[0.035] p-5 text-center">
                  <QrMark />
                  <div className="mt-6 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-4 py-2 text-sm font-semibold text-emerald-100">
                    QR válido · entrada general
                  </div>
                  <p className="mt-3 font-mono text-2xl font-semibold tracking-[-0.08em] text-white">
                    A92P-18K
                  </p>
                </div>

                <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.035] p-5">
                  <p className="text-sm font-semibold text-white/84">Actividad en puerta</p>
                  <div className="mt-4 divide-y divide-white/10">
                    {liveEntries.map((entry) => (
                      <div
                        key={`${entry.time}-${entry.label}`}
                        className="grid grid-cols-[3.2rem_1fr] gap-3 py-3"
                      >
                        <p className="font-mono text-xs text-white/34">{entry.time}</p>
                        <div>
                          <p className="text-sm font-semibold text-white/76">
                            {entry.label}
                          </p>
                          <p className="mt-1 text-xs text-white/38">{entry.detail}</p>
                        </div>
                      </div>
                    ))}
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

export default AccessControl;
