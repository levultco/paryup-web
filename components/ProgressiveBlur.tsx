// Desenfoque progresivo: capas apiladas con backdrop-filter, cada una con su máscara y más blur que la anterior.
// Muchas capas con el blur creciendo de forma geométrica para que no se note dónde empieza.
const LAYERS = 12;
const MIN_BLUR = 0.05; // rem
const GROWTH = 1.4;

const STEP = 100 / LAYERS;
const clamp = (n: number) => Math.min(100, n);

// Cada capa aparece, se mantiene dos pasos y se apaga; la última no se apaga.
const FINE = Array.from({ length: LAYERS }, (_, i) => {
  const a = clamp(i * STEP);
  const b = clamp((i + 1) * STEP);
  const c = clamp((i + 2) * STEP);
  const d = clamp((i + 3) * STEP);
  const stops = [`transparent ${a}%`, `black ${b}%`, `black ${c}%`];
  if (d > c) stops.push(`transparent ${d}%`);
  return {
    mask: stops.join(", "),
    blur: `${(MIN_BLUR * Math.pow(GROWTH, i)).toFixed(3)}rem`,
  };
});

const layer = (mask: string, blur: string) => ({
  position: "absolute" as const,
  inset: 0,
  maskImage: `linear-gradient(${mask})`,
  WebkitMaskImage: `linear-gradient(${mask})`,
  backdropFilter: `blur(${blur})`,
  WebkitBackdropFilter: `blur(${blur})`,
});

export default function ProgressiveBlur({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <div className="absolute inset-0">
        {FINE.map((l) => (
          <div key={l.mask} style={layer(l.mask, l.blur)} />
        ))}
        <div style={layer("transparent 45%, black 100%", "1.6rem")} />
      </div>
      {/* Velo oscuro muy suave: ayuda a que el borde de abajo se funda, sin marcar una banda */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.22)_45%,transparent_100%)]" />
    </div>
  );
}
