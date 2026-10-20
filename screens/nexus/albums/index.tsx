import NexusReveal from "@/components/common/nexusReveal";
import { NexusChapter } from "@/components/nexus";
import { cn } from "@/lib/utils";
import Image from "next/image";

const photos = [
  ["/album/club-selfie-1.jpg", "Asistentes en una noche de club", "md:col-span-5 md:row-span-2"],
  ["/album/club-selfie-2.jpg", "Foto de recuerdo de asistentes", "md:col-span-3"],
  ["/album/club-selfie-3.jpg", "Grupo de asistentes posando", "md:col-span-4 md:row-span-2"],
  ["/hero/8.jpg", "Luces nocturnas de evento", "md:col-span-3"],
];

export const Albums = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 md:py-36 lg:py-48">
      <div className="relative mx-auto flex w-full max-w-[1260px] flex-col gap-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <NexusChapter
            eyebrow="Álbumes"
            title={
              <>
                La noche no termina <span className="text-white/42">al cerrar la puerta</span>
              </>
            }
            description="Publica álbumes, activa recuerdos y mantén a tu público conectado después del evento. ParyUp no termina cuando se compra la entrada."
            titleClassName="max-w-[13ch]"
          />
          <NexusReveal delay={0.08} className="max-w-[34rem] lg:justify-self-end">
            <p className="text-2xl font-semibold leading-tight tracking-[-0.045em] text-white/76 md:text-4xl">
              Fotos que vuelven a abrir la app cuando la música ya paró.
            </p>
          </NexusReveal>
        </div>
        <NexusReveal y={56}>
          <div className="grid auto-rows-[13rem] grid-cols-1 gap-3 md:grid-cols-12 md:auto-rows-[12rem] lg:auto-rows-[14rem]">
            {photos.map(([src, alt, className], index) => (
              <article key={src} className={cn("group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025]", className)}>
                <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover opacity-78 grayscale transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.035] group-hover:opacity-95 group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/18 to-black/72" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                  <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-white/52">álbum / 0{index + 1}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-black">ver álbum</span>
                </div>
              </article>
            ))}
          </div>
        </NexusReveal>
      </div>
    </section>
  );
};

export default Albums;
