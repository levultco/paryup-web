import Image from "next/image";

// Fondo sacado del propio contenido, como en la app: la imagen ampliada y muy
// desenfocada, fundida a negro hacia abajo. Sin imagen no pinta nada (fondo negro).
export default function ContentBackdrop({
  src,
  className = "",
}: {
  src?: string;
  className?: string;
}) {
  if (!src) return null;
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="50vw"
        className="scale-150 object-cover opacity-70 blur-[80px] saturate-150"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
    </div>
  );
}
