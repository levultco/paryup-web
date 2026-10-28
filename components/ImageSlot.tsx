// Hueco reservado para una imagen real. Sustituir por <Image> cuando haya captura.
export default function ImageSlot({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      data-slot
      className={`image-slot flex items-center justify-center rounded-[24px] p-6 text-center ${className}`}
    >
      <span className="rounded-full border border-line bg-bg/60 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-muted backdrop-blur">
        Imagen pendiente · {label}
      </span>
    </div>
  );
}
