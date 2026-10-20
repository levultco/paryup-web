import NexusReveal from "@/components/common/nexusReveal";

export const FinalCta = () => {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-28 sm:px-6 md:py-40 lg:py-52">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <NexusReveal className="relative mx-auto flex w-full max-w-[1040px] flex-col items-center text-center">
        <p className="mb-6 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/42">
          Nexus para clubs
        </p>
        <h2
          className="max-w-[12ch] text-balance font-semibold leading-[0.88] tracking-[-0.065em] text-white"
          style={{ fontSize: "clamp(3.8rem, 9vw, 8.8rem)" }}
        >
          Empieza a mover tu club desde Nexus
        </h2>
        <p className="mt-8 max-w-[47ch] text-pretty text-base leading-relaxed text-white/58 md:text-xl">
          Da de alta tu organización y empieza a controlar eventos, entradas,
          equipo y público desde un solo lugar.
        </p>
        <button
          type="button"
          className="group mt-10 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-black transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.98] md:text-lg"
        >
          Dar de alta mi club
        </button>
      </NexusReveal>
    </section>
  );
};

export default FinalCta;
