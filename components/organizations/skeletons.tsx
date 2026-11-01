// Skeletons con la forma real de cada pantalla del panel (mismas medidas que las cards finales).

const card = "rounded-[22px] bg-raised ring-1 ring-white/[0.08]";

export function Sk({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div aria-hidden className={`skeleton ${className}`} style={style} />;
}

function Wrap({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={className}
    >
      <span className="sr-only">…</span>
      {children}
    </div>
  );
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Cards de evento: portada 4:5, tres líneas y badge. */
export function EventCardsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Wrap className="flex flex-col gap-3">
      {range(rows).map((i) => (
        <div
          key={i}
          className={`flex items-center gap-4 p-3 pr-5 sm:gap-5 ${card}`}
        >
          <Sk className="h-[84px] w-[84px] shrink-0 rounded-2xl sm:h-24 sm:w-24" />
          <div className="flex flex-1 flex-col gap-2.5">
            <Sk className="h-5 w-2/5 rounded-full" />
            <Sk className="h-4 w-1/3 rounded-full" />
            <Sk className="h-3.5 w-1/4 rounded-full" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Sk className="h-6 w-24 rounded-full" />
            <Sk className="h-4 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </Wrap>
  );
}

/** Filas de plantilla: icono, nombre con chips, precio, interruptor y acciones. */
export function TemplateRowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Wrap className="flex flex-col gap-3">
      {range(rows).map((i) => (
        <div key={i} className={`flex items-center gap-4 p-4 sm:px-5 ${card}`}>
          <Sk className="h-12 w-12 shrink-0 rounded-2xl" />
          <div className="flex flex-1 flex-col gap-2.5">
            <Sk className="h-5 w-1/3 rounded-full" />
            <div className="flex gap-1.5">
              <Sk className="h-5 w-16 rounded-full" />
              <Sk className="h-5 w-14 rounded-full" />
              <Sk className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <Sk className="hidden h-6 w-14 rounded-full sm:block" />
          <Sk className="h-[31px] w-[51px] rounded-full" />
          <Sk className="hidden h-10 w-20 rounded-full sm:block" />
        </div>
      ))}
    </Wrap>
  );
}

/** Lista agrupada: avatar, dos líneas y un extremo. */
export function ListSkeleton({
  rows = 3,
  avatar = true,
}: {
  rows?: number;
  avatar?: boolean;
}) {
  return (
    <Wrap className={`divide-y divide-white/[0.07] overflow-hidden ${card}`}>
      {range(rows).map((i) => (
        <div key={i} className="flex items-center gap-3.5 px-4 py-3.5">
          {avatar ? <Sk className="h-10 w-10 shrink-0 rounded-full" /> : null}
          <div className="flex flex-1 flex-col gap-2">
            <Sk className="h-4 w-1/3 rounded-full" />
            <Sk className="h-3.5 w-1/4 rounded-full" />
          </div>
          <Sk className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </Wrap>
  );
}

/** Tarjetas de cifras (Resumen, ganancias). */
export function StatsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {range(count).map((i) => (
        <div
          key={i}
          role="status"
          aria-busy="true"
          className={`flex h-[108px] flex-col justify-between p-5 ${card}`}
        >
          <Sk className="h-3.5 w-24 rounded-full" />
          <Sk className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </>
  );
}

/** Tarjetas de ganancias por promotor. */
export function EarningsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <Wrap className="grid gap-3 lg:grid-cols-2">
      {range(count).map((i) => (
        <div key={i} className={`flex flex-col gap-5 p-5 ${card}`}>
          <div className="flex items-center gap-3">
            <Sk className="h-9 w-9 rounded-full" />
            <Sk className="h-4 w-32 rounded-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Sk className="h-3 w-24 rounded-full" />
            <Sk className="h-9 w-40 rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-white/[0.07] pt-4">
            {range(3).map((j) => (
              <div key={j} className="flex flex-col gap-2">
                <Sk className="h-3 w-14 rounded-full" />
                <Sk className="h-4 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </Wrap>
  );
}

/** Zona de reservados: cabecera con imagen y mesas. */
export function AreasSkeleton({ count = 2 }: { count?: number }) {
  return (
    <Wrap className="flex flex-col gap-4">
      {range(count).map((i) => (
        <div key={i} className={`p-5 sm:p-7 ${card}`}>
          <div className="flex items-center gap-3">
            <Sk className="h-12 w-12 rounded-2xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Sk className="h-5 w-40 rounded-full" />
              <Sk className="h-3.5 w-28 rounded-full" />
            </div>
            <Sk className="h-10 w-20 rounded-full" />
          </div>
          <div className="mt-5 divide-y divide-white/[0.07] overflow-hidden rounded-2xl bg-white/[0.04]">
            {range(2).map((j) => (
              <div key={j} className="flex items-center gap-3 px-4 py-3">
                <Sk className="h-4 w-4 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Sk className="h-4 w-32 rounded-full" />
                  <Sk className="h-3 w-44 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Wrap>
  );
}

/** Formulario de editor: secciones con etiqueta y campo. */
export function FormSkeleton({ sections = 2 }: { sections?: number }) {
  return (
    <Wrap className="flex flex-col gap-6">
      {range(sections).map((i) => (
        <div key={i} className={`flex flex-col gap-5 p-5 sm:p-7 ${card}`}>
          {range(i === 0 ? 3 : 2).map((j) => (
            <div key={j} className="flex flex-col gap-2">
              <Sk className="h-3.5 w-20 rounded-full" />
              <Sk
                className={`${j === 2 ? "h-20" : "h-11"} w-full rounded-xl`}
              />
            </div>
          ))}
        </div>
      ))}
    </Wrap>
  );
}

/** Gráfica de ventas: barras de alturas variadas. */
export function ChartSkeleton() {
  const heights = [40, 62, 48, 80, 58, 90, 70, 52, 84, 66, 76, 94];
  return (
    <Wrap className="flex h-56 items-end gap-2 px-1">
      {heights.map((h, i) => (
        <Sk
          key={i}
          className="flex-1 rounded-t-lg"
          style={{ height: `${h}%` }}
        />
      ))}
    </Wrap>
  );
}

/** Esqueleto del panel completo: barra lateral y contenido. */
export function ShellSkeletonView() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex flex-col gap-6 lg:flex-row lg:gap-12"
    >
      <div className="lg:w-64 lg:shrink-0">
        <div className={`flex items-center gap-3 p-4 ${card}`}>
          <Sk className="h-11 w-11 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Sk className="h-4 w-24 rounded-full" />
            <Sk className="h-3 w-16 rounded-full" />
          </div>
        </div>
        <div className="mt-3 hidden flex-col gap-2 lg:flex">
          {range(7).map((i) => (
            <Sk key={i} className="h-11 w-full rounded-full" />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-5">
        <Sk className="h-10 w-56 rounded-xl" />
        <Sk className="h-4 w-80 max-w-full rounded-full" />
        <EventCardsSkeleton rows={2} />
      </div>
    </div>
  );
}

/** Selector de organizaciones. */
export function HubSkeletonView() {
  return (
    <Wrap className="mx-auto flex w-full max-w-xl flex-col gap-3">
      <Sk className="h-9 w-64 rounded-xl" />
      {range(2).map((i) => (
        <div key={i} className={`flex items-center gap-4 p-4 ${card}`}>
          <Sk className="h-12 w-12 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Sk className="h-4 w-1/3 rounded-full" />
            <Sk className="h-3.5 w-1/4 rounded-full" />
          </div>
        </div>
      ))}
    </Wrap>
  );
}
