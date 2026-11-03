import type { ReactNode } from "react";

/**
 * iPhone con marco de titanio, igual que el de la portada de la home: borde metálico fino,
 * bisel negro, isla dinámica y un reflejo suave en el cristal. Se corta por abajo.
 */
export default function PhoneFrame({
  children,
  className = "",
  glow = true,
  fill = false,
}: {
  children: ReactNode;
  className?: string;
  /** Halo blanco alrededor del móvil (el de la home). Se apaga dentro de contenedores que recortan. */
  glow?: boolean;
  /** Se estira para llenar la altura que le dé el contenedor (el contenido se recorta por abajo). */
  fill?: boolean;
}) {
  return (
    <div
      className={`rounded-t-[var(--pr,64px)] bg-[linear-gradient(135deg,#a1a1a6_0%,#3b3b3f_18%,#1a1a1c_48%,#47474b_78%,#9c9ca1_100%)] p-[3px] ${glow ? "shadow-[0_0_120px_-10px_rgba(255,255,255,0.16)]" : ""} ${fill ? "flex flex-col" : ""} ${className}`}
    >
      <div className={`rounded-t-[calc(var(--pr,64px)-3px)] bg-black p-[9px] pb-0 ${fill ? "flex flex-1 flex-col" : ""}`}>
        <div className={`relative overflow-hidden rounded-t-[calc(var(--pr,64px)-12px)] ${fill ? "flex-1" : ""}`}>
          {children}
          <div
            aria-hidden
            className="absolute left-1/2 top-[12px] h-[28px] w-[29%] -translate-x-1/2 rounded-full bg-black"
          >
            <span className="absolute right-[12%] top-1/2 size-[10px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#2b3a66,#07090f_70%)] ring-1 ring-white/10" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_28%,transparent_45%)]"
          />
        </div>
      </div>
    </div>
  );
}
