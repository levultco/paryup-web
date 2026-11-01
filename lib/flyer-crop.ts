// Las portadas de eventos son flyers verticales 4:5 (como en el feed y el detalle).
export const FLYER_RATIO = 4 / 5;
export const FLYER_WIDTH = 1080;
export const FLYER_HEIGHT = 1350;

/**
 * Normaliza una imagen a 4:5. Si ya es casi 4:5 la recorta al centro; si no (p. ej. un
 * flyer 9:16 de stories), la encaja entera sobre su propio fondo desenfocado para no
 * perder texto. Nunca amplía por encima de su tamaño original.
 */
export async function normalizeFlyer(
  file: File,
): Promise<{ file: File; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = bitmap.width / bitmap.height;
    const near = Math.abs(ratio - FLYER_RATIO) / FLYER_RATIO < 0.03;
    const scale = Math.min(
      1,
      FLYER_WIDTH / bitmap.width,
      FLYER_HEIGHT / bitmap.height,
    );
    const outW = near
      ? Math.round(bitmap.width * scale)
      : Math.min(
          FLYER_WIDTH,
          Math.round(Math.max(bitmap.width, bitmap.height * FLYER_RATIO)),
        );
    const width = Math.max(1, outW);
    const height = Math.round(width / FLYER_RATIO);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);
    if (near) {
      ctx.drawImage(bitmap, 0, 0, width, height);
    } else {
      // Fondo: la propia imagen a cubrir, desenfocada y atenuada.
      const cover = Math.max(width / bitmap.width, height / bitmap.height);
      ctx.save();
      ctx.filter = "blur(40px) brightness(0.55)";
      ctx.drawImage(
        bitmap,
        (width - bitmap.width * cover) / 2,
        (height - bitmap.height * cover) / 2,
        bitmap.width * cover,
        bitmap.height * cover,
      );
      ctx.restore();
      const fit = Math.min(width / bitmap.width, height / bitmap.height);
      const w = bitmap.width * fit;
      const h = bitmap.height * fit;
      ctx.drawImage(bitmap, (width - w) / 2, (height - h) / 2, w, h);
    }
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) throw new Error("encode");
    const name = file.name.replace(/\.[^.]+$/, "") || "flyer";
    return {
      file: new File([blob], `${name}.jpg`, { type: "image/jpeg" }),
      width,
      height,
    };
  } finally {
    bitmap.close();
  }
}
