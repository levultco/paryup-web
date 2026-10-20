import NexusReveal from "@/components/common/nexusReveal";
import { NexusChapter } from "@/components/nexus";

const promoters = [
  ["Marta", "MARTA24"],
  ["Leo", "LEOCLUB"],
  ["Nora", "NORA01"],
  ["Iván", "IVANVIP"],
];

export const Promoters = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 md:py-36 lg:py-48">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,176,5,0.065),transparent_34%)]" />
      <div className="relative mx-auto flex w-full max-w-[1240px] flex-col gap-14">
        <NexusChapter
          align="center"
          eyebrow="Promotores"
          title={
            <>
              Un evento oficial. <span className="text-white/42">Todos trabajando sobre él.</span>
            </>
          }
          description="Evita eventos duplicados y mide quién trae público de verdad. El usuario ve una noche real; el club ve la atribución de cada promotor."
          titleClassName="max-w-[15ch]"
        />

        <NexusReveal y={56}>
          <div className="relative min-h-[38rem] overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.025] p-5 sm:p-8">
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12 bg-background/90 p-5 text-center">
              <div className="flex h-full flex-col items-center justify-center rounded-full bg-white/[0.045]">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/38">
                  evento oficial
                </p>
                <p className="mt-2 max-w-[8ch] text-2xl font-semibold leading-none tracking-[-0.05em] text-white">
                  Midnight Affairs
                </p>
              </div>
            </div>

            {promoters.map(([name, code], index) => {
              const positions = [
                "left-[6%] top-[16%]",
                "right-[8%] top-[18%]",
                "left-[10%] bottom-[16%]",
                "right-[6%] bottom-[16%]",
              ];
              return (
                <article key={code} className={`absolute ${positions[index]} w-[14rem] rounded-[1.5rem] border border-white/10 bg-background/85 p-4`}>
                  <p className="text-sm font-semibold text-white/86">{name}</p>
                  <p className="mt-2 font-mono text-2xl font-semibold tracking-[-0.08em] text-white">{code}</p>
                  <p className="mt-2 text-xs text-white/40">link propio, atribución individual</p>
                </article>
              );
            })}

            <div className="absolute inset-x-[20%] top-1/2 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
            <div className="absolute inset-y-[22%] left-1/2 w-px bg-gradient-to-b from-transparent via-white/18 to-transparent" />
          </div>
        </NexusReveal>
      </div>
    </section>
  );
};

export default Promoters;
