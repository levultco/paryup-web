import NexusReveal from "@/components/common/nexusReveal";
import { NexusChapter } from "@/components/nexus";
import Image from "next/image";

const steps = ["Compra", "Entrada", "QR", "Puerta", "Validado"];

export const AccessControl = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 md:py-32 lg:py-44">
      <div className="relative mx-auto grid w-full max-w-[1220px] gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <NexusChapter
          eyebrow="Accesos"
          title={
            <>
              De la compra a la puerta, <span className="text-white/42">sin líos</span>
            </>
          }
          description="Cada entrada queda lista para validar en segundos. Menos listas manuales, menos dudas, más control en la puerta."
        />

        <NexusReveal y={52}>
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <div className="grid gap-4 md:grid-cols-5">
              {steps.map((step, index) => (
                <div key={step} className="relative rounded-[1.4rem] border border-white/10 bg-background/70 p-4 text-center">
                  {index < steps.length - 1 ? (
                    <span className="absolute -right-3 top-1/2 hidden h-px w-6 bg-white/18 md:block" />
                  ) : null}
                  <p className="font-mono text-xs text-white/32">0{index + 1}</p>
                  <p className="mt-8 font-semibold text-white/78">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-[23rem] overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/45">
                <Image src="/qr/qr.png" alt="QR de entrada para validar en puerta" fill sizes="420px" className="object-cover opacity-70 grayscale" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/15 to-black/72" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-sm font-semibold text-white">Entrada lista para puerta</p>
                  <p className="mt-1 text-sm text-white/44">QR único, validación rápida, acceso registrado.</p>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-[1.7rem] border border-white/10 bg-black/35 p-5">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/36">
                    Puerta ahora
                  </p>
                  <p className="mt-5 font-mono text-6xl font-semibold leading-none tracking-[-0.1em] text-white">
                    38/min
                  </p>
                  <p className="mt-2 text-sm text-white/42">ritmo de entrada en el último tramo</p>
                </div>
                <div className="mt-10 space-y-3 border-t border-white/10 pt-5 text-sm text-white/52">
                  <p>Entrada válida registrada.</p>
                  <p>Entrada usada marcada para revisión.</p>
                  <p>Aforo actualizado sin listas manuales.</p>
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
