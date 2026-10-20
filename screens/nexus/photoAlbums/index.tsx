import NexusReveal from "@/components/common/nexusReveal";
import NexusSectionHeader from "@/components/common/nexusSectionHeader";
import { cn } from "@/lib/utils";
import Image from "next/image";

const albumPhotos = [
  {
    src: "/album/club-selfie-1.jpg",
    alt: "Asistentes en una noche de club",
    className: "md:col-span-5 md:row-span-2",
  },
  {
    src: "/album/club-selfie-2.jpg",
    alt: "Foto de recuerdo de asistentes",
    className: "md:col-span-3 md:row-span-1",
  },
  {
    src: "/album/club-selfie-3.jpg",
    alt: "Grupo de asistentes posando en club",
    className: "md:col-span-4 md:row-span-2",
  },
  {
    src: "/hero/8.jpg",
    alt: "Luces nocturnas de evento",
    className: "md:col-span-3 md:row-span-1",
  },
];

export const PhotoAlbums = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 md:py-32 lg:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,rgba(198,121,196,0.07),transparent_28%)]" />

      <div className="relative mx-auto flex w-full max-w-[1260px] flex-col gap-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <NexusSectionHeader
            eyebrow="Photo albums"
            title={
              <>
                La noche no termina <span className="text-white/42">cuando cierra la sala</span>
              </>
            }
            description="Sube álbumes del evento, permite que los asistentes descarguen sus fotos y convierte cada noche en recuerdo de marca. El valor sigue vivo al día siguiente."
            titleClassName="max-w-[13ch]"
          />
          <NexusReveal delay={0.08} className="max-w-[36rem] lg:justify-self-end">
            <p className="text-2xl font-semibold leading-tight tracking-[-0.045em] text-white/78 md:text-4xl">
              Fotos que vuelven a abrir la app cuando la música ya paró.
            </p>
          </NexusReveal>
        </div>

        <NexusReveal y={58}>
          <div className="grid auto-rows-[13rem] grid-cols-1 gap-3 md:grid-cols-12 md:auto-rows-[12rem] lg:auto-rows-[14rem]">
            {albumPhotos.map((photo, index) => (
              <article
                key={photo.src}
                className={cn(
                  "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035]",
                  photo.className,
                )}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover opacity-76 grayscale transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.035] group-hover:opacity-95 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/18 to-black/72" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                  <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-white/52">
                    álbum / 0{index + 1}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-black">
                    descargar
                  </span>
                </div>
              </article>
            ))}
          </div>
        </NexusReveal>

        <NexusReveal delay={0.08} y={28}>
          <div className="flex flex-col justify-between gap-6 border-t border-white/10 pt-6 text-sm text-white/46 md:flex-row md:items-center">
            <p className="max-w-[46ch] leading-relaxed">
              La sala publica el álbum, el asistente vuelve para encontrar su foto
              y la noche gana segunda vida en perfiles sociales.
            </p>
            <p className="font-mono text-4xl font-semibold tracking-[-0.08em] text-white">
              2.8k <span className="text-base font-normal tracking-normal text-white/38">vistas en 48h</span>
            </p>
          </div>
        </NexusReveal>
      </div>
    </section>
  );
};

export default PhotoAlbums;
